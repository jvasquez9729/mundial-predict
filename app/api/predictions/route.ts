import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'
import { predictionSchema } from '@/lib/auth/validation'
import { handleApiError } from '@/lib/utils/api-error'
import { logApiError } from '@/lib/utils/logger'
import { rateLimitByIP } from '@/lib/utils/rate-limit'

// GET - Obtener predicciones del usuario
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
    const matchId = searchParams.get('match_id')

    const supabase = createServiceClient()

    let query = supabase
      .from('predictions')
      .select(`
        id,
        goles_local,
        goles_visitante,
        puntos_obtenidos,
        es_exacto,
        creado_en,
        actualizado_en,
        match:match_id (
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
        )
      `)
      .eq('user_id', session.userId)
      .order('creado_en', { ascending: false })

    if (matchId) {
      query = query.eq('match_id', matchId)
    }

    const { data: predictions, error } = await query

    if (error) {
      logApiError('/api/predictions', error, { userId: session.userId })
      return NextResponse.json(
        { success: false, error: 'Error al obtener predicciones' },
        { status: 500 }
      )
    }

    // Calcular estadísticas
    const stats = {
      total: predictions.length,
      puntos_totales: predictions.reduce((sum, p) => sum + p.puntos_obtenidos, 0),
      marcadores_exactos: predictions.filter(p => p.es_exacto).length,
      aciertos: predictions.filter(p => p.puntos_obtenidos > 0).length,
    }

    return NextResponse.json({
      success: true,
      predictions,
      stats,
    })

  } catch (error) {
    return handleApiError('/api/predictions', error)
  }
}

// POST - Crear o actualizar predicción
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Rate limiting para predicciones (30 por minuto)
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const rateLimitResult = rateLimitByIP(ip, {
      windowMs: 60 * 1000, // 1 minuto
      maxRequests: 30, // 30 predicciones por minuto
    })
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Demasiadas solicitudes. Intenta más tarde.',
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '30',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          }
        }
      )
    }

    const body = await request.json()
    const result = predictionSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { match_id, goles_local, goles_visitante } = result.data
    const supabase = createServiceClient()

    // Verificar que el partido existe y las predicciones están abiertas
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('id, fecha_hora, predicciones_cerradas, estado')
      .eq('id', match_id)
      .single()

    if (matchError || !match) {
      return NextResponse.json(
        { success: false, error: 'Partido no encontrado' },
        { status: 404 }
      )
    }

    if (match.predicciones_cerradas) {
      return NextResponse.json(
        { success: false, error: 'Las predicciones para este partido están cerradas' },
        { status: 400 }
      )
    }

    // Verificar que faltan al menos 1 hora para el partido
    const matchDate = new Date(match.fecha_hora)
    const now = new Date()
    const hoursUntilMatch = (matchDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilMatch < 1) {
      return NextResponse.json(
        { success: false, error: 'Las predicciones cierran 1 hora antes del partido' },
        { status: 400 }
      )
    }

    // Upsert predicción
    const { data: prediction, error: predictionError } = await supabase
      .from('predictions')
      .upsert(
        {
          user_id: session.userId,
          match_id,
          goles_local,
          goles_visitante,
          actualizado_en: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,match_id',
        }
      )
      .select()
      .single()

    if (predictionError) {
      logApiError('/api/predictions', predictionError, { 
        userId: session.userId, 
        match_id 
      })
      return NextResponse.json(
        { success: false, error: 'Error al guardar predicción' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      prediction,
      message: 'Predicción guardada exitosamente',
    })

  } catch (error) {
    return handleApiError('/api/predictions', error)
  }
}
