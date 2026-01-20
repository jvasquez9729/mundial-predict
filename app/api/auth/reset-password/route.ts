import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { hashPassword } from '@/lib/auth/password'
import { handleApiError } from '@/lib/utils/api-error'
import { logApiError } from '@/lib/utils/logger'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(100, 'La contraseña es muy larga'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm_password'],
})

/**
 * POST - Resetear contraseña con token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar input
    const result = resetPasswordSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { token, password } = result.data
    const supabase = createServiceClient()

    // Buscar token válido
    const { data: tokenData, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('id, user_id, usado, expira_en')
      .eq('token', token)
      .eq('usado', false)
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { success: false, error: 'Token inválido o no encontrado' },
        { status: 400 }
      )
    }

    // Verificar que no haya expirado
    if (new Date(tokenData.expira_en) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Este token ha expirado. Solicita uno nuevo.' },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', tokenData.user_id)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar contraseña
    const password_hash = await hashPassword(password)

    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash })
      .eq('id', user.id)

    if (updateError) {
      logApiError('/api/auth/reset-password', updateError, { userId: user.id })
      return NextResponse.json(
        { success: false, error: 'Error al actualizar contraseña' },
        { status: 500 }
      )
    }

    // Marcar token como usado
    await supabase
      .from('password_reset_tokens')
      .update({ usado: true })
      .eq('id', tokenData.id)

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada exitosamente. Ahora puedes iniciar sesión.',
    })

  } catch (error) {
    return handleApiError('/api/auth/reset-password', error)
  }
}
