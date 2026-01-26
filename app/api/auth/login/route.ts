import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyPassword } from '@/lib/auth/password'
import { loginSchema } from '@/lib/auth/validation'
import { createSession } from '@/lib/auth/session'
import { setCsrfCookie } from '@/lib/auth/csrf'
import { handleApiError } from '@/lib/utils/api-error'
import { rateLimitAuth } from '@/lib/utils/rate-limit'

// Tipo explícito para el usuario en login
type UserForLogin = {
  id: string
  nombre_completo: string
  email: string
  cedula: string | null
  celular: string
  password_hash: string
  es_admin: boolean
  creado_en: string
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting para login
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const rateLimitResult = rateLimitAuth(ip)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Demasiados intentos. Intenta más tarde.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          }
        }
      )
    }

    const body = await request.json()

    // Validar input
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { identifier, password, identifier_type } = result.data
    const supabase = createServiceClient()

    // Buscar usuario por el identificador
    let query = supabase.from('users').select('*')

    switch (identifier_type) {
      case 'email':
        query = query.eq('email', identifier.toLowerCase().trim())
        break
      case 'cedula':
        query = query.eq('cedula', identifier.trim())
        break
      case 'celular':
        query = query.eq('celular', identifier.trim())
        break
    }

    const { data: user, error } = await query.single()

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 401 }
      )
    }

    // Tipo explícito definido arriba
    const typedUser: UserForLogin = user as UserForLogin

    // Verificar contraseña
    const isValid = await verifyPassword(password, typedUser.password_hash)
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Contraseña incorrecta' },
        { status: 401 }
      )
    }

    // Crear sesión y token CSRF
    await createSession({
      userId: typedUser.id,
      email: typedUser.email,
      esAdmin: typedUser.es_admin,
    })
    await setCsrfCookie()

    return NextResponse.json({
      success: true,
      user: {
        id: typedUser.id,
        nombre_completo: typedUser.nombre_completo,
        email: typedUser.email,
        es_admin: typedUser.es_admin,
      },
    })

  } catch (error) {
    return handleApiError('/api/auth/login', error)
  }
}
