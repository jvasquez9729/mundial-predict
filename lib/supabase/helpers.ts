/**
 * Helpers para trabajar con Supabase
 * Incluye normalización de relaciones y utilidades comunes
 */

/**
 * Normaliza una relación de Supabase que puede venir como array u objeto.
 *
 * Supabase a veces devuelve relaciones como arrays incluso para relaciones 1:1.
 * Esta función garantiza que siempre obtengas un objeto o null.
 *
 * @example
 * const user = normalizeRelation(link.users)
 * // user es ahora UserType | null, nunca un array
 */
export function normalizeRelation<T>(relation: T | T[] | null | undefined): T | null {
  if (relation === null || relation === undefined) {
    return null
  }

  if (Array.isArray(relation)) {
    return relation[0] ?? null
  }

  return relation
}

/**
 * Normaliza múltiples relaciones de Supabase.
 * Útil cuando tienes un objeto con varias relaciones.
 *
 * @example
 * const normalized = normalizeRelations(data, ['user', 'team', 'match'])
 */
export function normalizeRelations<T extends Record<string, unknown>>(
  data: T,
  relationKeys: (keyof T)[]
): T {
  const normalized = { ...data }

  for (const key of relationKeys) {
    if (key in normalized) {
      normalized[key] = normalizeRelation(normalized[key] as unknown) as T[keyof T]
    }
  }

  return normalized
}

/**
 * Construye la URL de la aplicación basándose en el entorno.
 * Prioridad: NEXT_PUBLIC_APP_URL > headers del request > localhost
 */
export function getAppUrl(request?: { headers: { get: (name: string) => string | null } }): string {
  // 1. Variable de entorno (producción)
  const envUrl = process.env.NEXT_PUBLIC_APP_URL
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl.replace(/\/$/, '') // Remove trailing slash
  }

  // 2. Headers del request (útil para desarrollo con ngrok)
  if (request) {
    const host = request.headers.get('host')
    if (host) {
      const protocol = request.headers.get('x-forwarded-proto') ||
                       (host.includes('localhost') ? 'http' : 'https')
      return `${protocol}://${host}`
    }
  }

  // 3. Fallback a localhost
  return envUrl || 'http://localhost:3000'
}

/**
 * Detecta si la URL es de ngrok (útil para manejar casos especiales)
 */
export function isNgrokUrl(url: string): boolean {
  return url.includes('.ngrok') ||
         url.includes('ngrok-free') ||
         url.includes('ngrok.io')
}

/**
 * Construye una URL de registro con el token.
 * Maneja automáticamente el parámetro de ngrok si es necesario.
 */
export function buildRegistrationUrl(baseUrl: string, token: string): string {
  const url = `${baseUrl}/registro?t=${token}`
  return isNgrokUrl(baseUrl) ? `${url}&ngrok-skip=true` : url
}

/**
 * Parsea errores de Supabase a mensajes amigables
 */
export function parseSupabaseError(error: { code?: string; message?: string } | null): string {
  if (!error) return 'Error desconocido'

  // Errores comunes de PostgreSQL
  const errorCodes: Record<string, string> = {
    '23505': 'Ya existe un registro con estos datos',
    '23502': 'Faltan campos obligatorios',
    '23503': 'Referencia a un registro que no existe',
    '42501': 'No tienes permisos para esta operación',
    'PGRST116': 'No se encontró el registro',
  }

  if (error.code && errorCodes[error.code]) {
    return errorCodes[error.code]
  }

  return error.message || 'Error en la operación de base de datos'
}
