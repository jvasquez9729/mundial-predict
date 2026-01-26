/**
 * Sistema de Rate Limiting mejorado
 *
 * Características:
 * - Perfiles de configuración predefinidos
 * - Algoritmo de ventana deslizante (sliding window)
 * - Preparado para almacenamiento distribuido
 * - Logging integrado
 *
 * NOTA: Este implementa almacenamiento en memoria.
 * Para producción con múltiples instancias, ver lib/config/rate-limit.ts
 * para instrucciones de integración con Vercel KV o Upstash.
 */

import {
  rateLimitProfiles,
  rateLimitStorageConfig,
  type RateLimitConfig,
  type RateLimitProfile
} from '@/lib/config/rate-limit'
import { logger } from './logger'

// --- Tipos ---

interface RateLimitEntry {
  count: number
  windowStart: number
  requests: number[] // Timestamps de requests (para sliding window)
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter: number // Segundos hasta poder reintentar
}

// --- Store en memoria ---

const store = new Map<string, RateLimitEntry>()

// Limpieza automática del store cada hora
let cleanupInterval: NodeJS.Timeout | null = null

function ensureCleanup() {
  if (typeof setInterval !== 'undefined' && !cleanupInterval) {
    cleanupInterval = setInterval(cleanupExpiredEntries, 60 * 60 * 1000)
    // Evitar que el intervalo mantenga el proceso vivo
    if (cleanupInterval.unref) {
      cleanupInterval.unref()
    }
  }
}

function cleanupExpiredEntries() {
  const now = Date.now()
  const maxWindow = Math.max(...Object.values(rateLimitProfiles).map(p => p.windowMs))

  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart > maxWindow * 2) {
      store.delete(key)
    }
  }
}

// --- Funciones principales ---

/**
 * Aplica rate limiting con algoritmo de sliding window.
 *
 * @param identifier - Identificador único (IP, user ID, etc.)
 * @param config - Configuración de rate limit
 * @returns Resultado del rate limit
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  ensureCleanup()

  const now = Date.now()
  const key = `${rateLimitStorageConfig.keyPrefix}${config.name}:${identifier}`

  // Obtener o crear entrada
  let entry = store.get(key)

  if (!entry) {
    entry = {
      count: 0,
      windowStart: now,
      requests: [],
    }
    store.set(key, entry)
  }

  // Filtrar requests dentro de la ventana (sliding window)
  entry.requests = entry.requests.filter(
    timestamp => now - timestamp < config.windowMs
  )

  // Agregar request actual
  entry.requests.push(now)
  entry.count = entry.requests.length

  // Calcular resultados
  const allowed = entry.count <= config.maxRequests
  const remaining = Math.max(0, config.maxRequests - entry.count)

  // Calcular tiempo de reset (cuando la request más antigua expira)
  const oldestRequest = entry.requests[0] || now
  const resetTime = oldestRequest + config.windowMs
  const retryAfter = Math.max(0, Math.ceil((resetTime - now) / 1000))

  // Logging en desarrollo
  if (rateLimitStorageConfig.enableLogging && !allowed) {
    logger.warn('Rate limit exceeded', {
      profile: config.name,
      identifier: identifier.substring(0, 20) + '...',
      count: entry.count,
      max: config.maxRequests,
      retryAfter,
    })
  }

  return {
    allowed,
    remaining,
    resetTime,
    retryAfter,
  }
}

/**
 * Rate limiting usando un perfil predefinido
 */
export function rateLimitWithProfile(
  identifier: string,
  profile: RateLimitProfile
): RateLimitResult {
  const config = rateLimitProfiles[profile]
  return rateLimit(identifier, config)
}

/**
 * Rate limiting por IP
 */
export function rateLimitByIP(
  ip: string | null,
  profile: RateLimitProfile = 'standard'
): RateLimitResult {
  const identifier = ip || 'unknown'
  return rateLimitWithProfile(identifier, profile)
}

/**
 * Rate limiting para autenticación (login/registro)
 * Usa el perfil 'auth' por defecto
 */
export function rateLimitAuth(ip: string | null): RateLimitResult {
  return rateLimitByIP(ip, 'auth')
}

/**
 * Rate limiting para registro de usuarios
 * Más estricto que autenticación
 */
export function rateLimitRegister(ip: string | null): RateLimitResult {
  return rateLimitByIP(ip, 'register')
}

/**
 * Rate limiting para operaciones sensibles
 */
export function rateLimitSensitive(ip: string | null): RateLimitResult {
  return rateLimitByIP(ip, 'sensitive')
}

/**
 * Rate limiting para endpoints de solo lectura
 */
export function rateLimitReadonly(ip: string | null): RateLimitResult {
  return rateLimitByIP(ip, 'readonly')
}

/**
 * Rate limiting para admin
 */
export function rateLimitAdmin(ip: string | null): RateLimitResult {
  return rateLimitByIP(ip, 'admin')
}

/**
 * Limpiar todas las entradas del store (útil para tests)
 */
export function clearRateLimitStore(): void {
  store.clear()
}

/**
 * Obtener estadísticas del store (útil para monitoreo)
 */
export function getRateLimitStats(): {
  totalEntries: number
  entriesByProfile: Record<string, number>
} {
  const stats = {
    totalEntries: store.size,
    entriesByProfile: {} as Record<string, number>,
  }

  for (const key of store.keys()) {
    const profile = key.split(':')[1] || 'unknown'
    stats.entriesByProfile[profile] = (stats.entriesByProfile[profile] || 0) + 1
  }

  return stats
}

// --- Helpers para responses HTTP ---

/**
 * Crea headers de rate limit para la respuesta HTTP
 */
export function createRateLimitHeaders(result: RateLimitResult, profile: RateLimitConfig): Record<string, string> {
  return {
    'X-RateLimit-Limit': profile.maxRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetTime.toString(),
    ...(result.allowed ? {} : { 'Retry-After': result.retryAfter.toString() }),
  }
}

/**
 * Mensaje de error para rate limit excedido
 */
export function getRateLimitMessage(profile: RateLimitProfile): string {
  return rateLimitProfiles[profile].message || 'Demasiadas solicitudes. Intenta más tarde.'
}
