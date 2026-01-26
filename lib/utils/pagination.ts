import { z } from 'zod'

/**
 * Configuración de paginación por defecto
 */
export const PAGINATION_DEFAULTS = {
  MIN_LIMIT: 1,
  MAX_LIMIT: 100,
  DEFAULT_LIMIT: 50,
  MIN_OFFSET: 0,
  DEFAULT_OFFSET: 0,
} as const

/**
 * Esquema de validación para parámetros de paginación
 */
const paginationSchema = z.object({
  limit: z
    .number()
    .int()
    .min(PAGINATION_DEFAULTS.MIN_LIMIT, `El límite debe ser al menos ${PAGINATION_DEFAULTS.MIN_LIMIT}`)
    .max(PAGINATION_DEFAULTS.MAX_LIMIT, `El límite no puede exceder ${PAGINATION_DEFAULTS.MAX_LIMIT}`)
    .default(PAGINATION_DEFAULTS.DEFAULT_LIMIT),
  offset: z
    .number()
    .int()
    .min(PAGINATION_DEFAULTS.MIN_OFFSET, 'El offset no puede ser negativo')
    .default(PAGINATION_DEFAULTS.DEFAULT_OFFSET),
})

/**
 * Resultado de la validación de paginación
 */
export interface PaginationParams {
  limit: number
  offset: number
}

/**
 * Valida y normaliza parámetros de paginación desde query params
 * 
 * @param limitStr - String del parámetro limit (puede ser null)
 * @param offsetStr - String del parámetro offset (puede ser null)
 * @param customMaxLimit - Límite máximo personalizado (opcional)
 * @returns Parámetros de paginación validados
 * @throws Error si los parámetros son inválidos
 */
export function validatePagination(
  limitStr: string | null,
  offsetStr: string | null,
  customMaxLimit?: number
): PaginationParams {
  // Parsear valores
  const limit = limitStr ? parseInt(limitStr, 10) : PAGINATION_DEFAULTS.DEFAULT_LIMIT
  const offset = offsetStr ? parseInt(offsetStr, 10) : PAGINATION_DEFAULTS.DEFAULT_OFFSET

  // Validar que sean números válidos
  if (isNaN(limit) || isNaN(offset)) {
    throw new Error('Los parámetros limit y offset deben ser números válidos')
  }

  // Aplicar límite máximo personalizado si se proporciona
  const maxLimit = customMaxLimit || PAGINATION_DEFAULTS.MAX_LIMIT
  const schema = paginationSchema.extend({
    limit: z
      .number()
      .int()
      .min(PAGINATION_DEFAULTS.MIN_LIMIT)
      .max(maxLimit, `El límite no puede exceder ${maxLimit}`)
      .default(PAGINATION_DEFAULTS.DEFAULT_LIMIT),
  })

  const result = schema.safeParse({ limit, offset })

  if (!result.success) {
    const error = result.error.errors[0]
    throw new Error(error?.message || 'Parámetros de paginación inválidos')
  }

  return result.data
}

/**
 * Valida solo el parámetro limit (sin offset)
 */
export function validateLimit(
  limitStr: string | null,
  customMaxLimit?: number
): number {
  const limit = limitStr ? parseInt(limitStr, 10) : PAGINATION_DEFAULTS.DEFAULT_LIMIT

  if (isNaN(limit)) {
    throw new Error('El parámetro limit debe ser un número válido')
  }

  const maxLimit = customMaxLimit || PAGINATION_DEFAULTS.MAX_LIMIT
  const minLimit = PAGINATION_DEFAULTS.MIN_LIMIT

  if (limit < minLimit) {
    throw new Error(`El límite debe ser al menos ${minLimit}`)
  }

  if (limit > maxLimit) {
    throw new Error(`El límite no puede exceder ${maxLimit}`)
  }

  return limit
}
