'use client'

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Play, ChevronRight, Globe, Lock } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { CountriesMarquee } from "./countries-marquee";
import { useTranslation } from "@/hooks/use-translation";
import { useRouter } from "next/navigation";

export function EnhancedHeroBanner() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Verificar si el usuario está autenticado
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        setIsAuthenticated(!!data.user);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    }
    checkAuth();
  }, []);

  return (
    <section className="relative mb-8 overflow-hidden rounded-2xl" aria-labelledby="hero-heading">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/copa-mundial-fifa-2026-1080x675.jpg"
          alt="Copa del Mundo FIFA 2026 - Trofeo con banderas de Canadá, México y Estados Unidos"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-[280px] flex-col justify-center p-6 pb-20 sm:min-h-[320px] sm:pb-24 lg:min-h-[360px] lg:pb-28 lg:p-10">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
          <div className="max-w-lg">
            <BlurFade delay={0.1} direction="right">
              <span className="mb-2 inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
                48 Selecciones
              </span>
              <h1
                id="hero-heading"
                className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl mt-2"
              >
                Copa del Mundo 2026
              </h1>
              <p className="mt-3 max-w-md text-pretty text-sm text-muted-foreground sm:text-base lg:text-lg">
                Demuestra tus conocimientos futbolísticos prediciendo los resultados.
                Compite con jugadores de todo el mundo y escala en la clasificación.
              </p>
              <div className="mt-6 mb-2 flex flex-wrap gap-3">
                {isChecking ? (
                  <Button disabled className="gap-2 bg-primary text-primary-foreground">
                    <Play className="h-4 w-4" />
                    Cargando...
                  </Button>
                ) : isAuthenticated ? (
                  <Button asChild className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="/predicciones">
                      <Play className="h-4 w-4" />
                      Comenzar a predecir
                    </Link>
                  </Button>
                ) : (
                  <Button 
                    onClick={() => {
                      // Mostrar mensaje de que necesita link de registro
                      alert('Para participar, necesitas un link de registro único proporcionado por el administrador. Contacta al administrador para obtener tu link de registro.');
                    }}
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Lock className="h-4 w-4" />
                    Comenzar a predecir
                  </Button>
                )}
                <Button asChild variant="outline" className="gap-2 border-border text-foreground hover:bg-secondary bg-transparent">
                  <Link href="/#clasificacion">
                    Ver clasificación
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </BlurFade>
          </div>
          
          {/* Globe Section - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:block relative h-[300px]">
            <BlurFade delay={0.3} direction="left">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full max-w-[400px] mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-full blur-3xl" />
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Globe className="h-16 w-16 text-primary opacity-50" />
                  </div>
                </div>
              </div>
            </BlurFade>
          </div>
        </div>
      </div>

      {/* Countries Marquee at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-background/60 backdrop-blur-md border-t border-border/50">
        <CountriesMarquee />
      </div>
    </section>
  );
}
