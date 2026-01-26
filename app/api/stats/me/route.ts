import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'
import { handleApiError } from '@/lib/utils/api-error'
import { logApiError } from '@/lib/utils/logger'

type LeaderboardRow = {
  user_id: string
  nombre_completo: string
  puntos_totales: number
  marcadores_exactos: number
  predicciones_correctas: number
  total_predicciones: number
}

/**
 * GET /api/stats/me
 * Estadísticas del usuario logueado. Auth obligatoria.
 * Reutiliza la lógica de ranking de /api/leaderboard (vista o fallback manual).
 * Calcula racha: predicciones ordenadas por match fecha_hora DESC, consecutivos con puntos > 0.
 */
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      )
    }

    const supabase = createServiceClient()
    const leaderboardCols =
      'user_id, nombre_completo, puntos_totales, marcadores_exactos, predicciones_correctas, total_predicciones'
    let { data: leaderboard, error: leaderboardError } = await supabase
      .from('leaderboard')
      .select(leaderboardCols)
      .order('puntos_totales', { ascending: false })

    if (leaderboardError) {
      logApiError('/api/stats/me (vista leaderboard)', leaderboardError, {
        message: 'Fallback manual desde users + predictions',
        userId: session.userId,
      })
      const [usersRes, predictionsRes] = await Promise.all([
        supabase.from('users').select('id, nombre_completo').eq('es_admin', false),
        supabase.from('predictions').select('user_id, puntos_obtenidos, es_exacto'),
      ])
      const { data: users, error: usersError } = usersRes
      const { data: predictions, error: predictionsError } = predictionsRes

      if (usersError) {
        logApiError('/api/stats/me', usersError)
        throw new Error('Error al obtener usuarios')
      }
      if (predictionsError) {
        logApiError('/api/stats/me', predictionsError)
      }

      const userStats = new Map<string, LeaderboardRow>()
      users?.forEach((u: { id: string; nombre_completo: string }) => {
        userStats.set(u.id, {
          user_id: u.id,
          nombre_completo: u.nombre_completo,
          puntos_totales: 0,
          marcadores_exactos: 0,
          predicciones_correctas: 0,
          total_predicciones: 0,
        })
      })
      predictions?.forEach((p: { user_id: string; puntos_obtenidos: number; es_exacto: boolean }) => {
        const stats = userStats.get(p.user_id)
        if (stats) {
          stats.puntos_totales += p.puntos_obtenidos ?? 0
          stats.total_predicciones += 1
          if (p.es_exacto) stats.marcadores_exactos += 1
          if ((p.puntos_obtenidos ?? 0) > 0) stats.predicciones_correctas += 1
        }
      })
      leaderboard = Array.from(userStats.values()).sort(
        (a, b) => b.puntos_totales - a.puntos_totales
      ) as LeaderboardRow[]
    }

    if (!leaderboard) {
      leaderboard = []
    }

    const { count } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('es_admin', false)
    const total_participantes = count ?? 0

    const userIndex = (leaderboard as LeaderboardRow[]).findIndex(
      (e) => e.user_id === session.userId
    )
    const posicion = userIndex >= 0 ? userIndex + 1 : 0
    const userRow = userIndex >= 0 ? (leaderboard as LeaderboardRow[])[userIndex] : null

    const puntos_totales = userRow?.puntos_totales ?? 0
    const predicciones_correctas = userRow?.predicciones_correctas ?? 0
    const total_predicciones = userRow?.total_predicciones ?? 0
    const precision =
      total_predicciones > 0
        ? Math.round((100 * predicciones_correctas) / total_predicciones)
        : 0

    let racha_actual = 0
    const { data: preds } = await supabase
      .from('predictions')
      .select('match_id, puntos_obtenidos')
      .eq('user_id', session.userId)
    const matchIds = (preds ?? []).map((p: { match_id: string }) => p.match_id)
    if (matchIds.length > 0) {
      const { data: matches } = await supabase
        .from('matches')
        .select('id, fecha_hora')
        .in('id', matchIds)
      const fechaMap = new Map(
        (matches ?? []).map((m: { id: string; fecha_hora: string }) => [m.id, m.fecha_hora])
      )
      const list = (preds ?? [])
        .map((p: { match_id: string; puntos_obtenidos: number }) => ({
          puntos: p.puntos_obtenidos ?? 0,
          fecha: fechaMap.get(p.match_id),
        }))
        .filter((x): x is { puntos: number; fecha: string } => x.fecha != null)
      list.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      for (const x of list) {
        if (x.puntos > 0) racha_actual += 1
        else break
      }
    }

    return NextResponse.json({
      success: true,
      posicion,
      total_participantes,
      puntos_totales,
      predicciones_correctas,
      total_predicciones,
      precision,
      racha_actual,
    })
  } catch (error) {
    return handleApiError('/api/stats/me', error)
  }
}
