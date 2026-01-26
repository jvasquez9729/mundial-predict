import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { handleApiError } from '@/lib/utils/api-error'
import { logger } from '@/lib/utils/logger'
import { env } from '@/lib/config/env'

// Mapeo de códigos de equipos para The Odds API
// The Odds API usa códigos diferentes, así que necesitamos mapearlos
const teamCodeMapping: Record<string, { oddsApiKey: string; nombre: string }> = {
  'AR': { oddsApiKey: 'argentina', nombre: 'Argentina' },
  'FR': { oddsApiKey: 'france', nombre: 'Francia' },
  'BR': { oddsApiKey: 'brazil', nombre: 'Brasil' },
  'GB': { oddsApiKey: 'england', nombre: 'Inglaterra' },
  'ES': { oddsApiKey: 'spain', nombre: 'España' },
  'DE': { oddsApiKey: 'germany', nombre: 'Alemania' },
  'PT': { oddsApiKey: 'portugal', nombre: 'Portugal' },
  'NL': { oddsApiKey: 'netherlands', nombre: 'Países Bajos' },
  'BE': { oddsApiKey: 'belgium', nombre: 'Bélgica' },
  'IT': { oddsApiKey: 'italy', nombre: 'Italia' },
  'CO': { oddsApiKey: 'colombia', nombre: 'Colombia' },
  'UY': { oddsApiKey: 'uruguay', nombre: 'Uruguay' },
  'CL': { oddsApiKey: 'chile', nombre: 'Chile' },
  'MX': { oddsApiKey: 'mexico', nombre: 'México' },
  'US': { oddsApiKey: 'united_states', nombre: 'Estados Unidos' },
}

// Probabilidades fallback basadas en análisis de casas de apuestas
const fallbackOdds = [
  { codigo: 'AR', nombre: 'Argentina', probabilidad: 18.5, tendencia: 2.3 },
  { codigo: 'FR', nombre: 'Francia', probabilidad: 16.2, tendencia: 1.1 },
  { codigo: 'BR', nombre: 'Brasil', probabilidad: 14.8, tendencia: -0.5 },
  { codigo: 'GB', nombre: 'Inglaterra', probabilidad: 12.5, tendencia: 0.8 },
  { codigo: 'ES', nombre: 'España', probabilidad: 10.3, tendencia: 1.2 },
  { codigo: 'DE', nombre: 'Alemania', probabilidad: 8.7, tendencia: -0.3 },
  { codigo: 'PT', nombre: 'Portugal', probabilidad: 7.2, tendencia: 0.5 },
  { codigo: 'NL', nombre: 'Países Bajos', probabilidad: 5.8, tendencia: 0.3 },
  { codigo: 'BE', nombre: 'Bélgica', probabilidad: 4.2, tendencia: -0.2 },
  { codigo: 'IT', nombre: 'Italia', probabilidad: 3.8, tendencia: 0.1 },
]

// Función para convertir odds decimales a probabilidad porcentual
function oddsToProbability(decimalOdds: number): number {
  // Probabilidad = 1 / odds * 100
  // Normalizamos para que sumen ~100%
  return (1 / decimalOdds) * 100
}

