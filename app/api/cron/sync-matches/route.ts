import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { handleApiError } from '@/lib/utils/api-error'
import { logger } from '@/lib/utils/logger'

// Football-Data.org API types
interface FootballDataMatch {
  id: number
  utcDate: string
  status: 'SCHEDULED' | 'TIMED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'SUSPENDED' | 'POSTPONED' | 'CANCELLED'
  stage: string
  group: string | null
  homeTeam: {
    id: number
    name: string
    shortName: string
    tla: string
    crest: string
  }
  awayTeam: {
    id: number
    name: string
    shortName: string
    tla: string
    crest: string
  }
  score: {
    fullTime: {
      home: number | null
      away: number | null
    }
  }
  venue: string | null
}

interface FootballDataResponse {
  matches: FootballDataMatch[]
}

// Map Football-Data status to our status
function mapStatus(status: string): 'proximo' | 'en_vivo' | 'finalizado' {
  switch (status) {
    case 'IN_PLAY':
    case 'PAUSED':
      return 'en_vivo'
    case 'FINISHED':
      return 'finalizado'
    default:
      return 'proximo'
  }
}

// Map Football-Data stage to our phase
function mapPhase(stage: string): string {
  const stageMap: Record<string, string> = {
    'GROUP_STAGE': 'grupos',
    'LAST_16': 'octavos',
    'QUARTER_FINALS': 'cuartos',
    'SEMI_FINALS': 'semifinal',
    'THIRD_PLACE': 'tercer_puesto',
    'FINAL': 'final',
  }
  return stageMap[stage] || 'grupos'
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

    const apiKey = process.env.FOOTBALL_DATA_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'FOOTBALL_DATA_API_KEY no configurada' },
        { status: 500 }
      )
    }

    // Fetch World Cup 2026 matches from Football-Data.org
    // Competition ID for World Cup is WC (or specific ID when available)
    const response = await fetch(
      'https://api.football-data.org/v4/competitions/WC/matches',
      {
        headers: {
          'X-Auth-Token': apiKey,
        },
        next: { revalidate: 0 },
      }
    )

    if (!response.ok) {
      // If World Cup 2026 not available yet, return mock success
      if (response.status === 404) {
        return NextResponse.json({
          success: true,
          message: 'World Cup 2026 aún no disponible en la API',
          synced: 0,
        })
      }
      throw new Error(`Football-Data API error: ${response.status}`)
    }

    const data: FootballDataResponse = await response.json()
    const supabase = createServiceClient()

    let syncedCount = 0
    let updatedCount = 0

    for (const match of data.matches) {
      // Find or create teams
      const homeTeamCode = match.homeTeam.tla
      const awayTeamCode = match.awayTeam.tla

      // Get team IDs from our database
      const { data: homeTeam } = await supabase
        .from('teams')
        .select('id')
        .eq('codigo', homeTeamCode)
        .single()

      const { data: awayTeam } = await supabase
        .from('teams')
        .select('id')
        .eq('codigo', awayTeamCode)
        .single()

      if (!homeTeam || !awayTeam) {
        logger.warn('Teams not found during sync', { homeTeamCode, awayTeamCode })
        continue
      }

      const matchData = {
        equipo_local_id: homeTeam.id,
        equipo_visitante_id: awayTeam.id,
        fase: mapPhase(match.stage),
        fecha_hora: match.utcDate,
        estadio: match.venue || 'Por confirmar',
        goles_local: match.score.fullTime.home,
        goles_visitante: match.score.fullTime.away,
        estado: mapStatus(match.status),
        external_id: match.id,
      }

      // Check if match exists
      const { data: existingMatch } = await supabase
        .from('matches')
        .select('id, estado')
        .eq('external_id', match.id)
        .single()

      if (existingMatch) {
        // Update existing match
        const { error } = await supabase
          .from('matches')
          .update({
            goles_local: matchData.goles_local,
            goles_visitante: matchData.goles_visitante,
            estado: matchData.estado,
            fecha_hora: matchData.fecha_hora,
            estadio: matchData.estadio,
          })
          .eq('id', existingMatch.id)

        if (!error) {
          updatedCount++

          // If match just finished, trigger points calculation
          if (existingMatch.estado !== 'finalizado' && matchData.estado === 'finalizado') {
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/cron/calculate-points?match_id=${existingMatch.id}`, {
              method: 'GET',
              headers: cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {},
            })
          }
        }
      } else {
        // Insert new match
        const { error } = await supabase
          .from('matches')
          .insert(matchData)

        if (!error) {
          syncedCount++
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sincronización completada`,
      synced: syncedCount,
      updated: updatedCount,
      total: data.matches.length,
    })

  } catch (error) {
    return handleApiError('/api/cron/sync-matches', error)
  }
}
