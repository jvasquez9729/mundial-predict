import { describe, it, expect } from 'vitest'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { ApiError, handleApiError } from '@/lib/utils/api-error'

describe('API Error Handling', () => {
  describe('handleApiError', () => {
    it('debe manejar errores de autenticación', () => {
      const error = new Error('No autenticado')
      const response = handleApiError('/api/test', error)
      
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(401)
    })

    it('debe manejar errores de autorización', () => {
      const error = new Error('No autorizado')
      const response = handleApiError('/api/test', error)
      
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(403)
    })

    it('debe manejar errores de Zod', () => {
      const error = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['field'],
          message: 'Campo inválido',
        },
      ])
      
      const response = handleApiError('/api/test', error)
      
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(400)
    })

    it('debe manejar ApiError personalizado', () => {
      const error = new ApiError(404, 'No encontrado', 'NOT_FOUND')
      const response = handleApiError('/api/test', error)
      
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(404)
    })

    it('debe manejar errores desconocidos', () => {
      const error = new Error('Error desconocido')
      const response = handleApiError('/api/test', error)
      
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(500)
    })
  })
})