// Función para obtener probabilidades desde The Odds API
async function fetchFromOddsAPI(): Promise<typeof fallbackOdds | null> {
  if (!env.THE_ODDS_API_KEY) {
    logger.debug('THE_ODDS_API_KEY no configurada, usando fallback')
    return null
  }

  try {
    // Para obtener odds de ganador del mundial, usamos el mercado "outrights"
    // El deporte correcto es soccer_fifa_world_cup_winner que tiene has_outrights: true
    const sportsToTry = [
      'soccer_fifa_world_cup_winner', // Deporte específico para ganador del mundial
      'soccer_fifa_world_cup', // Intentar también el deporte general (sin outrights)
      'soccer_world_cup',
    ]

    for (const sport of sportsToTry) {
      try {
        // Intentamos obtener odds de "outrights" (ganador del torneo)
        const response = await fetch(
          `https://api.the-odds-api.com/v4/sports/${sport}/odds/?regions=us,uk,au&markets=outrights&oddsFormat=decimal&apiKey=${env.THE_ODDS_API_KEY}`,
          {
            next: { revalidate: 3600 }, // Cache por 1 hora
          }
        )

        // Verificar headers de cuota
        const requestsRemaining = response.headers.get('x-requests-remaining')
        const requestsUsed = response.headers.get('x-requests-used')
        
        if (requestsRemaining) {
          logger.debug('The Odds API quota', { 
            remaining: requestsRemaining, 
            used: requestsUsed 
          })
        }

        if (!response.ok) {
          if (response.status === 422) {
            // Sport no válido, intentar siguiente
            continue
          }
          logger.warn('The Odds API error', { 
            status: response.status, 
            statusText: response.statusText,
            sport 
          })
          continue
        }

        const data = await response.json()
        
        // Procesar datos de The Odds API
        if (!Array.isArray(data) || data.length === 0) {
          continue // Intentar siguiente sport
        }

        // Para soccer_fifa_world_cup_winner, todos los eventos son del mundial
        // No necesitamos filtrar por nombre ya que este deporte es específico del mundial
        const worldCupEvents = data.filter((event: any) => {
          // Verificar que tenga bookmakers y markets
          return event.bookmakers && event.bookmakers.length > 0
        })

        if (worldCupEvents.length === 0) {
          // No hay eventos del mundial aún, usar fallback
          logger.debug('The Odds API no tiene odds del Mundial 2026 disponibles aún', { sport })
          return null
        }

        // Procesar los datos de outrights
        // Estructura: event.bookmakers[].markets[].outcomes[] donde markets[].key === 'outrights'
        const teamOdds: Record<string, { totalOdds: number; count: number; names: string[] }> = {}

        worldCupEvents.forEach((event: any) => {
          event.bookmakers?.forEach((bookmaker: any) => {
            bookmaker.markets?.forEach((market: any) => {
              // Buscar mercado de outrights (puede ser 'outrights' o 'outrights_lay' - ignorar lay)
              if (market.key === 'outrights') {
                market.outcomes?.forEach((outcome: any) => {
                  const teamName = outcome.name.trim()
                  const lowerName = teamName.toLowerCase()
                  
                  // Mapear nombres de equipos a códigos
                  const codigo = findTeamCode(lowerName)
                  if (codigo) {
                    if (!teamOdds[codigo]) {
                      teamOdds[codigo] = { totalOdds: 0, count: 0, names: [] }
                    }
                    teamOdds[codigo].totalOdds += outcome.price
                    teamOdds[codigo].count++
                    if (!teamOdds[codigo].names.includes(teamName)) {
                      teamOdds[codigo].names.push(teamName)
                    }
                  }
                })
              }
            })
          })
        })

        // Convertir odds a probabilidades y formatear
        const processedOdds = Object.entries(teamOdds)
          .map(([codigo, data]) => {
            const avgOdds = data.totalOdds / data.count
            const probability = oddsToProbability(avgOdds)
            const teamInfo = Object.entries(teamCodeMapping).find(([code]) => code === codigo)?.[1]
            
            return {
              codigo,
              nombre: teamInfo?.nombre || codigo,
              probabilidad: probability,
              tendencia: 0, // Las tendencias se calcularían comparando con datos anteriores
            }
          })
          .filter(team => team.probabilidad > 0)
          .sort((a, b) => b.probabilidad - a.probabilidad)

        if (processedOdds.length > 0) {
          // Normalizar probabilidades para que sumen ~100%
          const totalProb = processedOdds.reduce((sum, t) => sum + t.probabilidad, 0)
          const normalized = processedOdds.map(t => {
            const fallbackTeam = fallbackOdds.find(ft => ft.codigo === t.codigo)
            return {
              ...t,
              probabilidad: Math.round((t.probabilidad / totalProb) * 100 * 10) / 10, // Redondear a 1 decimal
              tendencia: fallbackTeam?.tendencia || 0, // Usar tendencia del fallback si está disponible
            }
          })

          // Tomar solo los top 10
          const top10 = normalized.slice(0, 10)
          
          logger.info('Obtenidas probabilidades desde The Odds API', { 
            count: top10.length,
            top3: top10.slice(0, 3).map(t => `${t.nombre} (${t.probabilidad}%)`)
          })
          
          return top10 as typeof fallbackOdds
        }
      } catch (sportError) {
        logger.warn('Error con sport en The Odds API', { sport, error: sportError })
        continue
      }
    }

    // Si llegamos aquí, no se encontraron datos
    logger.debug('The Odds API no tiene datos del Mundial 2026 disponibles aún')
    return null
  } catch (error) {
    logger.error('Error fetching from The Odds API', error as Error)
    return null
  }
}

// Mapeo adicional de nombres comunes en inglés que vienen de The Odds API
const nameVariations: Record<string, string> = {
  'spain': 'ES',
  'england': 'GB',
  'france': 'FR',
  'brazil': 'BR',
  'argentina': 'AR',
  'portugal': 'PT',
  'germany': 'DE',
  'netherlands': 'NL',
  'norway': 'NO',
  'belgium': 'BE',
  'italy': 'IT',
  'croatia': 'HR',
  'colombia': 'CO',
  'uruguay': 'UY',
  'chile': 'CL',
  'mexico': 'MX',
  'united states': 'US',
  'usa': 'US',
  'canada': 'CA',
  'japan': 'JP',
  'south korea': 'KR',
  'senegal': 'SN',
  'ghana': 'GH',
  'nigeria': 'NG',
  'morocco': 'MA',
  'tunisia': 'TN',
  'egypt': 'EG',
  'australia': 'AU',
  'new zealand': 'NZ',
  'switzerland': 'CH',
  'denmark': 'DK',
  'sweden': 'SE',
  'poland': 'PL',
  'serbia': 'RS',
  'turkey': 'TR',
  'greece': 'GR',
  'albania': 'AL',
  'czech republic': 'CZ',
  'czech': 'CZ',
  'austria': 'AT',
  'hungary': 'HU',
  'russia': 'RU',
  'ukraine': 'UA',
}

