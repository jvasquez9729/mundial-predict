import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { logApiError } from './logger'

/**
 * Clase personalizada para errores de API
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Helper centralizado para manejar errores en API routes
 */
export function handleApiError(route: string, error: unknown): NextResponse {
  // Error de autenticación/autorización
  if (error instanceof Error) {
    if (error.message === 'No autenticado') {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      )
    }

    if (error.message === 'No autorizado') {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 }
      )
    }

    // Error de validación Zod
    if (error instanceof ZodError) {
      logApiError(route, error, { errors: error.errors })
      return NextResponse.json(
        {
          success: false,
          error: error.errors[0]?.message || 'Error de validación',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    // Error de API personalizado
    if (error instanceof ApiError) {
      logApiError(route, error)
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }
  }

  // Error desconocido
  logApiError(route, error)
  return NextResponse.json(
    { success: false, error: 'Error interno del servidor' },
    { status: 500 }
  )
}

/**
 * Wrapper para API routes que maneja errores automáticamente
 */
export function apiHandler<T>(
  handler: () => Promise<NextResponse>,
  routeName: string
): Promise<NextResponse> {
  return handler().catch((error) => handleApiError(routeName, error))
}
