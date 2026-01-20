/**
 * Sistema básico de rate limiting en memoria
 * Para producción, considera usar Redis o Upstash
 */

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

interface RateLimitOptions {
  windowMs: number // Ventana de tiempo en milisegundos
  maxRequests: number // Máximo de solicitudes por ventana
}

const defaultOptions: RateLimitOptions = {
  windowMs: 60 * 1000, // 1 minuto
  maxRequests: 60, // 60 solicitudes por minuto
}

/**
 * Rate limiting para API routes
 */
export function rateLimit(
  identifier: string,
  options: Partial<RateLimitOptions> = {}
): { allowed: boolean; remaining: number; resetTime: number } {
  const opts = { ...defaultOptions, ...options }
  const now = Date.now()
  const key = identifier

  // Limpiar entradas expiradas
  if (store[key] && store[key].resetTime < now) {
    delete store[key]
  }

  // Si no existe entrada, crear una nueva
  if (!store[key]) {
    store[key] = {
      count: 0,
      resetTime: now + opts.windowMs,
    }
  }

  // Incrementar contador
  store[key].count++

  const remaining = Math.max(0, opts.maxRequests - store[key].count)

  return {
    allowed: store[key].count <= opts.maxRequests,
    remaining,
    resetTime: store[key].resetTime,
  }
}

/**
 * Rate limiting específico por IP
 */
export function rateLimitByIP(
  ip: string | null,
  options?: Partial<RateLimitOptions>
): ReturnType<typeof rateLimit> {
  const identifier = ip || 'unknown'
  return rateLimit(identifier, options)
}

/**
 * Rate limiting para autenticación (más estricto)
 */
export function rateLimitAuth(ip: string | null): ReturnType<typeof rateLimit> {
  return rateLimitByIP(ip, {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5, // 5 intentos por 15 minutos
  })
}

/**
 * Limpiar entradas expiradas del store (ejecutar periódicamente)
 */
export function cleanupRateLimit(): void {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}

// Limpiar cada hora
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimit, 60 * 60 * 1000)
}
