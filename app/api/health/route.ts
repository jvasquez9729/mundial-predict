import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * Health check endpoint
 * Verifica que la aplicación y servicios estén funcionando
 */
export async function GET() {
  try {
    const checks = {
      status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'unknown' as 'healthy' | 'unhealthy' | 'unknown',
      },
    }

    // Verificar conexión a base de datos
    try {
      const supabase = createServiceClient()
      const { error } = await supabase.from('users').select('id').limit(1)
      
      if (error) {
        checks.services.database = 'unhealthy'
        checks.status = 'degraded'
      } else {
        checks.services.database = 'healthy'
      }
    } catch (error) {
      checks.services.database = 'unhealthy'
      checks.status = 'degraded'
    }

    const statusCode = checks.status === 'healthy' ? 200 : 503

    return NextResponse.json(checks, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 503 }
    )
  }
}
