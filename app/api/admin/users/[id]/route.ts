import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/session'
import { hashPassword } from '@/lib/auth/password'
import { handleApiError } from '@/lib/utils/api-error'
import { logApiError } from '@/lib/utils/logger'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Schema para actualizar usuario
const updateUserSchema = z.object({
  nombre_completo: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'El nombre es muy largo').optional(),
  email: z.string().email('El correo no es válido').optional(),
  cedula: z.string().min(6, 'La cédula debe tener al menos 6 caracteres').max(20, 'La cédula es muy larga').regex(/^[0-9]+$/, 'La cédula solo debe contener números').optional(),
  celular: z.string().min(10, 'El celular debe tener al menos 10 dígitos').max(15, 'El celular es muy largo').regex(/^[0-9]+$/, 'El celular solo debe contener números').optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
  es_admin: z.boolean().optional(),
})

/**
 * PUT - Actualizar usuario
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { id } = await params

    // Validar input
    const result = updateUserSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const updateData = result.data
    const supabase = createServiceClient()

    // Verificar que el usuario existe
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, email, cedula, celular, es_admin')
      .eq('id', id)
      .single()

    if (fetchError || !existingUser) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // No permitir quitar admin a un usuario si es el único admin
    if (updateData.es_admin === false && existingUser?.es_admin) {
      const { data: adminUsers } = await supabase
        .from('users')
        .select('id')
        .eq('es_admin', true)
        .neq('id', id)

      if (!adminUsers || adminUsers.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No se puede quitar permisos de administrador al único admin' },
          { status: 400 }
        )
      }
    }

    // Verificar duplicados si se actualizan campos únicos
    if (updateData.email && updateData.email !== existingUser.email) {
      const { data: existingByEmail } = await supabase
        .from('users')
        .select('id')
        .eq('email', updateData.email.toLowerCase())
        .neq('id', id)
        .maybeSingle()

      if (existingByEmail) {
        return NextResponse.json(
          { success: false, error: 'Ya existe un usuario con ese correo' },
          { status: 400 }
        )
      }
    }

    if (updateData.cedula && updateData.cedula !== existingUser.cedula) {
      const { data: existingByCedula } = await supabase
        .from('users')
        .select('id')
        .eq('cedula', updateData.cedula)
        .neq('id', id)
        .maybeSingle()

      if (existingByCedula) {
        return NextResponse.json(
          { success: false, error: 'Ya existe un usuario con esa cédula' },
          { status: 400 }
        )
      }
    }

    if (updateData.celular && updateData.celular !== existingUser.celular) {
      const { data: existingByCelular } = await supabase
        .from('users')
        .select('id')
        .eq('celular', updateData.celular)
        .neq('id', id)
        .maybeSingle()

      if (existingByCelular) {
        return NextResponse.json(
          { success: false, error: 'Ya existe un usuario con ese celular' },
          { status: 400 }
        )
      }
    }

    // Preparar datos para actualizar
    const updates: any = {}

    if (updateData.nombre_completo) {
      updates.nombre_completo = updateData.nombre_completo.trim()
    }
    if (updateData.email) {
      updates.email = updateData.email.toLowerCase().trim()
    }
    if (updateData.cedula) {
      updates.cedula = updateData.cedula.trim()
    }
    if (updateData.celular) {
      updates.celular = updateData.celular.trim()
    }
    if (updateData.password) {
      updates.password_hash = await hashPassword(updateData.password)
    }
    if (updateData.es_admin !== undefined) {
      updates.es_admin = updateData.es_admin
    }

    // Actualizar usuario
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('id, nombre_completo, email, cedula, celular, es_admin, creado_en')
      .single()

    if (updateError) {
      logApiError('/api/admin/users/[id]', updateError, { userId: id })
      return NextResponse.json(
        { success: false, error: 'Error al actualizar usuario' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      user: updatedUser,
    })

  } catch (error) {
    return handleApiError('/api/admin/users/[id]', error)
  }
}

/**
 * DELETE - Eliminar usuario
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await requireAdmin()

    const { id } = await params
    const supabase = createServiceClient()

    // Verificar que el usuario existe
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, es_admin')
      .eq('id', id)
      .single()

    if (fetchError || !existingUser) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // No permitir eliminar el último administrador
    if (existingUser.es_admin) {
      const { data: adminUsers } = await supabase
        .from('users')
        .select('id')
        .eq('es_admin', true)

      if (!adminUsers || adminUsers.length <= 1) {
        return NextResponse.json(
          { success: false, error: 'No se puede eliminar el único administrador' },
          { status: 400 }
        )
      }
    }

    // Eliminar usuario (esto eliminará también las predicciones relacionadas si hay foreign keys)
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (deleteError) {
      logApiError('/api/admin/users/[id]', deleteError, { userId: id })
      return NextResponse.json(
        { success: false, error: 'Error al eliminar usuario' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    })

  } catch (error) {
    return handleApiError('/api/admin/users/[id]', error)
  }
}
