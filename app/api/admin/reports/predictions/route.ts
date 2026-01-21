import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/session'
import { writeToSheet } from '@/lib/google/sheets'
import { handleApiError } from '@/lib/utils/api-error'
import { logApiError } from '@/lib/utils/logger'
import { z } from 'zod'

const reportSchema = z.object({
  fase: z.string().optional(), // Si no se proporciona, se exportan todas las fases
})

// Tipos explícitos para respuestas de Supabase
type MatchForReport = {
  id: string
}

type TeamForReport = {
  nombre: string
  codigo: string
}

type MatchDetailForReport = {
  id: string
  fase: string
  fecha_hora: string
  estadio: string
  goles_local: number | null
  goles_visitante: number | null
  estado: string
  equipo_local: TeamForReport | null
  equipo_visitante: TeamForReport | null
}

type UserForReport = {
  nombre_completo: string
  email: string
  cedula: string | null
}

type PredictionForReport = {
  id: string
  user_id: string
  match_id: string
  goles_local: number
  goles_visitante: number
  puntos_obtenidos: number
  es_exacto: boolean
  creado_en: string
  users: UserForReport | null
  match: MatchDetailForReport | null
}

/**
 * GET - Generar reporte de predicciones por fase y exportarlo a Google Sheets
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const faseParam = searchParams.get('fase')

    const supabase = createServiceClient()

    // Primero obtener los partidos de la fase si se especifica
    let matchIds: string[] | null = null
    if (faseParam) {
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('id')
        .eq('fase', faseParam)

      if (matchesError) {
        logApiError('/api/admin/reports/predictions (matches)', matchesError)
        throw new Error('Error al obtener partidos de la fase')
      }

      // Tipo explícito definido arriba
      const typedMatches: MatchForReport[] = (matches || []) as MatchForReport[]
      matchIds = typedMatches.map(m => m.id)
    }

    // Construir query de predicciones
    let predictionsQuery = supabase
      .from('predictions')
      .select(`
        id,
        user_id,
        match_id,
        goles_local,
        goles_visitante,
        puntos_obtenidos,
        es_exacto,
        creado_en,
        users:user_id (
          nombre_completo,
          email,
          cedula
        ),
        match:match_id (
          id,
          fase,
          fecha_hora,
          estadio,
          goles_local,
          goles_visitante,
          estado,
          equipo_local:equipo_local_id (
            nombre,
            codigo
          ),
          equipo_visitante:equipo_visitante_id (
            nombre,
            codigo
          )
        )
      `)
      .order('creado_en', { ascending: false })

    // Filtrar por match_ids si se proporciona fase
    if (matchIds && matchIds.length > 0) {
      predictionsQuery = predictionsQuery.in('match_id', matchIds)
    } else if (matchIds && matchIds.length === 0) {
      // Si la fase no tiene partidos, devolver vacío
      return NextResponse.json({
        success: true,
        message: 'No hay partidos en la fase especificada',
        exportedSheets: [],
        totalPredictions: 0,
        phases: [],
      })
    }

    const { data: predictions, error: predictionsError } = await predictionsQuery

    if (predictionsError) {
      logApiError('/api/admin/reports/predictions', predictionsError)
      throw new Error('Error al obtener predicciones')
    }

    // Tipo explícito definido arriba
    const typedPredictions: PredictionForReport[] = (predictions || []) as PredictionForReport[]

    // Agrupar por fase
    const predictionsByPhase = new Map<string, PredictionForReport[]>()

    typedPredictions.forEach((pred) => {
      const match = pred.match
      const fase = match?.fase || 'Sin fase'
      
      if (!predictionsByPhase.has(fase)) {
        predictionsByPhase.set(fase, [])
      }
      predictionsByPhase.get(fase)?.push(pred)
    })

    // Exportar cada fase a una hoja separada
    const exportedSheets: string[] = []

    for (const [fase, fasePredictions] of predictionsByPhase.entries()) {
      // Preparar headers
      const headers = [
        'Fecha de Predicción',
        'Usuario',
        'Email',
        'Cédula',
        'Partido',
        'Equipo Local',
        'Equipo Visitante',
        'Predicción Local',
        'Predicción Visitante',
        'Goles Reales Local',
        'Goles Reales Visitante',
        'Puntos Obtenidos',
        'Es Exacto',
        'Estado del Partido',
        'Fecha del Partido',
        'Estadio',
      ]

      // Preparar filas
      const rows = fasePredictions.map((pred) => {
        const user = pred.users
        const match = pred.match
        const equipoLocal = match?.equipo_local
        const equipoVisitante = match?.equipo_visitante

        const matchDate = match?.fecha_hora
          ? new Date(match.fecha_hora).toLocaleString('es-CO', {
              dateStyle: 'short',
              timeStyle: 'short',
            })
          : 'N/A'

        return [
          new Date(pred.creado_en).toLocaleString('es-CO', {
            dateStyle: 'short',
            timeStyle: 'short',
          }),
          user?.nombre_completo || 'N/A',
          user?.email || 'N/A',
          user?.cedula || 'N/A',
          `${equipoLocal?.nombre || 'N/A'} vs ${equipoVisitante?.nombre || 'N/A'}`,
          equipoLocal?.nombre || 'N/A',
          equipoVisitante?.nombre || 'N/A',
          pred.goles_local ?? 'N/A',
          pred.goles_visitante ?? 'N/A',
          match?.goles_local ?? 'Pendiente',
          match?.goles_visitante ?? 'Pendiente',
          pred.puntos_obtenidos || 0,
          pred.es_exacto ? 'Sí' : 'No',
          match?.estado || 'N/A',
          matchDate,
          match?.estadio || 'N/A',
        ]
      })

      // Escribir a Google Sheets
      const sheetName = `Predicciones - ${fase} - ${new Date().toLocaleDateString('es-CO')}`
      await writeToSheet(sheetName, headers, rows)
      exportedSheets.push(sheetName)
    }

    return NextResponse.json({
      success: true,
      message: `Reporte de predicciones exportado exitosamente a Google Sheets`,
      exportedSheets,
      totalPredictions: typedPredictions.length,
      phases: Array.from(predictionsByPhase.keys()),
    })

  } catch (error) {
    return handleApiError('/api/admin/reports/predictions', error)
  }
}
