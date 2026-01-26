/**
 * Cliente API para el Frontend
 *
 * Este módulo proporciona funciones de fetch que automáticamente
 * incluyen el token CSRF en las peticiones que modifican estado.
 *
 * Uso:
 * ```typescript
 * import { api } from '@/lib/api/client'
 *
 * // GET (no necesita CSRF)
 * const data = await api.get('/api/auth/me')
 *
 * // POST/PUT/DELETE (incluye CSRF automáticamente)
 * const result = await api.post('/api/predictions', { matchId: 1, score: '2-1' })
 * ```
 */

// Nombre de la cookie CSRF (debe coincidir con el servidor)
const CSRF_COOKIE_NAME = 'mp_csrf'
const CSRF_HEADER_NAME = 'x-csrf-token'

// --- Utilidades ---

/**
 * Obtiene el valor de una cookie por nombre
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null

  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=')
    if (cookieName === name) {
      return decodeURIComponent(cookieValue)
    }
  }
  return null
}

/**
 * Obtiene el token CSRF de la cookie
 */
export function getCsrfToken(): string | null {
  return getCookie(CSRF_COOKIE_NAME)
}

// --- Tipos ---

interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  skipCsrf?: boolean // Para rutas que no necesitan CSRF
}

interface ApiResponse<T = unknown> {
  data: T | null
  error: string | null
  status: number
  ok: boolean
}

// --- Cliente API ---

/**
 * Realiza una petición fetch con manejo automático de CSRF y JSON
 */
async function apiFetch<T = unknown>(
  url: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const { body, skipCsrf = false, headers: customHeaders, ...restOptions } = options

  // Construir headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  }

  // Agregar token CSRF para métodos que modifican estado
  const method = (options.method || 'GET').toUpperCase()
  const needsCsrf = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)

  if (needsCsrf && !skipCsrf) {
    const csrfToken = getCsrfToken()
    if (csrfToken) {
      ;(headers as Record<string, string>)[CSRF_HEADER_NAME] = csrfToken
    }
  }

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    // Intentar parsear JSON
    let data: T | null = null
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      data = await response.json()
    }

    // Manejo de errores HTTP
    if (!response.ok) {
      const errorMessage =
        (data as { error?: string })?.error ||
        `Error ${response.status}: ${response.statusText}`

      return {
        data: null,
        error: errorMessage,
        status: response.status,
        ok: false,
      }
    }

    return {
      data,
      error: null,
      status: response.status,
      ok: true,
    }
  } catch (error) {
    // Error de red o parsing
    const message = error instanceof Error ? error.message : 'Error de red'
    return {
      data: null,
      error: message,
      status: 0,
      ok: false,
    }
  }
}

/**
 * Cliente API con métodos convenientes
 */
export const api = {
  /**
   * GET request
   */
  get: <T = unknown>(url: string, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiFetch<T>(url, { ...options, method: 'GET' }),

  /**
   * POST request (incluye CSRF automáticamente)
   */
  post: <T = unknown>(url: string, body?: unknown, options?: Omit<ApiOptions, 'method'>) =>
    apiFetch<T>(url, { ...options, method: 'POST', body }),

  /**
   * PUT request (incluye CSRF automáticamente)
   */
  put: <T = unknown>(url: string, body?: unknown, options?: Omit<ApiOptions, 'method'>) =>
    apiFetch<T>(url, { ...options, method: 'PUT', body }),

  /**
   * PATCH request (incluye CSRF automáticamente)
   */
  patch: <T = unknown>(url: string, body?: unknown, options?: Omit<ApiOptions, 'method'>) =>
    apiFetch<T>(url, { ...options, method: 'PATCH', body }),

  /**
   * DELETE request (incluye CSRF automáticamente)
   */
  delete: <T = unknown>(url: string, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiFetch<T>(url, { ...options, method: 'DELETE' }),

  /**
   * Petición con método personalizado
   */
  fetch: apiFetch,
}

// --- Helpers adicionales ---

/**
 * Verifica si hay un token CSRF disponible
 * Útil para saber si el usuario está autenticado
 */
export function hasCsrfToken(): boolean {
  return getCsrfToken() !== null
}

/**
 * Headers para usar con fetch nativo (si no quieres usar el cliente api)
 *
 * Uso:
 * ```typescript
 * fetch('/api/something', {
 *   method: 'POST',
 *   headers: getCsrfHeaders(),
 *   body: JSON.stringify(data)
 * })
 * ```
 */
export function getCsrfHeaders(): Record<string, string> {
  const token = getCsrfToken()
  return token
    ? { [CSRF_HEADER_NAME]: token, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' }
}
