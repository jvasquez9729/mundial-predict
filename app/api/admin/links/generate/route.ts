import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/session'
import { generateLinksSchema } from '@/lib/auth/validation'
import { randomBytes } from 'crypto'

function generateToken(): string {
  return randomBytes(16).toString('hex')
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()

    // Validar input
    const result = generateLinksSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { cantidad } = result.data
    const supabase = createServiceClient()

    // Generar links
    const links = []
    const expiraEn = new Date()
    expiraEn.setHours(expiraEn.getHours() + 48) // Expiran en 48 horas

    for (let i = 0; i < cantidad; i++) {
      links.push({
        token: generateToken(),
        expira_en: expiraEn.toISOString(),
      })
    }

    // Insertar en la base de datos
    const { data: insertedLinks, error } = await supabase
      .from('registration_links')
      .insert(links)
      .select('id, token, creado_en, expira_en')

    if (error) {
      console.error('Error generating links:', error)
      return NextResponse.json(
        { success: false, error: 'Error al generar links' },
        { status: 500 }
      )
    }

    // Obtener URL de la aplicación
    // Prioridad: 1) NEXT_PUBLIC_APP_URL, 2) Host del request (si es URL pública), 3) localhost
    let appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    
    // Si no está configurado o es localhost, intentar usar el host del request
    if (!appUrl || appUrl.includes('localhost') || appUrl.includes('127.0.0.1')) {
      const host = request.headers.get('host') || ''
      const protocol = request.headers.get('x-forwarded-proto') || 
                       request.headers.get('x-forwarded-proto') ||
                       (host.includes('localhost') || host.includes('127.0.0.1') || host.startsWith('192.168.') || host.startsWith('10.') || host.startsWith('172.')) 
                         ? 'http' 
                         : 'https'
      
      // Si el host es una URL pública (ngrok, vercel, etc.), usarla
      if (host && (host.includes('.ngrok') || host.includes('.vercel') || host.includes('.netlify') || host.includes('.app') || !host.includes('192.168') && !host.includes('10.') && !host.includes('172.'))) {
        appUrl = `${protocol}://${host}`
      } else if (host) {
        // IP local o localhost - solo usar si no hay URL pública configurada
        appUrl = `${protocol}://${host}`
      } else {
        appUrl = 'http://localhost:3000'
      }
    }
    
    // Formatear respuesta con URLs completas
    // Para ngrok, usar ruta especial que incluye el header para saltarse la advertencia
    const isNgrok = appUrl.includes('.ngrok') || appUrl.includes('ngrok-free') || appUrl.includes('ngrok.io')
    const formattedLinks = insertedLinks.map(link => ({
      id: link.id,
      token: link.token,
      // Usar ruta especial /registro/redirect para ngrok, que incluye el header necesario
      url: isNgrok 
        ? `${appUrl}/registro/redirect?t=${link.token}`
        : `${appUrl}/registro?t=${link.token}`,
      creado_en: link.creado_en,
      expira_en: link.expira_en,
    }))

    return NextResponse.json({
      success: true,
      message: `${cantidad} links generados exitosamente`,
      links: formattedLinks,
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
    console.error('Generate links error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
