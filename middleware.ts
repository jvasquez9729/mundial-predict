import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const isProduction = process.env.NODE_ENV === 'production'

  // 1. Redirigir HTTP a HTTPS en producción
  // Verificar tanto x-forwarded-proto como el protocolo directo
  const protocol = request.headers.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', '')
  const isHttp = protocol === 'http' || request.nextUrl.protocol === 'http:'
  
  if (isProduction && isHttp) {
    const httpsUrl = new URL(request.url)
    httpsUrl.protocol = 'https:'
    // Preservar query parameters (especialmente el token ?t=...)
    httpsUrl.search = request.nextUrl.search
    return NextResponse.redirect(httpsUrl, 301)
  }

  // 2. Detectar si viene de ngrok y agregar header para saltarse la advertencia
  const host = request.headers.get('host') || ''
  const isNgrok = host.includes('.ngrok') || host.includes('ngrok-free') || host.includes('ngrok.io')
  
  // 3. Manejar ruta especial /registro/redirect para ngrok
  if (pathname === '/registro/redirect') {
    const token = searchParams.get('t')
    if (token) {
      // Redirigir a /registro con el token preservado
      const redirectUrl = new URL('/registro', request.url)
      redirectUrl.searchParams.set('t', token)
      const response = NextResponse.redirect(redirectUrl, 302)
      
      // Agregar header para saltarse la advertencia de ngrok
      if (isNgrok) {
        response.headers.set('ngrok-skip-browser-warning', 'true')
      }
      
      return response
    }
  }
  
  // 4. Asegurar que /registro con parámetros sea reconocida como ruta pública
  // Esto es importante para móviles que pueden enviar la URL de forma diferente
  if (pathname === '/registro' || pathname.startsWith('/registro/')) {
    // Si hay un token, asegurar que se preserve en la URL
    const token = searchParams.get('t')
    if (token && pathname !== '/registro' && pathname !== '/registro/redirect') {
      // Redirigir a la ruta correcta con el token
      const correctUrl = new URL('/registro', request.url)
      correctUrl.searchParams.set('t', token)
      const response = NextResponse.redirect(correctUrl, 301)
      
      // Si viene de ngrok, agregar header para saltarse la advertencia
      if (isNgrok) {
        response.headers.set('ngrok-skip-browser-warning', 'true')
      }
      
      return response
    }
  }

  // 4. Middleware de autenticación (usando la función existente)
  const response = await updateSession(request)

  // 5. Si viene de ngrok, agregar header para saltarse la advertencia del navegador
  if (isNgrok && pathname === '/registro') {
    response.headers.set('ngrok-skip-browser-warning', 'true')
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
