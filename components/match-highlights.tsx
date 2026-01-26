"use client";

import { FeaturedMatch } from "./featured-match";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, TrendingUp, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const staticHighlights = [
  {
    id: 2,
    image: "/images/000-ts-dv1762743.jpg",
    alt: "Aficionados colombianos celebrando",
    title: "Ambiente en el estadio",
    description: "La pasión de los hinchas",
    badge: "TRENDING",
    href: "/resultados",
  },
  {
    id: 3,
    image: "/images/hq720.jpg",
    alt: "48 selecciones del Mundial 2026",
    title: "48 Selecciones",
    description: "El mundial más grande de la historia",
    badge: "NUEVO",
    href: "/reglas",
  },
];

export function MatchHighlights() {
  return (
    <section className="mb-8" aria-labelledby="highlights-heading">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="highlights-heading" className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Flame className="h-5 w-5 text-primary" />
          Destacados del Día
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Partido destacado del día - ocupa 2 columnas en pantallas grandes */}
        <div className="sm:col-span-2 lg:col-span-2">
          <FeaturedMatch />
        </div>

        {/* Otros highlights estáticos */}
        <div className="space-y-4">
          {staticHighlights.map((item) => (
            <Link key={item.id} href={item.href || "#"}>
              <Card className="group cursor-pointer overflow-hidden border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                <div className="relative h-32 overflow-hidden sm:h-36">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.alt}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  <Badge
                    className={`absolute top-3 left-3 ${
                      item.badge === "EN VIVO"
                        ? "bg-destructive text-destructive-foreground"
                        : item.badge === "TRENDING"
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent text-accent-foreground"
                    }`}
                  >
                    {item.badge}
                  </Badge>
                </div>
                <CardContent className="p-3">
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
