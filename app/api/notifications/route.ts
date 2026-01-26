import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'
import { validateCsrfToken, csrfErrorResponse } from '@/lib/auth/csrf'
import { z } from 'zod'
import { handleApiError } from '@/lib/utils/api-error'
import { logApiError } from '@/lib/utils/logger'

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
})

// GET - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      )
    }

    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // Si se solicita marcar todas como leídas
    if (action === 'mark-all-read') {
      // Por ahora retornamos éxito, cuando tengamos tabla de notificaciones se actualizará
      return NextResponse.json({
        success: true,
        message: 'Notificaciones marcadas como leídas',
      })
    }

    // Por ahora retornamos notificaciones mock hasta tener tabla
    // TODO: Implementar tabla de notificaciones en la base de datos
    const mockNotifications: unknown[] = []

    return NextResponse.json({
      success: true,
      notifications: mockNotifications,
      unreadCount: mockNotifications.filter((n: any) => !n.leida).length,
    })

  } catch (error) {
    return handleApiError('/api/notifications', error)
  }
}

// PUT - Mark notification as read or mark all as read
export async function PUT(request: NextRequest) {
  try {
    // Validación CSRF
    const csrfResult = await validateCsrfToken(request)
    if (!csrfResult.valid) {
      return csrfErrorResponse(csrfResult.error!)
    }

    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    // Si hay un ID, marcar esa notificación como leída
    if (id) {
      // TODO: Actualizar notificación en la base de datos
      return NextResponse.json({
        success: true,
        message: 'Notificación marcada como leída',
      })
    }

    // Si no hay ID, marcar todas como leídas
    // TODO: Actualizar todas las notificaciones del usuario
    return NextResponse.json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas',
    })

  } catch (error) {
    return handleApiError('/api/notifications', error)
  }
}

// POST - Subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    // Validación CSRF
    const csrfResult = await validateCsrfToken(request)
    if (!csrfResult.valid) {
      return csrfErrorResponse(csrfResult.error!)
    }

    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const result = subscriptionSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Datos de suscripción inválidos' },
        { status: 400 }
      )
    }

    const { endpoint, keys } = result.data
    const supabase = createServiceClient()

    // Upsert subscription
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: session.userId,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
        {
          onConflict: 'user_id',
        }
      )

    if (error) {
      logApiError('/api/notifications (POST)', error)
      return NextResponse.json(
        { success: false, error: 'Error al guardar suscripción' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Suscripción guardada exitosamente',
    })

  } catch (error) {
    return handleApiError('/api/notifications', error)
  }
}

// DELETE - Unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
  try {
    // Validación CSRF
    const csrfResult = await validateCsrfToken(request)
    if (!csrfResult.valid) {
      return csrfErrorResponse(csrfResult.error!)
    }

    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      )
    }

    const supabase = createServiceClient()

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', session.userId)

    if (error) {
      logApiError('/api/notifications (DELETE)', error)
      return NextResponse.json(
        { success: false, error: 'Error al eliminar suscripción' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Suscripción eliminada exitosamente',
    })

  } catch (error) {
    return handleApiError('/api/notifications', error)
  }
}
