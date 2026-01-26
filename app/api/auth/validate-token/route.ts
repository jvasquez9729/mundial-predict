import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Tipo explícito para el link de registro
type RegistrationLinkForValidation = {
  id: string
  token: string
  usado: boolean
  expira_en: string
  creado_en: string
}

/**
 * GET - Validar si un token de registro es válido, no usado y no expirado
 * Esto es más eficiente que hacer una petición POST completa solo para validar
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('t')

    if (!token) {
      return NextResponse.json(
        { success: false, valid: false, error: 'Token no proporcionado' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Verificar token de registro
    const { data: linkData, error: linkError } = await supabase
      .from('registration_links')
      .select('id, token, usado, expira_en, creado_en')
      .eq('token', token)
      .single()

    if (linkError || !linkData) {
      return NextResponse.json(
        { success: true, valid: false, error: 'Link de registro inválido' },
        { status: 200 } // 200 porque la petición fue exitosa, solo que el token no es válido
      )
    }

    // Tipo explícito definido arriba
    const typedLink: RegistrationLinkForValidation = linkData as RegistrationLinkForValidation

    // Verificar si ya fue usado
    if (typedLink.usado) {
      return NextResponse.json(
        { success: true, valid: false, error: 'Este link ya fue utilizado' },
        { status: 200 }
      )
    }

    // Verificar si expiró
    if (new Date(typedLink.expira_en) < new Date()) {
      return NextResponse.json(
        { success: true, valid: false, error: 'Este link ha expirado' },
        { status: 200 }
      )
    }

    // Token válido
    return NextResponse.json({
      success: true,
      valid: true,
      expira_en: typedLink.expira_en,
    })

  } catch (error) {
    console.error('Validate token error:', error)
    return NextResponse.json(
      { success: false, valid: false, error: 'Error al validar token' },
      { status: 500 }
    )
  }
}
