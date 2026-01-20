import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession, requireAdmin } from '@/lib/auth/session'
import { handleApiError } from '@/lib/utils/api-error'
import { logApiError } from '@/lib/utils/logger'
import { z } from 'zod'

// Schema para crear partido (admin)
const createMatchSchema = z.object({
  equipo_local_id: z.string().uuid(),
  equipo_visitante_id: z.string().uuid(),
  fase: z.enum(['grupos', 'octavos', 'cuartos', 'semifinal', 'tercer_puesto', 'final']),
  fecha_hora: z.string().datetime(),
  estadio: z.string().min(1).max(200),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const fase = searchParams.get('fase')
    const estado = searchParams.get('estado')
    const upcoming = searchParams.get('upcoming') === 'true'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined

    const supabase = createServiceClient()

    let query = supabase
      .from('matches')
      .select(`
        id,
        fase,
        fecha_hora,
        estadio,
        goles_local,
        goles_visitante,
        estado,
        predicciones_cerradas,
        equipo_local:equipo_local_id (
          id, nombre, codigo, bandera_url
        ),
        equipo_visitante:equipo_visitante_id (
          id, nombre, codigo, bandera_url
        )
      `)
      .order('fecha_hora', { ascending: true })

    // Filtros opcionales
    if (fase) {
      query = query.eq('fase', fase)
    }

    if (estado) {
      query = query.eq('estado', estado)
    }

    if (upcoming) {
      // Solo partidos donde aún se pueden hacer predicciones
      query = query
        .eq('predicciones_cerradas', false)
        .gte('fecha_hora', new Date().toISOString())
    }

    // Paginación
    if (limit && limit > 0) {
      query = query.limit(limit)
    }

    const { data: matches, error } = await query

    if (error) {
      logApiError('/api/matches', error, { userId: session.userId })
      return NextResponse.json(
        { success: false, error: 'Error al obtener partidos' },
        { status: 500 }
      )
    }

    // Obtener predicciones del usuario para estos partidos
    const matchIds = matches.map(m => m.id)
    const { data: userPredictions } = await supabase
      .from('predictions')
      .select('match_id, goles_local, goles_visitante, puntos_obtenidos, es_exacto')
      .eq('user_id', session.userId)
      .in('match_id', matchIds)

    // Mapear predicciones a partidos
    const predictionsMap = new Map(
      userPredictions?.map(p => [p.match_id, p]) || []
    )

    const matchesWithPredictions = matches.map(match => ({
      ...match,
      mi_prediccion: predictionsMap.get(match.id) || null,
    }))

    return NextResponse.json({
      success: true,
      matches: matchesWithPredictions,
      total: matches.length,
    })

  } catch (error) {
    return handleApiError('/api/matches', error)
  }
}

// POST - Solo admin puede crear partidos
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const result = createMatchSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { equipo_local_id, equipo_visitante_id, fase, fecha_hora, estadio } = result.data

    if (equipo_local_id === equipo_visitante_id) {
      return NextResponse.json(
        { success: false, error: 'Los equipos deben ser diferentes' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    const { data: match, error } = await supabase
      .from('matches')
      .insert({
        equipo_local_id,
        equipo_visitante_id,
        fase,
        fecha_hora,
        estadio,
        estado: 'proximo',
        predicciones_cerradas: false,
      })
      .select()
      .single()

    if (error) {
      logApiError('/api/matches', error, { action: 'create' })
      return NextResponse.json(
        { success: false, error: 'Error al crear partido' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      match,
    })

  } catch (error) {
    return handleApiError('/api/matches', error)
  }
}
