import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { handleApiError } from '@/lib/utils/api-error'
import { logger } from '@/lib/utils/logger'

function calculatePoints(
  predLocal: number,
  predVisitante: number,
  realLocal: number,
  realVisitante: number
): { puntos: number; esExacto: boolean } {
  // Marcador exacto: 3 puntos
  if (predLocal === realLocal && predVisitante === realVisitante) {
    return { puntos: 3, esExacto: true }
  }

  // Acertó resultado (ganador o empate): 1 punto
  const predResultado = Math.sign(predLocal - predVisitante)
  const realResultado = Math.sign(realLocal - realVisitante)

  if (predResultado === realResultado) {
    return { puntos: 1, esExacto: false }
  }

  // No acertó: 0 puntos
  return { puntos: 0, esExacto: false }
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('match_id')

    const supabase = createServiceClient()

    // Si se especifica un partido, calcular solo ese
    // Si no, calcular todos los partidos finalizados sin puntos calculados
    let matchesQuery = supabase
      .from('matches')
      .select('id, goles_local, goles_visitante')
      .eq('estado', 'finalizado')
      .not('goles_local', 'is', null)
      .not('goles_visitante', 'is', null)

    if (matchId) {
      matchesQuery = matchesQuery.eq('id', matchId)
    }

    const { data: matches, error: matchError } = await matchesQuery

    if (matchError) {
      throw matchError
    }

    if (!matches || matches.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay partidos para calcular',
        calculated: 0,
      })
    }

    let totalUpdated = 0
    let totalExactos = 0

    for (const match of matches) {
      // Get all predictions for this match
      const { data: predictions, error: predError } = await supabase
        .from('predictions')
        .select('id, goles_local, goles_visitante, puntos_obtenidos')
        .eq('match_id', match.id)

      if (predError || !predictions) {
        logger.warn('Error fetching predictions for match', { 
          matchId: match.id, 
          error: predError 
        })
        continue
      }

      for (const prediction of predictions) {
        const { puntos, esExacto } = calculatePoints(
          prediction.goles_local,
          prediction.goles_visitante,
          match.goles_local!,
          match.goles_visitante!
        )

        // Only update if points changed or not calculated yet
        if (prediction.puntos_obtenidos !== puntos) {
          const { error: updateError } = await supabase
            .from('predictions')
            .update({
              puntos_obtenidos: puntos,
              es_exacto: esExacto,
            })
            .eq('id', prediction.id)

          if (!updateError) {
            totalUpdated++
            if (esExacto) totalExactos++
          }
        }
      }
    }

    // Guardar historial de leaderboard si es recálculo completo
    if (!matchId) {
      // Get current leaderboard
      const { data: leaderboard } = await supabase
        .from('leaderboard')
        .select('user_id, puntos_totales, marcadores_exactos')

      if (leaderboard && leaderboard.length > 0) {
        // Sort by points to determine positions
        const sorted = leaderboard.sort((a, b) => {
          if (b.puntos_totales !== a.puntos_totales) {
            return b.puntos_totales - a.puntos_totales
          }
          return b.marcadores_exactos - a.marcadores_exactos
        })

        // Save history
        const historyEntries = sorted.map((entry, index) => ({
          user_id: entry.user_id,
          posicion: index + 1,
          puntos_totales: entry.puntos_totales,
          marcadores_exactos: entry.marcadores_exactos,
        }))

        await supabase.from('leaderboard_history').insert(historyEntries)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Puntos calculados`,
      matches_processed: matches.length,
      predictions_updated: totalUpdated,
      exactos: totalExactos,
    })

  } catch (error) {
    return handleApiError('/api/cron/calculate-points', error)
  }
}
