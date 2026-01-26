import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * Cron job diario que ejecuta todas las tareas de mantenimiento
 * Compatible con plan Hobby de Vercel (máximo 1 vez al día)
 * 
 * Este endpoint ejecuta:
 * 1. Sincronización de partidos
 * 2. Verificación de deadlines
 * 3. Cálculo de puntos
 */
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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const results = {
      syncMatches: { success: false, message: '' },
      checkDeadlines: { success: false, message: '' },
      calculatePoints: { success: false, message: '' },
    }

    // 1. Sincronizar partidos
    try {
      const syncResponse = await fetch(`${appUrl}/api/cron/sync-matches`, {
        method: 'GET',
        headers: cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {},
      })
      const syncData = await syncResponse.json()
      results.syncMatches = {
        success: syncResponse.ok && syncData.success,
        message: syncData.message || syncData.error || 'Error desconocido',
      }
    } catch (error) {
      results.syncMatches = {
        success: false,
        message: error instanceof Error ? error.message : 'Error al sincronizar partidos',
      }
    }

    // 2. Verificar deadlines
    try {
      const deadlinesResponse = await fetch(`${appUrl}/api/cron/check-deadlines`, {
        method: 'GET',
        headers: cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {},
      })
      const deadlinesData = await deadlinesResponse.json()
      results.checkDeadlines = {
        success: deadlinesResponse.ok && deadlinesData.success,
        message: deadlinesData.message || deadlinesData.error || 'Error desconocido',
      }
    } catch (error) {
      results.checkDeadlines = {
        success: false,
        message: error instanceof Error ? error.message : 'Error al verificar deadlines',
      }
    }

    // 3. Calcular puntos
    try {
      const pointsResponse = await fetch(`${appUrl}/api/cron/calculate-points`, {
        method: 'GET',
        headers: cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {},
      })
      const pointsData = await pointsResponse.json()
      results.calculatePoints = {
        success: pointsResponse.ok && pointsData.success,
        message: pointsData.message || pointsData.error || 'Error desconocido',
      }
    } catch (error) {
      results.calculatePoints = {
        success: false,
        message: error instanceof Error ? error.message : 'Error al calcular puntos',
      }
    }

    const allSuccess = results.syncMatches.success && 
                       results.checkDeadlines.success && 
                       results.calculatePoints.success

    return NextResponse.json({
      success: allSuccess,
      message: 'Cron job diario ejecutado',
      timestamp: new Date().toISOString(),
      results,
    })

  } catch (error) {
    console.error('Daily cron error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al ejecutar cron job diario',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
