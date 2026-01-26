import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/auth/session'
import { deleteCsrfCookie } from '@/lib/auth/csrf'

export async function POST() {
  try {
    // Eliminar sesión y token CSRF
    await deleteSession()
    await deleteCsrfCookie()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al cerrar sesión' },
      { status: 500 }
    )
  }
}
