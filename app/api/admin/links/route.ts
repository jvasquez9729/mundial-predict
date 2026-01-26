import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/session'
import {
  normalizeRelation,
  getAppUrl,
  buildRegistrationUrl
} from '@/lib/supabase/helpers'
import { createApiLogger } from '@/lib/utils/logger'

const ROUTE = '/api/admin/links'

// Tipos para la respuesta
interface UserFromLink {
  id: string
  nombre_completo: string
  email: string
  cedula: string | null
}

interface RegistrationLinkRaw {
  id: string
  token: string
  usado: boolean
  creado_en: string
  expira_en: string
  usado_por: string | null
  users: UserFromLink | UserFromLink[] | null
}

interface FormattedLink {
  id: string
  token: string
  url: string
  usado: boolean
  creado_en: string
  expira_en: string
  expirado: boolean
  usuario: UserFromLink | null
}

interface LinkStats {
  total: number
  usados: number
  disponibles: number
  expirados: number
}

export async function GET(request: NextRequest) {
  const log = createApiLogger(ROUTE)

  try {
    await requireAdmin()

    const supabase = createServiceClient()

    const { data: links, error } = await supabase
      .from('registration_links')
      .select(`
        id,
        token,
        usado,
        creado_en,
        expira_en,
        usado_por,
        users:usado_por (
          id,
          nombre_completo,
          email,
          cedula
        )
      `)
      .order('creado_en', { ascending: false })

    if (error) {
      log.error('Failed to fetch registration links', error)
      return NextResponse.json(
        { success: false, error: 'Error al obtener links' },
        { status: 500 }
      )
    }

    const rawLinks = (links ?? []) as RegistrationLinkRaw[]
    const appUrl = getAppUrl(request)
    const now = new Date()

    // Transformar y normalizar los links
    const formattedLinks: FormattedLink[] = rawLinks.map(link => ({
      id: link.id,
      token: link.token,
      url: buildRegistrationUrl(appUrl, link.token),
      usado: link.usado,
      creado_en: link.creado_en,
      expira_en: link.expira_en,
      expirado: new Date(link.expira_en) < now,
      usuario: normalizeRelation(link.users),
    }))

    // Calcular estadísticas
    const stats: LinkStats = {
      total: formattedLinks.length,
      usados: formattedLinks.filter(l => l.usado).length,
      disponibles: formattedLinks.filter(l => !l.usado && !l.expirado).length,
      expirados: formattedLinks.filter(l => l.expirado).length,
    }

    log.debug('Links fetched successfully', { stats })

    return NextResponse.json({
      success: true,
      links: formattedLinks,
      stats,
    })

  } catch (error) {
    log.error('Error fetching links', error as Error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
