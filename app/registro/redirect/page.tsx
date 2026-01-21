"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

/**
 * Página intermedia para saltarse la advertencia de ngrok
 * Esta página redirige automáticamente a /registro con el header necesario
 */
export default function RegistrationRedirectPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("t");

  useEffect(() => {
    // Si hay un token, redirigir a /registro con el token
    if (token) {
      // Redirigir inmediatamente
      router.push(`/registro?t=${encodeURIComponent(token)}`);
    } else {
      // Si no hay token, redirigir a la página principal
      router.push("/");
    }
  }, [token, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirigiendo...</p>
      </div>
    </div>
  );
}
