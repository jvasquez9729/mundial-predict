import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { hashPassword } from '@/lib/auth/password'
import { registerSchema } from '@/lib/auth/validation'
import { handleApiError } from '@/lib/utils/api-error'
import { createApiLogger } from '@/lib/utils/logger'
import { rateLimitAuth } from '@/lib/utils/rate-limit'

const ROUTE = '/api/auth/register'

export async function POST(request: NextRequest) {
  const log = createApiLogger(ROUTE)

  try {
    // Rate limiting para registro
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown'
    const rateLimitResult = await rateLimitAuth(ip)

    if (!rateLimitResult.allowed) {
      log.warn('Rate limit exceeded', { ip, retryAfter: rateLimitResult.retryAfter })
      return NextResponse.json(
        {
          success: false,
          error: 'Demasiados intentos. Intenta más tarde.',
          retryAfter: rateLimitResult.retryAfter
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter.toString(),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          }
        }
      )
    }

    const body = await request.json()

    // Validar input
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      log.debug('Validation failed', { errors: result.error.errors })
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { nombre_completo, cedula, email, celular, password, token } = result.data

    const supabase = createServiceClient()

    // Verificar token de registro
    const { data: linkData, error: linkError } = await supabase
      .from('registration_links')
      .select('id, token, usado, expira_en')
      .eq('token', token)
      .single()

    if (linkError || !linkData) {
      log.warn('Invalid registration token', { token: token.substring(0, 8) + '...' })
      return NextResponse.json(
        { success: false, error: 'Link de registro inválido' },
        { status: 400 }
      )
    }

    if (linkData.usado) {
      return NextResponse.json(
        { success: false, error: 'Este link ya fue utilizado' },
        { status: 400 }
      )
    }

    if (new Date(linkData.expira_en) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Este link ha expirado' },
        { status: 400 }
      )
    }

    // Verificar duplicados
    const duplicateCheck = await checkDuplicateUser(supabase, { cedula, email, celular })
    if (duplicateCheck.exists) {
      return NextResponse.json(
        { success: false, error: duplicateCheck.message },
        { status: 400 }
      )
    }

    // Crear usuario
    const password_hash = await hashPassword(password)

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        nombre_completo: nombre_completo.trim(),
        cedula: cedula || null,
        email: email.toLowerCase().trim(),
        celular,
        password_hash,
        es_admin: false,
      })
      .select('id, nombre_completo, email')
      .single()

    if (userError || !user?.id) {
      log.error('Failed to create user', userError ?? undefined, { email })
      const errorMessage = parseUserCreationError(userError)
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      )
    }

    log.info('User created successfully', { userId: user.id, email: user.email })

    // Marcar link como usado (no bloquea si falla)
    await markLinkAsUsed(supabase, linkData.id, user.id, log)

    // Crear registro de predicciones especiales vacío (no bloquea si falla)
    await createEmptySpecialPredictions(supabase, user.id, log)

    return NextResponse.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        nombre_completo: user.nombre_completo,
        email: user.email,
      },
    })

  } catch (error) {
    return handleApiError(ROUTE, error)
  }
}

// --- Helper Functions ---

interface DuplicateCheckResult {
  exists: boolean
  message: string
}

async function checkDuplicateUser(
  supabase: ReturnType<typeof createServiceClient>,
  data: { cedula: string | null; email: string; celular: string }
): Promise<DuplicateCheckResult> {
  // Verificar cédula (solo si fue proporcionada)
  if (data.cedula) {
    const { data: existingByCedula } = await supabase
      .from('users')
      .select('id')
      .eq('cedula', data.cedula)
      .maybeSingle()

    if (existingByCedula) {
      return { exists: true, message: 'Ya existe un usuario con esa cédula' }
    }
  }

  // Verificar email
  const { data: existingByEmail } = await supabase
    .from('users')
    .select('id')
    .eq('email', data.email.toLowerCase())
    .maybeSingle()

  if (existingByEmail) {
    return { exists: true, message: 'Ya existe un usuario con ese correo' }
  }

  // Verificar celular
  const { data: existingByCelular } = await supabase
    .from('users')
    .select('id')
    .eq('celular', data.celular)
    .maybeSingle()

  if (existingByCelular) {
    return { exists: true, message: 'Ya existe un usuario con ese celular' }
  }

  return { exists: false, message: '' }
}

function parseUserCreationError(error: { code?: string; message?: string } | null): string {
  if (!error) return 'Error al crear el usuario: No se devolvió el usuario'

  // Violación de restricción única (PostgreSQL error code)
  if (error.code === '23505') {
    if (error.message?.includes('email')) return 'Ya existe un usuario con ese correo'
    if (error.message?.includes('cedula')) return 'Ya existe un usuario con esa cédula'
    if (error.message?.includes('celular')) return 'Ya existe un usuario con ese celular'
    return 'Este usuario ya existe'
  }

  // Violación de NOT NULL
  if (error.code === '23502') {
    return 'Faltan campos obligatorios'
  }

  // Mensaje genérico
  if (error.message?.includes('duplicate')) {
    return 'Este usuario ya existe'
  }

  return error.message || 'Error al crear el usuario'
}

async function markLinkAsUsed(
  supabase: ReturnType<typeof createServiceClient>,
  linkId: string,
  userId: string,
  log: ReturnType<typeof createApiLogger>
): Promise<void> {
  try {
    const { error } = await supabase
      .from('registration_links')
      .update({ usado: true, usado_por: userId })
      .eq('id', linkId)

    if (error) {
      // Log pero no bloquear - el usuario ya fue creado exitosamente
      log.warn('Failed to mark link as used', { linkId, userId, error })
    }
  } catch (err) {
    log.error('Exception marking link as used', err as Error, { linkId, userId })
  }
}

async function createEmptySpecialPredictions(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
  log: ReturnType<typeof createApiLogger>
): Promise<void> {
  try {
    const { error } = await supabase
      .from('special_predictions')
      .insert({ user_id: userId })

    if (error) {
      log.warn('Failed to create special predictions', { userId, error })
    }
  } catch (err) {
    log.error('Exception creating special predictions', err as Error, { userId })
  }
}
