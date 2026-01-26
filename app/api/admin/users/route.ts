import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/session'
import { handleApiError } from '@/lib/utils/api-error'
import { logApiError } from '@/lib/utils/logger'
import { validatePagination } from '@/lib/utils/pagination'

const CACHE_TTL_MS = 45_000
const matchStatsCache = new Map<string, { data: { totalPartidos: number; partidosFinalizados: number }; expires: number }>()

function getMatchStatsCached() {
  const ent = matchStatsCache.get('match-stats')
  if (!ent || Date.now() >= ent.expires) return null
  return ent.data
}
function setMatchStatsCached(data: { totalPartidos: number; partidosFinalizados: number }) {
  matchStatsCache.set('match-stats', { data, expires: Date.now() + CACHE_TTL_MS })
}

/**
 * GET - Obtener lista completa de usuarios con todos sus datos
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const metadata = searchParams.get('metadata') === '1'

    // Validar parámetros de paginación
    let limit: number
    let offset: number
    try {
      const pagination = validatePagination(
        searchParams.get('limit'),
        searchParams.get('offset'),
        200 // Límite máximo más alto para admin
      )
      limit = pagination.limit
      offset = pagination.offset
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : 'Parámetros de paginación inválidos' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()
    const userCols = 'id, nombre_completo, email, cedula, celular, es_admin, creado_en'
    const searchFilter = `nombre_completo.ilike.%${search}%,email.ilike.%${search}%,cedula.ilike.%${search}%,celular.ilike.%${search}%`

    let usersQuery = supabase
      .from('users')
      .select(userCols)
      .order('creado_en', { ascending: false })
      .range(offset, offset + limit - 1)
    let countQuery = supabase.from('users').select('id', { count: 'exact', head: true })
    const lbQuery = supabase
      .from('leaderboard')
      .select('user_id, puntos_totales, marcadores_exactos, predicciones_correctas, total_predicciones')
      .order('puntos_totales', { ascending: false })
    if (search) {
      usersQuery = usersQuery.or(searchFilter)
      countQuery = countQuery.or(searchFilter)
    }

    const [usersRes, countRes, lbRes] = await Promise.all([
      usersQuery,
      countQuery,
      lbQuery,
    ])
    const { data: users, error } = usersRes
    const { count } = countRes
    const { data: lb, error: lbErr } = lbRes

    if (error) {
      logApiError('/api/admin/users', error)
      return NextResponse.json(
        { success: false, error: 'Error al obtener usuarios' },
        { status: 500 }
      )
    }

    type LeaderboardRow = { user_id: string; puntos_totales: number; marcadores_exactos: number; predicciones_correctas: number; total_predicciones: number }
    const lbMap = new Map<string, { puntos_totales: number; marcadores_exactos: number; predicciones_correctas: number; total_predicciones: number; posicion: number }>()
    if (!lbErr && lb) {
      const leaderboard = lb as LeaderboardRow[]
      leaderboard.forEach((row, i) => {
        lbMap.set(row.user_id, {
          puntos_totales: row.puntos_totales,
          marcadores_exactos: row.marcadores_exactos,
          predicciones_correctas: row.predicciones_correctas,
          total_predicciones: row.total_predicciones,
          posicion: i + 1,
        })
      })
    }

    type UserRow = { id: string; nombre_completo: string; email: string; cedula: string; celular: string; es_admin: boolean; creado_en: string }
    const enrichedUsers = (users || []).map((u: UserRow) => {
      const extra = lbMap.get(u.id)
      return {
        ...u,
        puntos_totales: extra?.puntos_totales ?? 0,
        marcadores_exactos: extra?.marcadores_exactos ?? 0,
        predicciones_correctas: extra?.predicciones_correctas ?? 0,
        total_predicciones: extra?.total_predicciones ?? 0,
        posicion: extra?.posicion ?? undefined,
      }
    })

    let matchStats: { totalPartidos: number; partidosFinalizados: number } | undefined
    if (metadata) {
      const cached = getMatchStatsCached()
      if (cached) {
        matchStats = cached
      } else {
        const [totalRes, finalRes] = await Promise.all([
          supabase.from('matches').select('id', { count: 'exact', head: true }),
          supabase.from('matches').select('id', { count: 'exact', head: true }).eq('estado', 'finalizado'),
        ])
        matchStats = {
          totalPartidos: totalRes.count ?? 0,
          partidosFinalizados: finalRes.count ?? 0,
        }
        setMatchStatsCached(matchStats)
      }
    }

    const res: { success: true; users: unknown[]; total: number; pagination: { limit: number; offset: number; hasMore: boolean }; matchStats?: { totalPartidos: number; partidosFinalizados: number } } = {
      success: true,
      users: enrichedUsers,
      total: count || 0,
      pagination: {
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    }
    if (matchStats) res.matchStats = matchStats

    return NextResponse.json(res)

  } catch (error) {
    return handleApiError('/api/admin/users', error)
  }
}
