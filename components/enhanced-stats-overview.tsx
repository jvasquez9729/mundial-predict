"use client";

import React from "react"
import { Trophy, Target, TrendingUp, Flame } from "lucide-react";
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

export function EnhancedStatsOverview() {
  const stats: Omit<StatCardProps, 'delay'>[] = [
    {
      title: "Tu Posición",
      value: "#42",
      subtitle: "de 1,234 jugadores",
      icon: <Trophy className="h-5 w-5 text-primary" />,
      trend: { value: 8, isPositive: true },
      accentColor: "bg-primary/10",
    },
    {
      title: "Puntos Totales",
      value: "1,850",
      subtitle: "380 esta semana",
      icon: <Target className="h-5 w-5 text-accent" />,
      trend: { value: 12, isPositive: true },
      accentColor: "bg-accent/10",
    },
    {
      title: "Precisión",
      value: "67%",
      subtitle: "32 de 48 aciertos",
      icon: <TrendingUp className="h-5 w-5 text-success" />,
      trend: { value: 5, isPositive: true },
      accentColor: "bg-success/10",
    },
    {
      title: "Racha Actual",
      value: "5",
      subtitle: "aciertos consecutivos",
      icon: <Flame className="h-5 w-5 text-destructive" />,
      accentColor: "bg-destructive/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard key={stat.title} {...stat} delay={index * 0.1} />
      ))}
    </div>
  );
}
