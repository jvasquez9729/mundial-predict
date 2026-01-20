import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/session'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const supabase = createServiceClient()

    const { data: links, error } = await supabase
      .from('registration_links')
      .select(`
        id,
        token,
        usado,
        creado_en,
        expira_en,
        usado_por,
        users:usado_por (
          id,
          nombre_completo,
          email,
          cedula
        )
      `)
      .order('creado_en', { ascending: false })

    if (error) {
      console.error('Error fetching links:', error)
      return NextResponse.json(
        { success: false, error: 'Error al obtener links' },
        { status: 500 }
      )
    }

    // Obtener URL de la aplicación
    // Prioridad: 1) NEXT_PUBLIC_APP_URL, 2) Host del request, 3) localhost
    let appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    
    // Si no está configurado, intentar usar el host del request
    if (!appUrl || appUrl.includes('localhost')) {
      const host = request.headers.get('host') || ''
      const protocol = request.headers.get('x-forwarded-proto') || 
                       (host.includes('localhost') ? 'http' : 'https')
      
      if (host) {
        appUrl = `${protocol}://${host}`
      } else {
        appUrl = 'http://localhost:3000'
      }
    }
    
    // Formatear respuesta
    const formattedLinks = links.map(link => ({
      id: link.id,
      token: link.token,
      url: `${appUrl}/registro?t=${link.token}`,
      usado: link.usado,
      creado_en: link.creado_en,
      expira_en: link.expira_en,
      expirado: new Date(link.expira_en) < new Date(),
      usuario: link.users,
    }))

    // Estadísticas
    const stats = {
      total: links.length,
      usados: links.filter(l => l.usado).length,
      disponibles: links.filter(l => !l.usado && new Date(l.expira_en) >= new Date()).length,
      expirados: links.filter(l => !l.usado && new Date(l.expira_en) < new Date()).length,
    }

    return NextResponse.json({
      success: true,
      links: formattedLinks,
      stats,
    })

  } catch (error) {
    if (error instanceof Error && error.message === 'No autenticado') {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      )
    }
    if (error instanceof Error && error.message === 'No autorizado') {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 }
      )
    }
    console.error('Get links error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
