import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/session'

// Tipos explícitos para respuestas de Supabase
type UserFromLink = {
  id: string
  nombre_completo: string
  email: string
  cedula: string | null
}

type RegistrationLink = {
  id: string
  token: string
  usado: boolean
  creado_en: string
  expira_en: string
  usado_por: string | null
  users: UserFromLink | null
}

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

    // Normalizar explícitamente: Supabase devuelve users como array, 
    // pero nuestro tipo espera un objeto o null
    // Si el modelo lógico es 1 link → 1 usuario, tomamos el primer elemento
    const typedLinks: RegistrationLink[] = (links ?? []).map(link => ({
      ...link,
      users: Array.isArray(link.users) 
        ? (link.users[0] as UserFromLink | null) ?? null
        : (link.users as UserFromLink | null) ?? null
    }))

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
    // Para ngrok, incluir parámetro especial para saltarse la advertencia
    const isNgrok = appUrl.includes('.ngrok') || appUrl.includes('ngrok-free') || appUrl.includes('ngrok.io')
    const formattedLinks = typedLinks.map(link => ({
      id: link.id,
      token: link.token,
      url: `${appUrl}/registro?t=${link.token}${isNgrok ? '&ngrok-skip=true' : ''}`,
      usado: link.usado,
      creado_en: link.creado_en,
      expira_en: link.expira_en,
      expirado: new Date(link.expira_en) < new Date(),
      usuario: link.users,
    }))

    // Estadísticas
    const stats = {
      total: typedLinks.length,
      usados: typedLinks.filter(link => link.usado).length,
      disponibles: typedLinks.filter(link => !link.usado).length,
      expirados: typedLinks.filter(link => new Date(link.expira_en) < new Date()).length,
    }

    return NextResponse.json({
      success: true,
      links: formattedLinks,
      stats,
    })

  } catch (error) {
    console.error('Error in GET /api/admin/links:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
