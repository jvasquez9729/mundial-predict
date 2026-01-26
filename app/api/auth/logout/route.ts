import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/auth/session'
import { deleteCsrfCookie } from '@/lib/auth/csrf'
import { handleApiError } from '@/lib/utils/api-error'

export async function POST() {
  try {
    // Eliminar sesión y token CSRF
    await deleteSession()
    await deleteCsrfCookie()

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError('/api/auth/logout', error)
  }
}
