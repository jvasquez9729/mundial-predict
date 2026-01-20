import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { hashPassword } from '@/lib/auth/password'
import { registerSchema } from '@/lib/auth/validation'
import { handleApiError } from '@/lib/utils/api-error'
import { logApiError } from '@/lib/utils/logger'
import { rateLimitAuth } from '@/lib/utils/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting para registro
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const rateLimitResult = rateLimitAuth(ip)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Demasiados intentos. Intenta más tarde.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          }
        }
      )
    }

    const body = await request.json()

    // Validar input
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { nombre_completo, cedula, email, celular, password, token } = result.data

    const supabase = createServiceClient()

    // Verificar token de registro
    const { data: linkData, error: linkError } = await supabase
      .from('registration_links')
      .select('*')
      .eq('token', token)
      .single()

    if (linkError || !linkData) {
      return NextResponse.json(
        { success: false, error: 'Link de registro inválido' },
        { status: 400 }
      )
    }

    if (linkData.usado) {
      return NextResponse.json(
        { success: false, error: 'Este link ya fue utilizado' },
        { status: 400 }
      )
    }

    if (new Date(linkData.expira_en) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Este link ha expirado' },
        { status: 400 }
      )
    }

    // Verificar duplicados (solo si cédula fue proporcionada)
    if (cedula) {
      const { data: existingByCedula } = await supabase
        .from('users')
        .select('id')
        .eq('cedula', cedula)
        .maybeSingle()

      if (existingByCedula) {
        return NextResponse.json(
          { success: false, error: 'Ya existe un usuario con esa cédula' },
          { status: 400 }
        )
      }
    }

    const { data: existingByEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (existingByEmail) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un usuario con ese correo' },
        { status: 400 }
      )
    }

    const { data: existingByCelular } = await supabase
      .from('users')
      .select('id')
      .eq('celular', celular)
      .maybeSingle()

    if (existingByCelular) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un usuario con ese celular' },
        { status: 400 }
      )
    }

    // Crear usuario
    const password_hash = await hashPassword(password)

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        nombre_completo: nombre_completo.trim(),
        cedula: cedula || null, // Permitir null si no se proporciona
        email: email.toLowerCase().trim(),
        celular, // Ya incluye código de país
        password_hash,
        es_admin: false,
      })
      .select('id, nombre_completo, email')
      .single()

    if (userError) {
      logApiError('/api/auth/register', userError, { email })
      return NextResponse.json(
        { success: false, error: 'Error al crear el usuario' },
        { status: 500 }
      )
    }

    // Marcar link como usado
    await supabase
      .from('registration_links')
      .update({ usado: true, usado_por: user.id })
      .eq('id', linkData.id)

    // Crear registro de predicciones especiales vacío
    await supabase
      .from('special_predictions')
      .insert({ user_id: user.id })

    return NextResponse.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        nombre_completo: user.nombre_completo,
        email: user.email,
      },
    })

  } catch (error) {
    return handleApiError('/api/auth/register', error)
  }
}
