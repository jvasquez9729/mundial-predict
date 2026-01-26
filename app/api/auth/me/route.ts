import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { handleApiError } from '@/lib/utils/api-error'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user,
    })

  } catch (error) {
    return handleApiError('/api/auth/me', error)
  }
}
