import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'
import { validateCsrfToken, csrfErrorResponse } from '@/lib/auth/csrf'
import { handleApiError } from '@/lib/utils/api-error'
import { logApiError } from '@/lib/utils/logger'
import { z } from 'zod'

const specialPredictionSchema = z.object({
  campeon_id: z.string().uuid().nullable().optional(),
  subcampeon_id: z.string().uuid().nullable().optional(),
  goleador: z.string().min(2).max(100).nullable().optional(),
  colombia_hasta: z.enum(['grupos', 'octavos', 'cuartos', 'semifinal', 'final', 'campeon']).nullable().optional(),
})

// GET - Obtener predicciones especiales del usuario
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

    const { data: prediction, error } = await supabase
      .from('special_predictions')
      .select(`
        id,
        goleador,
        colombia_hasta,
        bloqueado_principal,
        bloqueado_colombia,
        creado_en,
        campeon:campeon_id (
          id, nombre, codigo, bandera_url
        ),
        subcampeon:subcampeon_id (
          id, nombre, codigo, bandera_url
        )
      `)
      .eq('user_id', session.userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is okay for new users
      logApiError('/api/predictions/special', error, { userId: session.userId })
      return NextResponse.json(
        { success: false, error: 'Error al obtener predicción especial' },
        { status: 500 }
      )
    }

    // Obtener estado de bloqueo global (desde configuración o primer partido)
    const { data: firstMatch } = await supabase
      .from('matches')
      .select('fecha_hora')
      .order('fecha_hora', { ascending: true })
      .limit(1)
      .single()

    // Obtener primer partido de Colombia para bloqueo de predicción Colombia
    const { data: colombiaTeam } = await supabase
      .from('teams')
      .select('id')
      .eq('codigo', 'COL')
      .single()

    let colombiaFirstMatch = null
    if (colombiaTeam) {
      const { data } = await supabase
        .from('matches')
        .select('fecha_hora')
        .or(`equipo_local_id.eq.${colombiaTeam.id},equipo_visitante_id.eq.${colombiaTeam.id}`)
        .order('fecha_hora', { ascending: true })
        .limit(1)
        .single()
      colombiaFirstMatch = data
    }

    const now = new Date()
    const mundialStarted = firstMatch ? new Date(firstMatch.fecha_hora) <= now : false
    const colombiaStarted = colombiaFirstMatch ? new Date(colombiaFirstMatch.fecha_hora) <= now : false

    return NextResponse.json({
      success: true,
      prediction: prediction || null,
      bloqueos: {
        principal_bloqueado: prediction?.bloqueado_principal || mundialStarted,
        colombia_bloqueado: prediction?.bloqueado_colombia || colombiaStarted,
        mundial_started: mundialStarted,
        colombia_started: colombiaStarted,
      },
    })

  } catch (error) {
    return handleApiError('/api/predictions/special', error)
  }
}

// POST - Crear o actualizar predicciones especiales
export async function POST(request: NextRequest) {
  try {
    // Validación CSRF
    const csrfResult = await validateCsrfToken(request)
    if (!csrfResult.valid) {
      return csrfErrorResponse(csrfResult.error!)
    }

    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const result = specialPredictionSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Verificar predicción existente y sus bloqueos
    const { data: existing } = await supabase
      .from('special_predictions')
      .select('id, bloqueado_principal, bloqueado_colombia')
      .eq('user_id', session.userId)
      .single()

    // Verificar fechas de inicio para auto-bloqueo
    const { data: firstMatch } = await supabase
      .from('matches')
      .select('fecha_hora')
      .order('fecha_hora', { ascending: true })
      .limit(1)
      .single()

    const { data: colombiaTeam } = await supabase
      .from('teams')
      .select('id')
      .eq('codigo', 'COL')
      .single()

    let colombiaFirstMatch = null
    if (colombiaTeam) {
      const { data } = await supabase
        .from('matches')
        .select('fecha_hora')
        .or(`equipo_local_id.eq.${colombiaTeam.id},equipo_visitante_id.eq.${colombiaTeam.id}`)
        .order('fecha_hora', { ascending: true })
        .limit(1)
        .single()
      colombiaFirstMatch = data
    }

    const now = new Date()
    const mundialStarted = firstMatch ? new Date(firstMatch.fecha_hora) <= now : false
    const colombiaStarted = colombiaFirstMatch ? new Date(colombiaFirstMatch.fecha_hora) <= now : false

    const principalBloqueado = existing?.bloqueado_principal || mundialStarted
    const colombiaBloqueado = existing?.bloqueado_colombia || colombiaStarted

    // Construir datos de actualización respetando bloqueos
    const updateData: Record<string, unknown> = {}

    if (!principalBloqueado) {
      if (result.data.campeon_id !== undefined) {
        updateData.campeon_id = result.data.campeon_id
      }
      if (result.data.subcampeon_id !== undefined) {
        updateData.subcampeon_id = result.data.subcampeon_id
      }
      if (result.data.goleador !== undefined) {
        updateData.goleador = result.data.goleador
      }
    }

    if (!colombiaBloqueado) {
      if (result.data.colombia_hasta !== undefined) {
        updateData.colombia_hasta = result.data.colombia_hasta
      }
    }

    // Validar que campeón y subcampeón sean diferentes
    if (updateData.campeon_id && updateData.subcampeon_id &&
        updateData.campeon_id === updateData.subcampeon_id) {
      return NextResponse.json(
        { success: false, error: 'El campeón y subcampeón deben ser diferentes' },
        { status: 400 }
      )
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No hay campos para actualizar o las predicciones están bloqueadas' },
        { status: 400 }
      )
    }

    // Upsert
    const { data: prediction, error } = await supabase
      .from('special_predictions')
      .upsert(
        {
          user_id: session.userId,
          ...updateData,
          bloqueado_principal: principalBloqueado,
          bloqueado_colombia: colombiaBloqueado,
        },
        {
          onConflict: 'user_id',
        }
      )
      .select(`
        id,
        goleador,
        colombia_hasta,
        bloqueado_principal,
        bloqueado_colombia,
        campeon:campeon_id (
          id, nombre, codigo, bandera_url
        ),
        subcampeon:subcampeon_id (
          id, nombre, codigo, bandera_url
        )
      `)
      .single()

    if (error) {
      logApiError('/api/predictions/special', error, { userId: session.userId })
      return NextResponse.json(
        { success: false, error: 'Error al guardar predicción especial' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      prediction,
      message: 'Predicción especial guardada exitosamente',
    })

  } catch (error) {
    return handleApiError('/api/predictions/special', error)
  }
}
