import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/session'
import { writeToSheet } from '@/lib/google/sheets'
import { handleApiError } from '@/lib/utils/api-error'
import { logApiError } from '@/lib/utils/logger'

/**
 * GET - Generar reporte de usuarios registrados y exportarlo a Google Sheets
 */
export async function GET() {
  try {
    await requireAdmin()

    const supabase = createServiceClient()

    // Obtener todos los usuarios registrados
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        nombre_completo,
        email,
        cedula,
        celular,
        creado_en,
        es_admin
      `)
      .eq('es_admin', false)
      .order('creado_en', { ascending: false })

    if (usersError) {
      logApiError('/api/admin/reports/users', usersError)
      throw new Error('Error al obtener usuarios')
    }

    // Obtener los links de registro usados por cada usuario
    const userIds = users?.map(u => u.id) || []
    const { data: registrationLinks } = await supabase
      .from('registration_links')
      .select('token, creado_en, usado_por')
      .in('usado_por', userIds)
      .eq('usado', true)

    // Crear un mapa de usuario -> link
    const linkMap = new Map<string, { token: string; creado_en: string }>()
    registrationLinks?.forEach(link => {
      if (link.usado_por) {
        linkMap.set(link.usado_por, {
          token: link.token,
          creado_en: link.creado_en,
        })
      }
    })

    // Preparar headers
    const headers = [
      'Fecha de Registro',
      'Nombre Completo',
      'Email',
      'Cédula',
      'Celular',
      'Link de Registro Usado',
      'Fecha del Link',
    ]

    // Preparar filas
    const rows = (users || []).map((user) => {
      const link = linkMap.get(user.id)

      return [
        new Date(user.creado_en).toLocaleString('es-CO', {
          dateStyle: 'short',
          timeStyle: 'short',
        }),
        user.nombre_completo || '',
        user.email || '',
        user.cedula || '',
        user.celular || '',
        link?.token || 'N/A',
        link?.creado_en 
          ? new Date(link.creado_en).toLocaleString('es-CO', {
              dateStyle: 'short',
              timeStyle: 'short',
            })
          : 'N/A',
      ]
    })

    // Escribir a Google Sheets
    const sheetName = `Usuarios Registrados - ${new Date().toLocaleDateString('es-CO')}`
    await writeToSheet(sheetName, headers, rows)

    return NextResponse.json({
      success: true,
      message: `Reporte de ${users?.length || 0} usuarios exportado exitosamente a Google Sheets`,
      sheetName,
      totalUsers: users?.length || 0,
    })

  } catch (error) {
    return handleApiError('/api/admin/reports/users', error)
  }
}
