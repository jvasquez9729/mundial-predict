import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'
import { handleNgrokRedirect, applyNgrokHeaders } from '@/lib/utils/ngrok'

function isLocalhost(req: NextRequest): boolean {
  const h = req.headers.get('host') || req.nextUrl.hostname || ''
  return h.startsWith('localhost') || h.startsWith('127.0.0.1')
}

function withHstsClear(req: NextRequest, res: NextResponse): NextResponse {
  if (isLocalhost(req)) {
    res.headers.set('Strict-Transport-Security', 'max-age=0')
  }
  return res
}

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // 1. Redirigir HTTP→HTTPS en producción (excepto localhost: sin SSL en local)
  const isProduction = process.env.NODE_ENV === 'production'
  if (isProduction && !isLocalhost(request)) {
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
    return withHstsClear(request, ngrokRedirect)
  }

  // 3. Proxy de autenticación
  const response = await updateSession(request)

  // 4. Aplicar headers de ngrok; en localhost, añadir HSTS max-age=0 para limpiar caché
  return withHstsClear(request, applyNgrokHeaders(request, response, pathname))
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
