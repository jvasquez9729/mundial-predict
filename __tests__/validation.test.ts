import { describe, it, expect } from 'vitest'
import { 
  registerSchema, 
  loginSchema, 
  predictionSchema 
} from '@/lib/auth/validation'

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('debe validar datos correctos', () => {
      const validData = {
        nombre_completo: 'Juan Pérez',
        cedula: '1234567890',
        email: 'juan@example.com',
        celular: '1234567890',
        password: 'password123',
        confirm_password: 'password123',
        token: 'valid-token',
      }

      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('debe rechazar contraseñas que no coincidan', () => {
      const invalidData = {
        nombre_completo: 'Juan Pérez',
        cedula: '1234567890',
        email: 'juan@example.com',
        celular: '1234567890',
        password: 'password123',
        confirm_password: 'different',
        token: 'valid-token',
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('debe rechazar emails inválidos', () => {
      const invalidData = {
        nombre_completo: 'Juan Pérez',
        cedula: '1234567890',
        email: 'invalid-email',
        celular: '1234567890',
        password: 'password123',
        confirm_password: 'password123',
        token: 'valid-token',
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('predictionSchema', () => {
    it('debe validar predicciones correctas', () => {
      const validData = {
        match_id: '123e4567-e89b-12d3-a456-426614174000',
        goles_local: 2,
        goles_visitante: 1,
      }

      const result = predictionSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('debe rechazar goles negativos', () => {
      const invalidData = {
        match_id: '123e4567-e89b-12d3-a456-426614174000',
        goles_local: -1,
        goles_visitante: 1,
      }

      const result = predictionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('debe rechazar más de 20 goles', () => {
      const invalidData = {
        match_id: '123e4567-e89b-12d3-a456-426614174000',
        goles_local: 21,
        goles_visitante: 1,
      }

      const result = predictionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})
