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
        email: 'juan@gmail.com', // Debe ser un dominio válido
        celular: '+573001234567', // Celular con código de país
        password: 'password123',
        confirm_password: 'password123',
        token: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
      }

      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('debe rechazar contraseñas que no coincidan', () => {
      const invalidData = {
        nombre_completo: 'Juan Pérez',
        cedula: '1234567890',
        email: 'juan@gmail.com',
        celular: '+573001234567',
        password: 'password123',
        confirm_password: 'different',
        token: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('debe rechazar emails inválidos', () => {
      const invalidData = {
        nombre_completo: 'Juan Pérez',
        cedula: '1234567890',
        email: 'invalid-email',
        celular: '+573001234567',
        password: 'password123',
        confirm_password: 'password123',
        token: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('debe rechazar emails con dominio no permitido', () => {
      const invalidData = {
        nombre_completo: 'Juan Pérez',
        cedula: '1234567890',
        email: 'juan@example.com', // example.com no está permitido
        celular: '+573001234567',
        password: 'password123',
        confirm_password: 'password123',
        token: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
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
