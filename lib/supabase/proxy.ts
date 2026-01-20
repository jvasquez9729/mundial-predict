import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getJwtSecret } from "@/lib/config/env";

const JWT_SECRET = new TextEncoder().encode(getJwtSecret());

const SESSION_COOKIE = "mp_session";

// Rutas públicas
const publicRoutes = [
  "/", 
  "/login", 
  "/reglas", 
  "/registro",
  "/forgot-password",
  "/reset-password",
  "/api/auth/login", 
  "/api/auth/register",
  "/api/auth/validate-token",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/leaderboard",
  "/api/participants",
  "/api/teams",
  "/api/matches",
  "/api/health"
];

// Rutas admin
const adminRoutes = ["/admin"];

function isPublicRoute(pathname: string): boolean {
  // Normalizar pathname para manejar diferentes formatos de URL
  const normalizedPath = pathname.split('?')[0].split('#')[0]
  
  return (
    publicRoutes.some((route) => normalizedPath === route || normalizedPath.startsWith(route + "/")) ||
    normalizedPath.startsWith("/registro") ||
    normalizedPath.startsWith("/api/auth/")
  );
}

function isAdminRoute(pathname: string): boolean {
  return (
    adminRoutes.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith("/api/admin/")
  );
}

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Obtener token de sesión
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  let session: { userId: string; email: string; esAdmin: boolean } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      session = payload as typeof session;
    } catch {
      // Token inválido
    }
  }

  // Rutas públicas
  if (isPublicRoute(pathname)) {
    // Si está logueado e intenta ir a login/registro/recuperar, redirigir a dashboard
    if (session && (pathname === "/login" || pathname.startsWith("/registro") || pathname.startsWith("/forgot-password"))) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next({ request });
  }

  // Rutas protegidas - requieren sesión
  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Rutas admin
  if (isAdminRoute(pathname)) {
    if (!session.esAdmin) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { success: false, error: "No autorizado" },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next({ request });
}
