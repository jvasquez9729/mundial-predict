import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { handleApiError } from '@/lib/utils/api-error'

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

    const supabase = createServiceClient()
    const now = new Date()

    // Cerrar predicciones para partidos que comienzan en menos de 1 hora
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)

    const { data: matchesToClose, error: fetchError } = await supabase
      .from('matches')
      .select('id, fecha_hora, equipo_local_id, equipo_visitante_id')
      .eq('predicciones_cerradas', false)
      .eq('estado', 'proximo')
      .lte('fecha_hora', oneHourFromNow.toISOString())

    if (fetchError) {
      throw fetchError
    }

    if (!matchesToClose || matchesToClose.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay predicciones que cerrar',
        closed: 0,
      })
    }

    // Cerrar predicciones
    const matchIds = matchesToClose.map(m => m.id)

    const { error: updateError } = await supabase
      .from('matches')
      .update({ predicciones_cerradas: true })
      .in('id', matchIds)

    if (updateError) {
      throw updateError
    }

    // Actualizar partidos que ya comenzaron a "en_vivo"
    const { data: liveMatches, error: liveError } = await supabase
      .from('matches')
      .select('id')
      .eq('estado', 'proximo')
      .lte('fecha_hora', now.toISOString())

    if (!liveError && liveMatches && liveMatches.length > 0) {
      await supabase
        .from('matches')
        .update({ estado: 'en_vivo' })
        .in('id', liveMatches.map(m => m.id))
    }

    // Verificar bloqueo de predicciones especiales
    // Bloquear predicciones principales si el mundial ya comenzó
    const { data: firstMatch } = await supabase
      .from('matches')
      .select('fecha_hora')
      .order('fecha_hora', { ascending: true })
      .limit(1)
      .single()

    if (firstMatch && new Date(firstMatch.fecha_hora) <= now) {
      // Bloquear todas las predicciones principales que no estén bloqueadas
      await supabase
        .from('special_predictions')
        .update({ bloqueado_principal: true })
        .eq('bloqueado_principal', false)
    }

    // Buscar si Colombia ha jugado para bloquear predicciones de Colombia
    const { data: colombiaTeam } = await supabase
      .from('teams')
      .select('id')
      .eq('codigo', 'COL')
      .single()

    if (colombiaTeam) {
      const { data: colombiaMatch } = await supabase
        .from('matches')
        .select('fecha_hora')
        .or(`equipo_local_id.eq.${colombiaTeam.id},equipo_visitante_id.eq.${colombiaTeam.id}`)
        .order('fecha_hora', { ascending: true })
        .limit(1)
        .single()

      if (colombiaMatch && new Date(colombiaMatch.fecha_hora) <= now) {
        await supabase
          .from('special_predictions')
          .update({ bloqueado_colombia: true })
          .eq('bloqueado_colombia', false)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Deadlines verificados`,
      closed: matchesToClose.length,
      matchIds,
    })

  } catch (error) {
    return handleApiError('/api/cron/check-deadlines', error)
  }
}
