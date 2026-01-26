"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Play, ChevronRight } from "lucide-react";

export function HeroBanner() {
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
      <div className="relative z-10 flex min-h-[280px] flex-col justify-center p-6 sm:min-h-[320px] lg:min-h-[360px] lg:p-10">
        <div className="max-w-lg">
          <span className="mb-2 inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
            48 Selecciones
          </span>
          <h1
            id="hero-heading"
            className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            Copa del Mundo 2026
          </h1>
          <p className="mt-3 max-w-md text-pretty text-sm text-muted-foreground sm:text-base lg:text-lg">
            Demuestra tus conocimientos futbolisticos prediciendo los resultados.
            Compite con jugadores de todo el mundo y escala en la clasificacion.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Play className="h-4 w-4" />
              Comenzar a predecir
            </Button>
            <Button variant="outline" className="gap-2 border-border text-foreground hover:bg-secondary bg-transparent">
              Ver clasificacion
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
