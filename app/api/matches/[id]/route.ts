import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession, requireAdmin } from '@/lib/auth/session'
import { handleApiError } from '@/lib/utils/api-error'
import { logApiError } from '@/lib/utils/logger'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Schema para actualizar partido (admin)
const updateMatchSchema = z.object({
  goles_local: z.number().int().min(0).optional(),
  goles_visitante: z.number().int().min(0).optional(),
  estado: z.enum(['proximo', 'en_vivo', 'finalizado']).optional(),
  predicciones_cerradas: z.boolean().optional(),
})

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { id } = await params
    const supabase = createServiceClient()

    const { data: match, error } = await supabase
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
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Partido no encontrado' },
        { status: 404 }
      )
    }

    // Obtener predicción del usuario
    const { data: prediction } = await supabase
      .from('predictions')
      .select('goles_local, goles_visitante, puntos_obtenidos, es_exacto')
      .eq('user_id', session.userId)
      .eq('match_id', id)
      .single()

    return NextResponse.json({
      success: true,
      match: {
        ...match,
        mi_prediccion: prediction || null,
      },
    })

  } catch (error) {
    return handleApiError('/api/matches/[id]', error)
  }
}

// PATCH - Solo admin puede actualizar resultados
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin()

    const { id } = await params
    const body = await request.json()
    const result = updateMatchSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Verificar que el partido existe
    const { data: existingMatch, error: fetchError } = await supabase
      .from('matches')
      .select('id, estado')
      .eq('id', id)
      .single()

    if (fetchError || !existingMatch) {
      return NextResponse.json(
        { success: false, error: 'Partido no encontrado' },
        { status: 404 }
      )
    }

    const updateData = result.data

    // Si se está finalizando el partido, calcular puntos
    if (updateData.estado === 'finalizado' &&
        updateData.goles_local !== undefined &&
        updateData.goles_visitante !== undefined) {

      // Actualizar partido
      const { error: updateError } = await supabase
        .from('matches')
        .update({
          ...updateData,
          predicciones_cerradas: true,
        })
        .eq('id', id)

      if (updateError) {
        throw updateError
      }

      // Calcular puntos para todas las predicciones de este partido
      await calculatePredictionPoints(supabase, id, updateData.goles_local, updateData.goles_visitante)

    } else {
      // Actualización normal
      const { error: updateError } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', id)

      if (updateError) {
        throw updateError
      }
    }

    // Obtener partido actualizado
    const { data: updatedMatch } = await supabase
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
      .eq('id', id)
      .single()

    return NextResponse.json({
      success: true,
      match: updatedMatch,
    })

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'No autenticado') {
        return NextResponse.json(
          { success: false, error: 'No autenticado' },
          { status: 401 }
        )
      }
      if (error.message === 'No autorizado') {
        return NextResponse.json(
          { success: false, error: 'No autorizado' },
          { status: 403 }
        )
      }
    }
    return handleApiError('/api/matches/[id]', error)
  }
}

// Función auxiliar para calcular puntos
async function calculatePredictionPoints(
  supabase: ReturnType<typeof createServiceClient>,
  matchId: string,
  golesLocalReal: number,
  golesVisitanteReal: number
) {
  // Obtener todas las predicciones para este partido
  const { data: predictions, error } = await supabase
    .from('predictions')
    .select('id, goles_local, goles_visitante')
    .eq('match_id', matchId)

  if (error || !predictions) {
    logApiError('/api/matches/[id]', error, { matchId, operation: 'calculatePredictionPoints' })
    return
  }

  // Calcular y actualizar puntos para cada predicción
  for (const prediction of predictions) {
    const { puntos, esExacto } = calculatePoints(
      prediction.goles_local,
      prediction.goles_visitante,
      golesLocalReal,
      golesVisitanteReal
    )

    await supabase
      .from('predictions')
      .update({
        puntos_obtenidos: puntos,
        es_exacto: esExacto,
      })
      .eq('id', prediction.id)
  }
}

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
