import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { handleApiError } from '@/lib/utils/api-error'

// GET - Obtener el partido destacado del día actual
export async function GET() {
  try {
    const supabase = createServiceClient()

    // Fecha actual (solo fecha, sin hora)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStart = today.toISOString()
    const todayEnd = new Date(today)
    todayEnd.setHours(23, 59, 59, 999)
    const todayEndISO = todayEnd.toISOString()

    // Buscar partidos del día actual
    // Prioridad: 1. Partidos que aún no han comenzado, 2. Partidos en vivo, 3. Partidos finalizados del día
    const { data: upcomingMatch, error: upcomingError } = await supabase
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
      .gte('fecha_hora', todayStart)
      .lte('fecha_hora', todayEndISO)
      .eq('estado', 'proximo')
      .order('fecha_hora', { ascending: true })
      .limit(1)
      .single()

    // Si no hay partidos próximos del día, buscar partidos en vivo
    if (!upcomingMatch || upcomingError) {
      const { data: liveMatch, error: liveError } = await supabase
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
        .gte('fecha_hora', todayStart)
        .lte('fecha_hora', todayEndISO)
        .eq('estado', 'en_vivo')
        .order('fecha_hora', { ascending: true })
        .limit(1)
        .single()

      if (liveMatch) {
        return NextResponse.json({
          success: true,
          match: liveMatch,
          isLive: true,
        })
      }

      // Si no hay en vivo, buscar el último partido del día (finalizado)
      const { data: finishedMatch, error: finishedError } = await supabase
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
        .gte('fecha_hora', todayStart)
        .lte('fecha_hora', todayEndISO)
        .eq('estado', 'finalizado')
        .order('fecha_hora', { ascending: false })
        .limit(1)
        .single()

      if (finishedMatch) {
        return NextResponse.json({
          success: true,
          match: finishedMatch,
          isLive: false,
        })
      }
    }

    // Si hay partido próximo del día, retornarlo
    if (upcomingMatch) {
      return NextResponse.json({
        success: true,
        match: upcomingMatch,
        isLive: false,
      })
    }

    // Si no hay partidos del día, buscar el próximo partido disponible
    const { data: nextMatch, error: nextError } = await supabase
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
      .gte('fecha_hora', todayStart)
      .order('fecha_hora', { ascending: true })
      .limit(1)
      .single()

    if (nextMatch) {
      return NextResponse.json({
        success: true,
        match: nextMatch,
        isLive: false,
      })
    }

    // Si no hay partidos, retornar null
    return NextResponse.json({
      success: true,
      match: null,
      isLive: false,
    })

  } catch (error) {
    return handleApiError('/api/matches/featured', error)
  }
}
