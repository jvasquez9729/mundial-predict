import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/session'
import { validateCsrfToken, csrfErrorResponse } from '@/lib/auth/csrf'
import { hashPassword } from '@/lib/auth/password'
import { handleApiError, ApiError } from '@/lib/utils/api-error'
import { logApiError } from '@/lib/utils/logger'
import { z } from 'zod'

type RouteContext = { params: Promise<{ id: string }> }

function validateUserId(id: unknown): string | null {
  if (id == null || typeof id !== 'string') return null
  const t = id.trim()
  return t.length > 0 ? t : null
}

// Tipos explícitos para respuestas de Supabase
type ExistingUser = {
  id: string
  email: string
  cedula: string | null
  celular: string
  es_admin: boolean
}

type AdminUser = {
  id: string
}

type UpdatedUser = {
  id: string
  nombre_completo: string
  email: string
  cedula: string | null
  celular: string
  es_admin: boolean
  creado_en: string
}

type UserForDelete = {
  id: string
  es_admin: boolean
}

type DuplicateCheck = {
  id: string
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
  { params }: RouteContext
) {
  try {
    const csrfResult = await validateCsrfToken(request)
    if (!csrfResult.valid) {
      return csrfErrorResponse(csrfResult.error!)
    }

    await requireAdmin()

    let resolved: { id?: string }
    try {
      resolved = await params
    } catch (e) {
      logApiError('/api/admin/users/[id]', e, { operation: 'params' })
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      )
    }
    const userId = validateUserId(resolved?.id)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch (e) {
      logApiError('/api/admin/users/[id]', e, { operation: 'json', userId })
      return NextResponse.json(
        { success: false, error: 'Cuerpo inválido' },
        { status: 400 }
      )
    }

    const result = updateUserSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const updateData = result.data
    const supabase = createServiceClient()

    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, email, cedula, celular, es_admin')
      .eq('id', userId)
      .single()

    if (fetchError || !existingUser) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const user: ExistingUser = existingUser as ExistingUser

    if (updateData.es_admin === false && user.es_admin === true) {
      const { data: adminUsers, error: adminError } = await supabase
        .from('users')
        .select('id')
        .eq('es_admin', true)
        .neq('id', userId)

      if (adminError) {
        logApiError('/api/admin/users/[id]', adminError, { userId })
        throw new ApiError(500, 'Error al verificar administradores')
      }

      // Tipo explícito definido arriba
      const admins: AdminUser[] = (adminUsers || []) as AdminUser[]
      if (admins.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No se puede quitar permisos de administrador al único admin' },
          { status: 400 }
        )
      }
    }

    // Verificar duplicados si se actualizan campos únicos
    if (updateData.email && updateData.email !== user.email) {
      const { data: existingByEmail } = await supabase
        .from('users')
        .select('id')
        .eq('email', updateData.email.toLowerCase())
        .neq('id', userId)
        .maybeSingle()

      if (existingByEmail) {
        const duplicate: DuplicateCheck = existingByEmail as DuplicateCheck
        if (duplicate.id) {
          return NextResponse.json(
            { success: false, error: 'Ya existe un usuario con ese correo' },
            { status: 400 }
          )
        }
      }
    }

    if (updateData.cedula && updateData.cedula !== user.cedula) {
      const { data: existingByCedula } = await supabase
        .from('users')
        .select('id')
        .eq('cedula', updateData.cedula)
        .neq('id', userId)
        .maybeSingle()

      if (existingByCedula) {
        const duplicate: DuplicateCheck = existingByCedula as DuplicateCheck
        if (duplicate.id) {
          return NextResponse.json(
            { success: false, error: 'Ya existe un usuario con esa cédula' },
            { status: 400 }
          )
        }
      }
    }

    if (updateData.celular && updateData.celular !== user.celular) {
      const { data: existingByCelular } = await supabase
        .from('users')
        .select('id')
        .eq('celular', updateData.celular)
        .neq('id', userId)
        .maybeSingle()

      if (existingByCelular) {
        const duplicate: DuplicateCheck = existingByCelular as DuplicateCheck
        if (duplicate.id) {
          return NextResponse.json(
            { success: false, error: 'Ya existe un usuario con ese celular' },
            { status: 400 }
          )
        }
      }
    }

    // Preparar datos para actualizar
    const updates: Record<string, any> = {}

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

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No hay datos para actualizar' },
        { status: 400 }
      )
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('id, nombre_completo, email, cedula, celular, es_admin, creado_en')
      .single()

    if (updateError) {
      logApiError('/api/admin/users/[id]', updateError, { userId })
      throw new ApiError(500, 'Error al actualizar usuario')
    }

    // Tipo explícito definido arriba
    const updated: UpdatedUser = updatedUser as UpdatedUser

    return NextResponse.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      user: updated,
    })

  } catch (error) {
    logApiError('/api/admin/users/[id]', error, { operation: 'PUT' })
    const res = handleApiError('/api/admin/users/[id]', error)
    if (
      process.env.NODE_ENV === 'development' &&
      error instanceof Error &&
      res.status === 500
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Error interno del servidor',
          debug: error.message,
          name: error.name,
        },
        { status: 500 }
      )
    }
    return res
  }
}

/**
 * DELETE - Eliminar usuario
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const csrfResult = await validateCsrfToken(request)
    if (!csrfResult.valid) {
      return csrfErrorResponse(csrfResult.error!)
    }

    await requireAdmin()

    let resolved: { id?: string }
    try {
      resolved = await params
    } catch (e) {
      logApiError('/api/admin/users/[id]', e, { operation: 'params' })
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      )
    }
    const userId = validateUserId(resolved?.id)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, es_admin')
      .eq('id', userId)
      .single()

    if (fetchError || !existingUser) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const user: UserForDelete = existingUser as UserForDelete

    if (user.es_admin === true) {
      const { data: adminUsers, error: adminError } = await supabase
        .from('users')
        .select('id')
        .eq('es_admin', true)

      if (adminError) {
        logApiError('/api/admin/users/[id]', adminError, { userId })
        throw new ApiError(500, 'Error al verificar administradores')
      }

      const admins: AdminUser[] = (adminUsers || []) as AdminUser[]
      if (admins.length <= 1) {
        return NextResponse.json(
          { success: false, error: 'No se puede eliminar el único administrador' },
          { status: 400 }
        )
      }
    }

    // registration_links.usado_por REFERENCES users(id) sin ON DELETE → rompe el DELETE.
    // Desvincular primero para que el delete no falle por FK.
    const { error: unlinkError } = await supabase
      .from('registration_links')
      .update({ usado_por: null })
      .eq('usado_por', userId)

    if (unlinkError) {
      logApiError('/api/admin/users/[id]', unlinkError, { userId })
      throw new ApiError(500, 'Error al desvincular links de registro')
    }

    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (deleteError) {
      logApiError('/api/admin/users/[id]', deleteError, { userId })
      throw new ApiError(500, 'Error al eliminar usuario')
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    })
  } catch (error) {
    logApiError('/api/admin/users/[id]', error, { operation: 'DELETE' })
    const res = handleApiError('/api/admin/users/[id]', error)
    if (
      process.env.NODE_ENV === 'development' &&
      error instanceof Error &&
      res.status === 500
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Error interno del servidor',
          debug: error.message,
          name: error.name,
        },
        { status: 500 }
      )
    }
    return res
  }
}
