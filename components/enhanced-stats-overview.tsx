"use client";

import React, { useEffect, useState } from "react"
import { Trophy, Target, TrendingUp, Flame, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BlurFade } from "@/components/ui/blur-fade";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  accentColor: string;
  delay: number;
}

function StatCard({ title, value, subtitle, icon, trend, accentColor, delay }: StatCardProps) {
  return (
    <BlurFade delay={delay} direction="up">
      <Card className="border-border bg-card overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {title}
              </p>
              <p className="text-2xl font-bold text-card-foreground lg:text-3xl">
                {value}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">{subtitle}</p>
                {trend && (
                  <span className={cn(
                    "flex items-center text-xs font-medium",
                    trend.isPositive ? "text-success" : "text-destructive"
                  )}>
                    {trend.isPositive ? "+" : ""}{trend.value}%
                  </span>
                )}
              </div>
            </div>
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg transition-transform hover:scale-110", accentColor)}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </BlurFade>
  );
}

interface StatsMe {
  posicion: number;
  total_participantes: number;
  puntos_totales: number;
  predicciones_correctas: number;
  total_predicciones: number;
  precision: number;
  racha_actual: number;
}

export function EnhancedStatsOverview() {
  const [stats, setStats] = useState<StatsMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats/me", { credentials: "include" });
        if (cancelled) return;
        if (res.status === 401) {
          setHasSession(false);
          setStats(null);
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        if (data.success && data.posicion !== undefined) {
          setHasSession(true);
          setStats({
            posicion: data.posicion ?? 0,
            total_participantes: data.total_participantes ?? 0,
            puntos_totales: data.puntos_totales ?? 0,
            predicciones_correctas: data.predicciones_correctas ?? 0,
            total_predicciones: data.total_predicciones ?? 0,
            precision: data.precision ?? 0,
            racha_actual: data.racha_actual ?? 0,
          });
        } else {
          setHasSession(false);
          setStats(null);
        }
      } catch {
        if (!cancelled) {
          setHasSession(false);
          setStats(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchStats();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border bg-card overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Cargando…</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!hasSession || !stats) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Inicia sesión para ver tus estadísticas.
        </p>
      </div>
    );
  }

  const cards: Omit<StatCardProps, "delay">[] = [
    {
      title: "Tu Posición",
      value: `#${stats.posicion}`,
      subtitle: `de ${stats.total_participantes} jugadores`,
      icon: <Trophy className="h-5 w-5 text-primary" />,
      accentColor: "bg-primary/10",
    },
    {
      title: "Puntos Totales",
      value: stats.puntos_totales.toLocaleString(),
      subtitle: "puntos acumulados",
      icon: <Target className="h-5 w-5 text-accent" />,
      accentColor: "bg-accent/10",
    },
    {
      title: "Precisión",
      value: `${stats.precision}%`,
      subtitle: `${stats.predicciones_correctas} de ${stats.total_predicciones} aciertos`,
      icon: <TrendingUp className="h-5 w-5 text-success" />,
      accentColor: "bg-success/10",
    },
    {
      title: "Racha Actual",
      value: String(stats.racha_actual),
      subtitle: "aciertos consecutivos",
      icon: <Flame className="h-5 w-5 text-destructive" />,
      accentColor: "bg-destructive/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((stat, index) => (
        <StatCard key={stat.title} {...stat} delay={index * 0.1} />
      ))}
    </div>
  );
}
