import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email/resend'
import { handleApiError } from '@/lib/utils/api-error'
import { logApiError } from '@/lib/utils/logger'
import { env } from '@/lib/config/env'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, 'Ingrese su correo, cédula o celular'),
  identifier_type: z.enum(['email', 'cedula', 'celular']),
})

function generateResetToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * POST - Solicitar recuperación de contraseña
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar input
    const result = forgotPasswordSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { identifier, identifier_type } = result.data
    const supabase = createServiceClient()

    // Buscar usuario por el identificador
    let query = supabase
      .from('users')
      .select('id, nombre_completo, email')
      .eq(identifier_type === 'email' ? 'email' : identifier_type === 'cedula' ? 'cedula' : 'celular', 
          identifier_type === 'email' ? identifier.toLowerCase().trim() : identifier.trim())
      .single()

    const { data: user, error: userError } = await query

    // Por seguridad, siempre devolver éxito aunque el usuario no exista
    // Esto previene enumeración de usuarios
    if (userError || !user) {
      return NextResponse.json({
        success: true,
        message: 'Si el usuario existe, recibirás un correo con instrucciones para recuperar tu contraseña.',
      })
    }

    // Generar token de recuperación
    const token = generateResetToken()
    const expiraEn = new Date()
    expiraEn.setHours(expiraEn.getHours() + 1) // Expira en 1 hora

    // Invalidar tokens anteriores no usados del mismo usuario
    await supabase
      .from('password_reset_tokens')
      .update({ usado: true })
      .eq('user_id', user.id)
      .eq('usado', false)

    // Crear nuevo token
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: user.id,
        token,
        expira_en: expiraEn.toISOString(),
      })

    if (tokenError) {
      logApiError('/api/auth/forgot-password', tokenError, { userId: user.id })
      return NextResponse.json({
        success: true,
        message: 'Si el usuario existe, recibirás un correo con instrucciones para recuperar tu contraseña.',
      })
    }

    // Enviar email con link de recuperación
    const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/reset-password?t=${token}`

    try {
      await sendPasswordResetEmail(user.email, user.nombre_completo, resetUrl)
    } catch (emailError) {
      logApiError('/api/auth/forgot-password (email)', emailError, { userId: user.id })
      // Continuar aunque falle el email por seguridad
    }

    return NextResponse.json({
      success: true,
      message: 'Si el usuario existe, recibirás un correo con instrucciones para recuperar tu contraseña.',
    })

  } catch (error) {
    return handleApiError('/api/auth/forgot-password', error)
  }
}
