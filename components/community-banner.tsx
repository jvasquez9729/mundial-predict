"use client";

import Image from "next/image";
import { Users, Trophy, Target } from "lucide-react";

const stats = [
  { icon: Users, label: "Jugadores activos", value: "12,847" },
  { icon: Trophy, label: "Predicciones totales", value: "284,592" },
  { icon: Target, label: "Precision promedio", value: "43%" },
];

export function CommunityBanner() {
  return (
    <section className="mb-8" aria-labelledby="community-heading">
      <div className="relative overflow-hidden rounded-2xl">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hinchas-colombianos.webp"
            alt="Aficionados celebrando en el estadio"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/70" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 lg:p-8">
          <h2 id="community-heading" className="mb-2 text-xl font-bold text-foreground sm:text-2xl">
            Unete a la comunidad
          </h2>
          <p className="mb-6 max-w-md text-sm text-muted-foreground">
            Miles de fanaticos del futbol ya estan compitiendo. Se parte de la emocion del Mundial 2026.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-lg font-bold text-foreground sm:text-xl lg:text-2xl">{stat.value}</p>
                <p className="text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
