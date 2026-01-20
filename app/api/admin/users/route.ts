import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/session'
import { handleApiError } from '@/lib/utils/api-error'
import { logApiError } from '@/lib/utils/logger'

/**
 * GET - Obtener lista completa de usuarios con todos sus datos
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = createServiceClient()

    let query = supabase
      .from('users')
      .select(`
        id,
        nombre_completo,
        email,
        cedula,
        celular,
        es_admin,
        creado_en
      `)
      .order('creado_en', { ascending: false })
      .range(offset, offset + limit - 1)

    // Si hay búsqueda, filtrar
    if (search) {
      query = query.or(
        `nombre_completo.ilike.%${search}%,email.ilike.%${search}%,cedula.ilike.%${search}%,celular.ilike.%${search}%`
      )
    }

    const { data: users, error } = await query

    if (error) {
      logApiError('/api/admin/users', error)
      return NextResponse.json(
        { success: false, error: 'Error al obtener usuarios' },
        { status: 500 }
      )
    }

    // Obtener total de usuarios
    let countQuery = supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (search) {
      countQuery = countQuery.or(
        `nombre_completo.ilike.%${search}%,email.ilike.%${search}%,cedula.ilike.%${search}%,celular.ilike.%${search}%`
      )
    }

    const { count } = await countQuery

    return NextResponse.json({
      success: true,
      users: users || [],
      total: count || 0,
      pagination: {
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    })

  } catch (error) {
    return handleApiError('/api/admin/users', error)
  }
}
