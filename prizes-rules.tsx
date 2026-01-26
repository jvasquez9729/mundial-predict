"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Medal,
  Award,
  Star,
  CheckCircle2,
  Info,
  Target,
  Zap,
  Calendar,
  Users,
  Gift,
} from "lucide-react";

const prizes = [
  {
    position: 1,
    title: "Campeon Mundial",
    prize: "$1,000 USD",
    extras: ["Camiseta oficial firmada", "Balon del Mundial", "Medalla de oro"],
    icon: Trophy,
    gradient: "from-yellow-500 to-amber-600",
    bgGlow: "shadow-yellow-500/20",
  },
  {
    position: 2,
    title: "Subcampeon",
    prize: "$500 USD",
    extras: ["Camiseta oficial", "Medalla de plata"],
    icon: Medal,
    gradient: "from-gray-300 to-gray-400",
    bgGlow: "shadow-gray-400/20",
  },
  {
    position: 3,
    title: "Tercer Lugar",
    prize: "$250 USD",
    extras: ["Camiseta oficial", "Medalla de bronce"],
    icon: Award,
    gradient: "from-amber-600 to-amber-700",
    bgGlow: "shadow-amber-600/20",
  },
  {
    position: "4-10",
    title: "Top 10",
    prize: "$50 USD",
    extras: ["Creditos para proxima temporada"],
    icon: Star,
    gradient: "from-primary to-primary/80",
    bgGlow: "shadow-primary/20",
  },
];

const rules = [
  {
    category: "Puntuacion",
    icon: Target,
    items: [
      { rule: "Resultado exacto (ej: 2-1)", points: "+25 pts", highlight: true },
      { rule: "Ganador correcto con diferencia de goles", points: "+15 pts", highlight: false },
      { rule: "Ganador correcto", points: "+10 pts", highlight: false },
      { rule: "Empate acertado (sin marcador exacto)", points: "+8 pts", highlight: false },
      { rule: "Prediccion incorrecta", points: "0 pts", highlight: false },
    ],
  },
  {
    category: "Bonificaciones",
    icon: Zap,
    items: [
      { rule: "Racha de 3 aciertos consecutivos", points: "+20 pts", highlight: true },
      { rule: "Racha de 5 aciertos consecutivos", points: "+50 pts", highlight: true },
      { rule: "Acertar todos los partidos del dia", points: "+30 pts", highlight: false },
      { rule: "Prediccion en fase eliminatoria", points: "x2 pts", highlight: false },
      { rule: "Prediccion en semifinal/final", points: "x3 pts", highlight: false },
    ],
  },
  {
    category: "Plazos",
    icon: Calendar,
    items: [
      { rule: "Enviar prediccion antes del inicio del partido", points: "Obligatorio", highlight: false },
      { rule: "Predicciones tardias", points: "No validas", highlight: false },
      { rule: "Modificar prediccion (hasta 1h antes)", points: "Permitido", highlight: false },
      { rule: "Una prediccion por partido", points: "Maximo", highlight: false },
    ],
  },
  {
    category: "Participacion",
    icon: Users,
    items: [
      { rule: "Registro gratuito", points: "Incluido", highlight: false },
      { rule: "Sin limite de participantes", points: "Abierto", highlight: false },
      { rule: "Ligas privadas entre amigos", points: "Disponible", highlight: false },
      { rule: "Premios solo para cuentas verificadas", points: "Requerido", highlight: true },
    ],
  },
];

export function PrizesRules() {
  const [activeTab, setActiveTab] = useState("prizes");

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Premios y Reglas
          </CardTitle>
          <Badge variant="outline" className="border-primary/50 text-primary">
            Temporada 2026
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full rounded-none bg-secondary/50 p-1 h-auto">
            <TabsTrigger
              value="prizes"
              className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5 rounded-md transition-all"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Premios
            </TabsTrigger>
            <TabsTrigger
              value="rules"
              className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5 rounded-md transition-all"
            >
              <Info className="h-4 w-4 mr-2" />
              Reglas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prizes" className="p-4 space-y-3 mt-0">
            {prizes.map((prize) => (
              <div
                key={prize.position}
                className={`relative overflow-hidden rounded-lg border border-border bg-secondary/30 p-4 shadow-lg ${prize.bgGlow}`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                  <prize.icon className="w-full h-full" />
                </div>
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${prize.gradient} flex items-center justify-center shadow-lg`}
                  >
                    <prize.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          {typeof prize.position === "number" ? `Posicion #${prize.position}` : `Posiciones ${prize.position}`}
                        </span>
                        <h4 className="font-semibold text-foreground">{prize.title}</h4>
                      </div>
                      <span className={`text-xl font-bold bg-gradient-to-r ${prize.gradient} bg-clip-text text-transparent`}>
                        {prize.prize}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {prize.extras.map((extra, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="text-xs bg-background/50 text-muted-foreground"
                        >
                          {extra}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-xs text-muted-foreground text-center">
                Los premios se entregan dentro de los 7 dias posteriores a la final del torneo.
                Consulta terminos y condiciones completos.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="rules" className="p-4 space-y-4 mt-0">
            {rules.map((section) => (
              <div key={section.category} className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                  <section.icon className="h-4 w-4 text-primary" />
                  {section.category}
                </h4>
                <div className="space-y-1.5">
                  {section.items.map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-2.5 rounded-md ${
                        item.highlight
                          ? "bg-primary/10 border border-primary/20"
                          : "bg-secondary/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className={`h-3.5 w-3.5 ${
                            item.highlight ? "text-primary" : "text-muted-foreground"
                          }`}
                        />
                        <span className="text-sm text-foreground">{item.rule}</span>
                      </div>
                      <Badge
                        variant={item.highlight ? "default" : "secondary"}
                        className={`text-xs font-mono ${
                          item.highlight
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {item.points}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-4 p-3 rounded-lg bg-accent/10 border border-accent/20">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Las reglas pueden actualizarse antes del inicio del torneo.
                  Te notificaremos cualquier cambio por email.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
