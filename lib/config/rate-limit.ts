/**
 * Configuración de Rate Limiting
 *
 * Estos valores controlan cuántas solicitudes se permiten
 * por ventana de tiempo para diferentes tipos de endpoints.
 *
 * Para producción con múltiples instancias, considera:
 * - Vercel KV (npm install @vercel/kv)
 * - Upstash Redis (npm install @upstash/redis @upstash/ratelimit)
 */

export interface RateLimitConfig {
  /** Nombre del perfil (para logging) */
  name: string
  /** Ventana de tiempo en milisegundos */
  windowMs: number
  /** Máximo de solicitudes por ventana */
  maxRequests: number
  /** Mensaje de error personalizado */
  message?: string
}

/**
 * Perfiles de rate limiting predefinidos
 */
export const rateLimitProfiles = {
  /**
   * Rate limit estándar para APIs públicas
   * 60 requests por minuto
   */
  standard: {
    name: 'standard',
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 60,
    message: 'Demasiadas solicitudes. Intenta más tarde.',
  },

  /**
   * Rate limit estricto para autenticación
   * 5 intentos por 15 minutos (protección contra fuerza bruta)
   */
  auth: {
    name: 'auth',
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5,
    message: 'Demasiados intentos de acceso. Intenta más tarde.',
  },

  /**
   * Rate limit para registro de usuarios
   * 3 intentos por hora (muy restrictivo)
   */
  register: {
    name: 'register',
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 3,
    message: 'Demasiados intentos de registro. Intenta más tarde.',
  },

  /**
   * Rate limit para operaciones sensibles
   * 10 requests por 5 minutos
   */
  sensitive: {
    name: 'sensitive',
    windowMs: 5 * 60 * 1000, // 5 minutos
    maxRequests: 10,
    message: 'Demasiadas operaciones. Intenta más tarde.',
  },

  /**
   * Rate limit relajado para endpoints de solo lectura
   * 120 requests por minuto
   */
  readonly: {
    name: 'readonly',
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 120,
    message: 'Demasiadas solicitudes. Intenta más tarde.',
  },

  /**
   * Rate limit para admin (más permisivo)
   * 100 requests por minuto
   */
  admin: {
    name: 'admin',
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 100,
    message: 'Demasiadas solicitudes. Intenta más tarde.',
  },
} as const satisfies Record<string, RateLimitConfig>

export type RateLimitProfile = keyof typeof rateLimitProfiles

/**
 * Obtener configuración de rate limit por nombre
 */
export function getRateLimitConfig(profile: RateLimitProfile): RateLimitConfig {
  return rateLimitProfiles[profile]
}

/**
 * Configuración para almacenamiento distribuido (futuro)
 *
 * Para habilitar almacenamiento distribuido:
 * 1. Instalar dependencias:
 *    - Vercel KV: npm install @vercel/kv
 *    - Upstash: npm install @upstash/redis @upstash/ratelimit
 *
 * 2. Configurar variables de entorno:
 *    - KV_REST_API_URL (Vercel KV)
 *    - KV_REST_API_TOKEN (Vercel KV)
 *    - UPSTASH_REDIS_REST_URL (Upstash)
 *    - UPSTASH_REDIS_REST_TOKEN (Upstash)
 *
 * 3. Cambiar STORAGE_TYPE a 'vercel-kv' o 'upstash'
 */
export const rateLimitStorageConfig = {
  /** Tipo de almacenamiento: 'memory' | 'vercel-kv' | 'upstash' */
  type: 'memory' as const,

  /** Prefijo para claves en almacenamiento distribuido */
  keyPrefix: 'ratelimit:',

  /** Habilitar logging de rate limits */
  enableLogging: process.env.NODE_ENV === 'development',
} as const
