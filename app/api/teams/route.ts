import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'
import { handleApiError } from '@/lib/utils/api-error'
import { logApiError } from '@/lib/utils/logger'

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

    const { data: teams, error } = await supabase
      .from('teams')
      .select('id, nombre, codigo, bandera_url, grupo')
      .order('grupo', { ascending: true })
      .order('nombre', { ascending: true })

    if (error) {
      logApiError('/api/teams', error, { userId: session.userId })
      return NextResponse.json(
        { success: false, error: 'Error al obtener equipos' },
        { status: 500 }
      )
    }

    // Agrupar por grupo para facilitar el frontend
    const teamsByGroup = teams.reduce((acc, team) => {
      const group = team.grupo || 'Sin grupo'
      if (!acc[group]) {
        acc[group] = []
      }
      acc[group].push(team)
      return acc
    }, {} as Record<string, typeof teams>)

    return NextResponse.json({
      success: true,
      teams,
      teamsByGroup,
      total: teams.length,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })

  } catch (error) {
    return handleApiError('/api/teams', error)
  }
}
