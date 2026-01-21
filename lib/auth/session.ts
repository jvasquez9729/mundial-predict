import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import { createServiceClient } from '@/lib/supabase/server'
import type { UserPublic } from '@/lib/types/database'
import { getJwtSecret } from '@/lib/config/env'

const JWT_SECRET = new TextEncoder().encode(getJwtSecret())

const SESSION_COOKIE = 'mp_session'
const SESSION_DURATION = 60 * 60 * 24 * 7 // 7 days in seconds

interface SessionPayload {
  userId: string
  email: string
  esAdmin: boolean
}

export async function createSession(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(getJwtSecretEncoded())

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  })

  return token
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getJwtSecretEncoded())
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function getCurrentUser(): Promise<UserPublic | null> {
  const session = await getSession()
  if (!session) return null

  const supabase = createServiceClient()
  const { data: user, error } = await supabase
    .from('users')
    .select('id, nombre_completo, email, cedula, celular, es_admin, creado_en')
    .eq('id', session.userId)
    .single()

  if (error || !user) return null

  return user as UserPublic
}

export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) {
    throw new Error('No autenticado')
  }
  return session
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireAuth()
  if (!session.esAdmin) {
    throw new Error('No autorizado')
  }
  return session
}
