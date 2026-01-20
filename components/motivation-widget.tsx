"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Flame, Target, Star, Zap } from "lucide-react";

const quotes = [
  {
    text: "El fútbol es el deporte más hermoso del mundo",
    author: "Pelé",
    icon: Trophy,
  },
  {
    text: "La diferencia entre lo ordinario y lo extraordinario es ese pequeño extra",
    author: "Jimmy Johnson",
    icon: Star,
  },
  {
    text: "No juegas contra rivales, juegas contra el juego del fútbol",
    author: "Pep Guardiola",
    icon: Target,
  },
  {
    text: "El talento gana partidos, pero el trabajo en equipo gana campeonatos",
    author: "Michael Jordan",
    icon: Flame,
  },
  {
    text: "Sueña en grande y atrévete a fallar",
    author: "Norman Vaughan",
    icon: Zap,
  },
];

const dailyTips = [
  "Predice los partidos de hoy antes de las 12:00 para puntos extra",
  "Los resultados exactos otorgan el doble de puntos",
  "Mantén una racha de 5 aciertos para desbloquear bonus",
  "Comparte tus predicciones y gana puntos de comunidad",
];

export function MotivationWidget() {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQuote((prev) => (prev + 1) % quotes.length);
        setIsAnimating(false);
      }, 300);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const quote = quotes[currentQuote];
  const Icon = quote.icon;
  const tip = dailyTips[Math.floor(Date.now() / 86400000) % dailyTips.length];

  return (
    <div className="space-y-4">
      {/* Quote Card */}
      <Card className="bg-gradient-to-br from-primary/20 via-card to-card border-primary/30 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <CardContent className="p-5 relative">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-primary/20 text-primary shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div
              className={`space-y-2 transition-all duration-300 ${isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}
            >
              <p className="text-sm text-foreground/90 italic leading-relaxed">
                {'"'}
                {quote.text}
                {'"'}
              </p>
              <p className="text-xs text-primary font-medium">
                — {quote.author}
              </p>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            {quotes.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuote(index)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === currentQuote
                    ? "bg-primary w-4"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Ver frase ${index + 1}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Tip */}
      <Card className="bg-accent/10 border-accent/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold text-accent uppercase tracking-wide">
              Tip del día
            </span>
          </div>
          <p className="text-sm text-foreground/80">{tip}</p>
        </CardContent>
      </Card>

      {/* Mini Stats */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">
              Próximo partido en
            </p>
            <CountdownTimer />
            <p className="text-xs text-muted-foreground mt-2">
              Argentina vs Brasil
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CountdownTimer() {
  const [time, setTime] = useState({ hours: 2, minutes: 34, seconds: 12 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center gap-1 font-mono">
      <span className="bg-secondary px-2 py-1 rounded text-lg font-bold text-foreground">
        {String(time.hours).padStart(2, "0")}
      </span>
      <span className="text-primary font-bold">:</span>
      <span className="bg-secondary px-2 py-1 rounded text-lg font-bold text-foreground">
        {String(time.minutes).padStart(2, "0")}
      </span>
      <span className="text-primary font-bold">:</span>
      <span className="bg-secondary px-2 py-1 rounded text-lg font-bold text-foreground">
        {String(time.seconds).padStart(2, "0")}
      </span>
    </div>
  );
}
