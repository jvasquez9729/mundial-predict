import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'
import { handleApiError } from '@/lib/utils/api-error'
import { logApiError } from '@/lib/utils/logger'
import { validatePagination } from '@/lib/utils/pagination'

const CACHE_TTL_MS = 45_000

type LeaderboardEntry = { user_id: string; [k: string]: unknown }
const leaderboardCache = new Map<string, { data: { leaderboard: LeaderboardEntry[]; totalParticipants: number; prizePool: unknown }; expires: number }>()

function getLeaderboardCached() {
  const ent = leaderboardCache.get('leaderboard')
  if (!ent || Date.now() >= ent.expires) return null
  return ent.data
}
function setLeaderboardCached(data: { leaderboard: LeaderboardEntry[]; totalParticipants: number; prizePool: unknown }) {
  leaderboardCache.set('leaderboard', { data, expires: Date.now() + CACHE_TTL_MS })
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    const { searchParams } = new URL(request.url)
    
    // Validar parámetros de paginación
    let limit: number
    let offset: number
    try {
      const pagination = validatePagination(
        searchParams.get('limit'),
        searchParams.get('offset')
      )
      limit = pagination.limit
      offset = pagination.offset
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : 'Parámetros de paginación inválidos' },
        { status: 400 }
      )
    }

    const cached = getLeaderboardCached()
    if (cached) {
      const leaderboard = cached.leaderboard
      const paginatedLeaderboard = leaderboard.slice(offset, offset + limit)
      const leaderboardWithPositions = paginatedLeaderboard.map((entry, index) => ({
        ...entry,
        posicion: offset + index + 1,
      }))
      let userPosition: number | null = null
      let userData: unknown = null
      if (session) {
        const userIndex = leaderboard.findIndex((e) => e.user_id === session.userId)
        if (userIndex >= 0) {
          userPosition = userIndex + 1
          userData = leaderboardWithPositions.find((e) => e.user_id === session.userId)
            ?? { ...leaderboard[userIndex], posicion: userPosition }
        }
      }
      return NextResponse.json({
        success: true,
        leaderboard: leaderboardWithPositions,
        mi_posicion: userPosition ?? 0,
        mi_datos: userData,
        total_participantes: cached.totalParticipants,
        pozo: cached.prizePool ?? { pozo_total: 0, premio_primero: 0, premio_exactos: 0, premio_grupos: 0 },
        pagination: { offset, limit, has_more: leaderboard.length > offset + limit },
      })
    }

    const supabase = createServiceClient()

    const leaderboardCols = 'user_id, nombre_completo, puntos_totales, marcadores_exactos, predicciones_correctas, total_predicciones'
    let { data: leaderboard, error: leaderboardError } = await supabase
      .from('leaderboard')
      .select(leaderboardCols)
      .order('puntos_totales', { ascending: false })

    // Si hay error con la vista, calcular el leaderboard manualmente
    if (leaderboardError) {
      logApiError('/api/leaderboard (vista)', leaderboardError, { 
        message: 'Error al obtener vista leaderboard, calculando manualmente',
        errorCode: leaderboardError.code,
        userId: session?.userId 
      })
      
      // Calcular leaderboard desde la tabla de users y predictions
      const [usersRes, predictionsRes] = await Promise.all([
        supabase.from('users').select('id, nombre_completo').eq('es_admin', false),
        supabase.from('predictions').select('user_id, puntos_obtenidos, es_exacto'),
      ])
      const { data: users, error: usersError } = usersRes
      const { data: predictions, error: predictionsError } = predictionsRes

      if (usersError) {
        logApiError('/api/leaderboard', usersError)
        throw new Error('Error al obtener usuarios')
      }

      if (predictionsError) {
        logApiError('/api/leaderboard', predictionsError)
        // Continuar sin predicciones si hay error
      }

      // Calcular estadísticas por usuario
      const userStats = new Map<string, {
        user_id: string
        nombre_completo: string
        puntos_totales: number
        marcadores_exactos: number
        predicciones_correctas: number
        total_predicciones: number
      }>()

      users?.forEach(user => {
        userStats.set(user.id, {
          user_id: user.id,
          nombre_completo: user.nombre_completo,
          puntos_totales: 0,
          marcadores_exactos: 0,
          predicciones_correctas: 0,
          total_predicciones: 0,
        })
      })

      predictions?.forEach(pred => {
        const stats = userStats.get(pred.user_id)
        if (stats) {
          stats.puntos_totales += pred.puntos_obtenidos || 0
          stats.total_predicciones += 1
          if (pred.es_exacto) {
            stats.marcadores_exactos += 1
          }
          if (pred.puntos_obtenidos && pred.puntos_obtenidos > 0) {
            stats.predicciones_correctas += 1
          }
        }
      })

      leaderboard = Array.from(userStats.values())
        .sort((a, b) => b.puntos_totales - a.puntos_totales)
      
      // Si no hay usuarios, devolver array vacío
      if (!leaderboard || leaderboard.length === 0) {
        leaderboard = []
      }
      
      leaderboardError = null
    }

    // Si aún hay error y no hay datos, devolver error
    if (leaderboardError && !leaderboard) {
      logApiError('/api/leaderboard', leaderboardError, { userId: session?.userId })
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al obtener clasificación',
          leaderboard: [],
          total_participantes: 0
        },
        { status: 500 }
      )
    }

    // Si no hay datos, devolver array vacío
    if (!leaderboard) {
      leaderboard = []
    }

    // Aplicar paginación después de ordenar
    const paginatedLeaderboard = leaderboard.slice(offset, offset + limit)

    // Agregar posición a cada entrada (basada en el ranking global, no en la paginación)
    const leaderboardWithPositions = paginatedLeaderboard.map((entry, index) => ({
      ...entry,
      posicion: offset + index + 1,
    }))

    let userPosition: number | null = null
    let userData = null

    // Solo obtener datos del usuario si está autenticado
    if (session) {
      // Calcular posición del usuario en el ranking completo (no paginado)
      const userIndex = leaderboard.findIndex(e => e.user_id === session.userId)
      if (userIndex >= 0) {
        userPosition = userIndex + 1
        // Si el usuario está en la página actual, usar esos datos
        userData = leaderboardWithPositions.find(e => e.user_id === session.userId)
        
        // Si no está en la página actual, obtener sus datos completos
        if (!userData && userPosition) {
          userData = {
            ...leaderboard[userIndex],
            posicion: userPosition,
          }
        }
      }
    }

    const usersCountPromise = supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('es_admin', false)
    const prizePoolPromise = supabase
      .from('prize_pool')
      .select('pozo_total, premio_primero, premio_exactos, premio_grupos')
      .maybeSingle()

    const [usersCountRes, prizePoolRes] = await Promise.all([
      usersCountPromise,
      prizePoolPromise,
    ])
    const totalParticipants = usersCountRes.count ?? 0
    const prizePool = prizePoolRes.data ?? null

    setLeaderboardCached({ leaderboard: leaderboard ?? [], totalParticipants, prizePool })

    return NextResponse.json({
      success: true,
      leaderboard: leaderboardWithPositions,
      mi_posicion: userPosition || 0,
      mi_datos: userData,
      total_participantes: totalParticipants || 0,
      pozo: prizePool || {
        pozo_total: 0,
        premio_primero: 0,
        premio_exactos: 0,
        premio_grupos: 0,
      },
      pagination: {
        offset,
        limit,
        has_more: (leaderboard || []).length > offset + limit,
      },
    })

  } catch (error) {
    return handleApiError('/api/leaderboard', error)
  }
}
