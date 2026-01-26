import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock de cookies de Next.js
const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
}

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}))

// Importar después del mock
import {
  generateCsrfToken,
  isExemptPath,
  requiresCsrfValidation,
  CSRF_HEADER,
  CSRF_COOKIE,
} from '@/lib/auth/csrf'

describe('CSRF Protection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateCsrfToken', () => {
    it('debe generar un token de longitud apropiada', () => {
      const token = generateCsrfToken()
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThanOrEqual(32)
    })

    it('debe generar tokens únicos', () => {
      const token1 = generateCsrfToken()
      const token2 = generateCsrfToken()
      expect(token1).not.toBe(token2)
    })

    it('debe generar tokens que solo contengan caracteres hexadecimales', () => {
      const token = generateCsrfToken()
      expect(token).toMatch(/^[a-f0-9]+$/i)
    })
  })

  describe('isExemptPath', () => {
    it('debe exentar rutas de autenticación', () => {
      expect(isExemptPath('/api/auth/login')).toBe(true)
      expect(isExemptPath('/api/auth/register')).toBe(true)
      expect(isExemptPath('/api/auth/forgot-password')).toBe(true)
      expect(isExemptPath('/api/auth/reset-password')).toBe(true)
      expect(isExemptPath('/api/auth/validate-token')).toBe(true)
    })

    it('debe exentar rutas de cron', () => {
      expect(isExemptPath('/api/cron/daily')).toBe(true)
      expect(isExemptPath('/api/cron/sync-matches')).toBe(true)
      expect(isExemptPath('/api/cron/calculate-points')).toBe(true)
    })

    it('debe exentar ruta de health', () => {
      expect(isExemptPath('/api/health')).toBe(true)
    })

    it('no debe exentar rutas protegidas', () => {
      expect(isExemptPath('/api/predictions')).toBe(false)
      expect(isExemptPath('/api/notifications')).toBe(false)
      expect(isExemptPath('/api/admin/users')).toBe(false)
      expect(isExemptPath('/api/admin/links/generate')).toBe(false)
    })
  })

  describe('requiresCsrfValidation', () => {
    it('debe requerir validación para métodos que modifican estado', () => {
      expect(requiresCsrfValidation('POST')).toBe(true)
      expect(requiresCsrfValidation('PUT')).toBe(true)
      expect(requiresCsrfValidation('PATCH')).toBe(true)
      expect(requiresCsrfValidation('DELETE')).toBe(true)
    })

    it('no debe requerir validación para métodos de solo lectura', () => {
      expect(requiresCsrfValidation('GET')).toBe(false)
      expect(requiresCsrfValidation('HEAD')).toBe(false)
      expect(requiresCsrfValidation('OPTIONS')).toBe(false)
    })

    it('debe manejar métodos en minúsculas', () => {
      expect(requiresCsrfValidation('post')).toBe(true)
      expect(requiresCsrfValidation('get')).toBe(false)
    })
  })

  describe('Constants', () => {
    it('debe exportar el nombre correcto del header', () => {
      expect(CSRF_HEADER).toBe('x-csrf-token')
    })

    it('debe exportar el nombre correcto de la cookie', () => {
      expect(CSRF_COOKIE).toBe('mp_csrf')
    })
  })
})
