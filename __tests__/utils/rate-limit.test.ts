import { describe, it, expect, beforeEach } from 'vitest'
import { rateLimit, rateLimitAuth, cleanupRateLimit } from '@/lib/utils/rate-limit'

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Limpiar el store antes de cada test
    cleanupRateLimit()
  })

  describe('rateLimit', () => {
    it('debe permitir solicitudes dentro del límite', () => {
      const result1 = rateLimit('test-ip', { windowMs: 60000, maxRequests: 5 })
      expect(result1.allowed).toBe(true)
      expect(result1.remaining).toBe(4)

      const result2 = rateLimit('test-ip', { windowMs: 60000, maxRequests: 5 })
      expect(result2.allowed).toBe(true)
      expect(result2.remaining).toBe(3)
    })

    it('debe rechazar solicitudes que excedan el límite', () => {
      const options = { windowMs: 60000, maxRequests: 3 }
      
      // Hacer 3 solicitudes (todas permitidas)
      rateLimit('test-ip', options)
      rateLimit('test-ip', options)
      rateLimit('test-ip', options)

      // La cuarta debería ser rechazada
      const result = rateLimit('test-ip', options)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('debe resetear el contador después de la ventana de tiempo', () => {
      const options = { windowMs: 100, maxRequests: 2 }
      
      rateLimit('test-ip', options)
      rateLimit('test-ip', options)
      
      // Esperar a que expire la ventana
      return new Promise((resolve) => {
        setTimeout(() => {
          const result = rateLimit('test-ip', options)
          expect(result.allowed).toBe(true)
          resolve(undefined)
        }, 150)
      })
    })
  })

  describe('rateLimitAuth', () => {
    it('debe usar límites más estrictos para autenticación', () => {
      const result1 = rateLimitAuth('test-ip')
      expect(result1.allowed).toBe(true)

      // Hacer 5 solicitudes (el límite)
      for (let i = 0; i < 4; i++) {
        rateLimitAuth('test-ip')
      }

      const result6 = rateLimitAuth('test-ip')
      expect(result6.allowed).toBe(false)
    })
  })
})
