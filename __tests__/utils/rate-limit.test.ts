import { describe, it, expect, beforeEach } from 'vitest'
import {
  rateLimit,
  rateLimitAuth,
  rateLimitWithProfile,
  clearRateLimitStore,
} from '@/lib/utils/rate-limit'

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Limpiar el store antes de cada test
    clearRateLimitStore()
  })

  describe('rateLimit', () => {
    it('debe permitir solicitudes dentro del límite', () => {
      const config = { name: 'test', windowMs: 60000, maxRequests: 5 }
      const result1 = rateLimit('test-ip', config)
      expect(result1.allowed).toBe(true)
      expect(result1.remaining).toBe(4)

      const result2 = rateLimit('test-ip', config)
      expect(result2.allowed).toBe(true)
      expect(result2.remaining).toBe(3)
    })

    it('debe rechazar solicitudes que excedan el límite', () => {
      const config = { name: 'test', windowMs: 60000, maxRequests: 3 }

      // Hacer 3 solicitudes (todas permitidas)
      rateLimit('test-ip', config)
      rateLimit('test-ip', config)
      rateLimit('test-ip', config)

      // La cuarta debería ser rechazada
      const result = rateLimit('test-ip', config)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('debe resetear el contador después de la ventana de tiempo', () => {
      const config = { name: 'test', windowMs: 100, maxRequests: 2 }

      rateLimit('test-ip', config)
      rateLimit('test-ip', config)

      // Esperar a que expire la ventana
      return new Promise((resolve) => {
        setTimeout(() => {
          const result = rateLimit('test-ip', config)
          expect(result.allowed).toBe(true)
          resolve(undefined)
        }, 150)
      })
    })
  })

  describe('rateLimitWithProfile', () => {
    it('debe usar el perfil estándar correctamente', () => {
      // El perfil standard tiene 60 requests por minuto
      const result = rateLimitWithProfile('test-ip', 'standard')
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(59)
    })
  })

  describe('rateLimitAuth', () => {
    it('debe usar límites más estrictos para autenticación', () => {
      const result1 = rateLimitAuth('test-ip')
      expect(result1.allowed).toBe(true)

      // Hacer 5 solicitudes (el límite del perfil auth)
      for (let i = 0; i < 4; i++) {
        rateLimitAuth('test-ip')
      }

      const result6 = rateLimitAuth('test-ip')
      expect(result6.allowed).toBe(false)
    })

    it('debe aislar usuarios por IP', () => {
      // Agotar límite para ip-1
      for (let i = 0; i < 5; i++) {
        rateLimitAuth('ip-1')
      }

      // ip-2 debe tener su propio límite
      const result = rateLimitAuth('ip-2')
      expect(result.allowed).toBe(true)
    })
  })
})
