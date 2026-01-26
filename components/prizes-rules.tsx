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
    title: "Primer Puesto",
    prize: "3.000.000 COP",
    description: "Quien acumule más puntos al final del mundial",
    extras: [],
    icon: Trophy,
    gradient: "from-yellow-500 to-amber-600",
    bgGlow: "shadow-yellow-500/20",
  },
  {
    position: 2,
    title: "Segundo Puesto",
    prize: "1.500.000 COP",
    description: "Segundo lugar en puntos al final del mundial",
    extras: [],
    icon: Medal,
    gradient: "from-gray-300 to-gray-400",
    bgGlow: "shadow-gray-400/20",
  },
  {
    position: 3,
    title: "Premio especial",
    prize: "Camiseta de la Selección Colombia 2026",
    description: "Quien obtenga más puntos en la primera fecha de la fase de grupos",
    extras: [],
    icon: Star,
    gradient: "from-blue-500 to-blue-600",
    bgGlow: "shadow-blue-500/20",
  },
];

const rules = [
  {
    category: "Puntuación por Partido",
    icon: Target,
    items: [
      { rule: "Marcador exacto (ej: 2-1 = 2-1)", points: "3 pts", highlight: true },
      { rule: "Acertar ganador o empate (ej: 1-0 vs 2-1)", points: "1 pt", highlight: false },
      { rule: "Predicción incorrecta", points: "0 pts", highlight: false },
    ],
  },
  {
    category: "Predicciones Especiales",
    icon: Zap,
    items: [
      { rule: "Acertar campeón del mundial", points: "+10 pts", highlight: true },
      { rule: "Acertar subcampeón", points: "+5 pts", highlight: false },
      { rule: "Acertar goleador del mundial", points: "+8 pts", highlight: true },
      { rule: "Acertar hasta dónde llega Colombia", points: "+5 pts", highlight: false },
    ],
  },
  {
    category: "Plazos",
    icon: Calendar,
    items: [
      { rule: "Fase de grupos: 1 día antes del mundial", points: "Límite", highlight: true },
      { rule: "Octavos, cuartos, semi, final: 8h antes", points: "Por fase", highlight: false },
      { rule: "Predicciones especiales: 1 día antes", points: "Límite", highlight: false },
      { rule: "Colombia: actualizable hasta 8h antes de cada fase", points: "Flexible", highlight: false },
    ],
  },
  {
    category: "Desempate",
    icon: Users,
    items: [
      { rule: "Si empatan en puntos", points: "Más exactos gana", highlight: true },
      { rule: "Inscripción", points: "$100.000 COP", highlight: false },
      { rule: "Pozo se actualiza con cada registro", points: "En vivo", highlight: false },
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
                          Premio #{prize.position}
                        </span>
                        <h4 className="font-semibold text-foreground">{prize.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{prize.description}</p>
                      </div>
                      <span className={`text-lg font-bold bg-gradient-to-r ${prize.gradient} bg-clip-text text-transparent`}>
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
