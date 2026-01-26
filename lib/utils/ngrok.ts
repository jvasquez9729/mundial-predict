/**
 * Utilidades para manejo de ngrok en desarrollo
 *
 * ngrok es útil para:
 * - Probar la aplicación desde dispositivos móviles
 * - Compartir la aplicación con otros desarrolladores
 * - Probar webhooks desde servicios externos
 *
 * Estas utilidades solo deben usarse en desarrollo.
 */

import { NextResponse, type NextRequest } from 'next/server'

const NGROK_PATTERNS = ['.ngrok', 'ngrok-free', 'ngrok.io']

/**
 * Detecta si la request viene de un tunnel de ngrok
 */
export function isNgrokRequest(request: NextRequest): boolean {
  const host = request.headers.get('host') || ''
  return NGROK_PATTERNS.some(pattern => host.includes(pattern))
}

/**
 * Agrega el header necesario para saltarse la advertencia de ngrok
 */
export function addNgrokHeader(response: NextResponse): NextResponse {
  response.headers.set('ngrok-skip-browser-warning', 'true')
  return response
}

/**
 * Maneja redirecciones especiales para ngrok.
 * Útil para rutas como /registro/redirect que necesitan
 * preservar tokens en la URL.
 *
 * @returns NextResponse si se manejó la redirección, null si no aplica
 */
export function handleNgrokRedirect(
  request: NextRequest,
  pathname: string,
  searchParams: URLSearchParams
): NextResponse | null {
  // Solo en desarrollo
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  const isNgrok = isNgrokRequest(request)

  // Manejar ruta especial /registro/redirect para ngrok
  if (pathname === '/registro/redirect') {
    const token = searchParams.get('t')
    if (token) {
      const redirectUrl = new URL('/registro', request.url)
      redirectUrl.searchParams.set('t', token)
      const response = NextResponse.redirect(redirectUrl, 302)

      if (isNgrok) {
        addNgrokHeader(response)
      }

      return response
    }
  }

  // Normalizar rutas de registro con subrutas incorrectas
  if (pathname.startsWith('/registro/') && pathname !== '/registro/redirect') {
    const token = searchParams.get('t')
    if (token) {
      const correctUrl = new URL('/registro', request.url)
      correctUrl.searchParams.set('t', token)
      const response = NextResponse.redirect(correctUrl, 301)

      if (isNgrok) {
        addNgrokHeader(response)
      }

      return response
    }
  }

  return null
}

/**
 * Aplica headers de ngrok a una respuesta si es necesario
 */
export function applyNgrokHeaders(
  request: NextRequest,
  response: NextResponse,
  pathname: string
): NextResponse {
  // Solo agregar header para ciertas rutas en desarrollo
  if (process.env.NODE_ENV !== 'production') {
    const isNgrok = isNgrokRequest(request)

    if (isNgrok && pathname === '/registro') {
      addNgrokHeader(response)
    }
  }

  return response
}
