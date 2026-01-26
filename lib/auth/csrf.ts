/**
 * Protección CSRF usando el patrón "Double Submit Cookie"
 *
 * Este módulo implementa protección contra Cross-Site Request Forgery (CSRF)
 * sin requerir almacenamiento del lado del servidor.
 *
 * Cómo funciona:
 * 1. Al iniciar sesión, se genera un token CSRF y se guarda en una cookie
 * 2. El cliente debe enviar el token en el header X-CSRF-Token
 * 3. El servidor valida que ambos tokens coincidan
 *
 * ¿Por qué es seguro?
 * - Un atacante puede hacer que el navegador envíe cookies, pero no puede
 *   leer el valor de la cookie para ponerlo en un header (Same-Origin Policy)
 */

import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// --- Configuración ---

const CSRF_COOKIE_NAME = 'mp_csrf'
const CSRF_HEADER_NAME = 'x-csrf-token'
const CSRF_TOKEN_LENGTH = 32

// Métodos HTTP que modifican estado (requieren validación CSRF)
const STATE_CHANGING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']

// Rutas exentas de validación CSRF (ej: login inicial, webhooks)
const EXEMPT_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/validate-token',
  '/api/cron/', // Rutas de cron (usan su propio auth)
  '/api/health',
]

// --- Tipos ---

export interface CsrfValidationResult {
  valid: boolean
  error?: string
}

// --- Funciones de generación ---

/**
 * Genera un token CSRF criptográficamente seguro
 */
export function generateCsrfToken(): string {
  // Usar crypto.randomUUID() si está disponible (Node 18+)
  // o crypto.getRandomValues() para compatibilidad
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    // Combinar UUIDs para mayor longitud
    return crypto.randomUUID().replace(/-/g, '') +
           crypto.randomUUID().replace(/-/g, '').slice(0, CSRF_TOKEN_LENGTH - 32)
  }

  // Fallback con getRandomValues
  const array = new Uint8Array(CSRF_TOKEN_LENGTH)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Establece la cookie CSRF (llamar al crear sesión)
 */
export async function setCsrfCookie(token?: string): Promise<string> {
  const csrfToken = token || generateCsrfToken()
  const cookieStore = await cookies()

  cookieStore.set(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: false, // El cliente necesita leer este valor
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', // Más restrictivo para CSRF
    maxAge: 60 * 60 * 24 * 7, // 7 días (igual que la sesión)
    path: '/',
  })

  return csrfToken
}

/**
 * Elimina la cookie CSRF (llamar al cerrar sesión)
 */
export async function deleteCsrfCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(CSRF_COOKIE_NAME)
}

/**
 * Obtiene el token CSRF de la cookie
 */
export async function getCsrfToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(CSRF_COOKIE_NAME)?.value || null
}

// --- Funciones de validación ---

/**
 * Verifica si una ruta está exenta de validación CSRF
 */
export function isExemptPath(pathname: string): boolean {
  return EXEMPT_PATHS.some(exempt =>
    pathname.startsWith(exempt)
  )
}

/**
 * Verifica si el método HTTP requiere validación CSRF
 */
export function requiresCsrfValidation(method: string): boolean {
  return STATE_CHANGING_METHODS.includes(method.toUpperCase())
}

/**
 * Valida el token CSRF de una request
 */
export async function validateCsrfToken(request: NextRequest): Promise<CsrfValidationResult> {
  const method = request.method.toUpperCase()
  const pathname = new URL(request.url).pathname

  // No validar métodos que no modifican estado
  if (!requiresCsrfValidation(method)) {
    return { valid: true }
  }

  // No validar rutas exentas
  if (isExemptPath(pathname)) {
    return { valid: true }
  }

  // Obtener token del header
  const headerToken = request.headers.get(CSRF_HEADER_NAME)
  if (!headerToken) {
    return {
      valid: false,
      error: 'Token CSRF no proporcionado',
    }
  }

  // Obtener token de la cookie
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value
  if (!cookieToken) {
    return {
      valid: false,
      error: 'Cookie CSRF no encontrada',
    }
  }

  // Comparación segura (timing-safe)
  if (!timingSafeEqual(headerToken, cookieToken)) {
    return {
      valid: false,
      error: 'Token CSRF inválido',
    }
  }

  return { valid: true }
}

/**
 * Comparación segura contra timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

// --- Response helpers ---

/**
 * Crea una respuesta de error CSRF
 */
export function csrfErrorResponse(error: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: error,
      code: 'CSRF_VALIDATION_FAILED',
    },
    { status: 403 }
  )
}

// --- Middleware helper ---

/**
 * Wrapper para validar CSRF en API routes
 *
 * Uso:
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const csrfResult = await validateCsrfToken(request)
 *   if (!csrfResult.valid) {
 *     return csrfErrorResponse(csrfResult.error!)
 *   }
 *   // ... resto del handler
 * }
 * ```
 */
export async function withCsrfProtection<T>(
  request: NextRequest,
  handler: () => Promise<T>
): Promise<T | NextResponse> {
  const result = await validateCsrfToken(request)

  if (!result.valid) {
    return csrfErrorResponse(result.error!)
  }

  return handler()
}

// --- Exports para cliente ---

export const CSRF_HEADER = CSRF_HEADER_NAME
export const CSRF_COOKIE = CSRF_COOKIE_NAME
