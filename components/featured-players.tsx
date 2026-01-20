"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Star, TrendingUp, Loader2, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/blur-fade";
import { cn } from "@/lib/utils";

interface FavoriteTeam {
  codigo: string;
  nombre: string;
  probabilidad: number;
  tendencia: number;
  votos?: number;
  bandera_url?: string;
}

export function FeaturedPlayers() {
  const [favorites, setFavorites] = useState<FavoriteTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const res = await fetch('/api/teams/favorites');
        const data = await res.json();

        if (data.success) {
          setFavorites(data.favorites || []);
          setLastUpdated(data.last_updated);
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();

    // Actualizar cada 30 minutos
    const interval = setInterval(fetchFavorites, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <BlurFade delay={0.2} direction="up">
        <section className="mb-8" aria-labelledby="featured-heading">
          <Card className="overflow-hidden border-border bg-card">
            <div className="grid lg:grid-cols-2">
              <div className="relative h-48 sm:h-56 lg:h-auto lg:min-h-[280px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
              <div className="p-4 lg:p-6">
                <CardHeader className="p-0 pb-4">
                  <CardTitle id="featured-heading" className="flex items-center gap-2 text-lg text-foreground">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Favoritos de la comunidad
                  </CardTitle>
                </CardHeader>
              </div>
            </div>
          </Card>
        </section>
      </BlurFade>
    );
  }

  const topTeams = favorites.slice(0, 4);

  return (
    <BlurFade delay={0.2} direction="up">
      <section className="mb-8" aria-labelledby="featured-heading">
        <Card className="overflow-hidden border-border bg-card">
          <div className="grid lg:grid-cols-2">
            {/* Image Section */}
            <div className="relative h-48 sm:h-56 lg:h-auto lg:min-h-[280px]">
              <Image
                src="/images/estrellas-mundial-fifa-1080x675.jpg"
                alt="Estrellas del Mundial 2026 - Messi, Ronaldo, Mbappe, Bellingham y mas"
                fill
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent lg:bg-gradient-to-r" />
              <div className="absolute bottom-4 left-4 lg:bottom-6 lg:left-6">
                <Badge className="gap-1 bg-accent text-accent-foreground">
                  <Star className="h-3 w-3" />
                  Estrellas 2026
                </Badge>
              </div>
              {lastUpdated && (
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-xs">
                    Actualizado
                  </Badge>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-4 lg:p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle id="featured-heading" className="flex items-center gap-2 text-lg text-foreground">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Favoritos de la comunidad
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Selecciones más opcionadas a ganar el Mundial 2026
                </p>
              </CardHeader>
              <CardContent className="p-0">
                {topTeams.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay datos disponibles
                  </p>
                ) : (
                  <ul className="space-y-3" role="list">
                    {topTeams.map((team, index) => (
                      <li
                        key={team.codigo}
                        className="flex items-center justify-between rounded-lg bg-secondary/50 p-3 transition-colors hover:bg-secondary"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                            {index + 1}
                          </span>
                          <span className="font-medium text-foreground">{team.nombre}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-foreground">
                            {team.probabilidad.toFixed(1)}%
                          </span>
                          <span
                            className={cn(
                              "flex items-center gap-1 text-xs font-medium",
                              team.tendencia >= 0 ? "text-success" : "text-destructive"
                            )}
                          >
                            {team.tendencia >= 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {team.tendencia >= 0 ? '+' : ''}{team.tendencia.toFixed(1)}%
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {favorites.length > 4 && (
                  <p className="mt-3 text-xs text-muted-foreground text-center">
                    Y {favorites.length - 4} selecciones más...
                  </p>
                )}
              </CardContent>
            </div>
          </div>
        </Card>
      </section>
    </BlurFade>
  );
}