// Función helper para mapear nombres de equipos a códigos
function findTeamCode(teamName: string): string | null {
  const lowerName = teamName.toLowerCase().trim()
  
  // Primero intentar con variaciones comunes
  if (nameVariations[lowerName]) {
    return nameVariations[lowerName]
  }
  
  // Buscar coincidencias parciales en variaciones
  for (const [name, codigo] of Object.entries(nameVariations)) {
    if (lowerName.includes(name) || name.includes(lowerName)) {
      return codigo
    }
  }
  
  // Luego buscar en el mapeo principal
  for (const [codigo, info] of Object.entries(teamCodeMapping)) {
    const teamKey = info.oddsApiKey.toLowerCase()
    const teamNombre = info.nombre.toLowerCase()
    
    // Buscar coincidencias parciales o exactas
    if (lowerName === teamKey || 
        lowerName === teamNombre ||
        lowerName.includes(teamKey) || 
        lowerName.includes(teamNombre) ||
        teamKey.includes(lowerName) ||
        teamNombre.includes(lowerName)) {
      return codigo
    }
  }
  
  return null
}

// Función para obtener probabilidades actualizadas
async function fetchExternalOdds(): Promise<typeof fallbackOdds> {
  // Intentar obtener de The Odds API
  const oddsApiData = await fetchFromOddsAPI()
  
  if (oddsApiData) {
    return oddsApiData
  }

  // Si no hay datos de la API, usar fallback
  // En el futuro, cuando The Odds API tenga datos del Mundial 2026,
  // podemos procesar y retornar esos datos aquí
  return fallbackOdds
}

// GET - Obtener favoritos de la comunidad
export async function GET() {
  try {
    const supabase = createServiceClient()

    // Obtener predicciones especiales de campeón de los usuarios
    const { data: specialPredictions, error: predictionsError } = await supabase
      .from('special_predictions')
      .select(`
        campeon_id,
        teams:campeon_id (
          id,
          codigo,
          nombre
        )
      `)
      .not('campeon_id', 'is', null)

    // Calcular probabilidades basadas en predicciones de usuarios
    const teamVotes: Record<string, number> = {}
    let totalVotes = 0

    if (specialPredictions && !predictionsError) {
      specialPredictions.forEach((pred) => {
        if (pred.campeon_id && pred.teams) {
          const team = pred.teams as any
          const codigo = team.codigo
          teamVotes[codigo] = (teamVotes[codigo] || 0) + 1
          totalVotes++
        }
      })
    }

    // Obtener probabilidades actualizadas
    const currentOdds = await fetchExternalOdds()

    // Combinar probabilidades externas con predicciones de usuarios
    const favorites = currentOdds.map((external) => {
      const userVotes = teamVotes[external.codigo] || 0
      const userPercentage = totalVotes > 0 ? (userVotes / totalVotes) * 100 : 0

      // Combinar probabilidades: 70% externas + 30% predicciones de usuarios
      const combinedProbability = (external.probabilidad * 0.7) + (userPercentage * 0.3)

      return {
        codigo: external.codigo,
        nombre: external.nombre,
        probabilidad: Math.round(combinedProbability * 10) / 10, // Redondear a 1 decimal
        tendencia: external.tendencia,
        votos: userVotes,
      }
    })

    // Ordenar por probabilidad descendente
    favorites.sort((a, b) => b.probabilidad - a.probabilidad)

    // Obtener información de equipos desde la base de datos para validar
    const { data: teams } = await supabase
      .from('teams')
      .select('id, codigo, nombre, bandera_url')
      .in('codigo', favorites.map(f => f.codigo))

    // Combinar con información de equipos
    const favoritesWithTeams = favorites.map((fav) => {
      const team = teams?.find(t => t.codigo === fav.codigo)
      return {
        ...fav,
        team_id: team?.id,
        bandera_url: team?.bandera_url,
      }
    })

    return NextResponse.json({
      success: true,
      favorites: favoritesWithTeams.slice(0, 10), // Top 10
      total_user_predictions: totalVotes,
      last_updated: new Date().toISOString(),
      source: env.THE_ODDS_API_KEY ? 'the-odds-api' : 'fallback',
    })

  } catch (error) {
    return handleApiError('/api/teams/favorites', error)
  }
}
