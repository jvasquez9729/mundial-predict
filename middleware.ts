import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'
import { handleNgrokRedirect, applyNgrokHeaders } from '@/lib/utils/ngrok'

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const isProduction = process.env.NODE_ENV === 'production'

  // 1. Redirigir HTTP a HTTPS en producción
  if (isProduction) {
    const protocol = request.headers.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', '')
    const isHttp = protocol === 'http' || request.nextUrl.protocol === 'http:'

    if (isHttp) {
      const httpsUrl = new URL(request.url)
      httpsUrl.protocol = 'https:'
      httpsUrl.search = request.nextUrl.search
      return NextResponse.redirect(httpsUrl, 301)
    }
  }

  // 2. Manejar redirecciones especiales de ngrok (solo desarrollo)
  const ngrokRedirect = handleNgrokRedirect(request, pathname, searchParams)
  if (ngrokRedirect) {
    return ngrokRedirect
  }

  // 3. Middleware de autenticación
  const response = await updateSession(request)

  // 4. Aplicar headers de ngrok si es necesario (solo desarrollo)
  return applyNgrokHeaders(request, response, pathname)
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
