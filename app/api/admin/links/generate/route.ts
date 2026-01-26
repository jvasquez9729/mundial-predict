import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/session'
import { validateCsrfToken, csrfErrorResponse } from '@/lib/auth/csrf'
import { generateLinksSchema } from '@/lib/auth/validation'
import { handleApiError } from '@/lib/utils/api-error'
import { getAppUrl, buildRegistrationUrl } from '@/lib/supabase/helpers'
import { randomBytes } from 'crypto'

function generateToken(): string {
  return randomBytes(16).toString('hex')
}

export async function POST(request: NextRequest) {
  try {
    // Validación CSRF
    const csrfResult = await validateCsrfToken(request)
    if (!csrfResult.valid) {
      return csrfErrorResponse(csrfResult.error!)
    }

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

    // Obtener URL de la aplicación usando helper
    const appUrl = getAppUrl(request)

    // Formatear respuesta con URLs completas
    const formattedLinks = insertedLinks.map(link => ({
      id: link.id,
      token: link.token,
      url: buildRegistrationUrl(appUrl, link.token),
      creado_en: link.creado_en,
      expira_en: link.expira_en,
    }))

    return NextResponse.json({
      success: true,
      message: `${cantidad} links generados exitosamente`,
      links: formattedLinks,
    })

  } catch (error) {
    return handleApiError('/api/admin/links/generate', error)
  }
}
