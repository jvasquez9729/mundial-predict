"use client";

import { useEffect, useState, useCallback } from "react";
import { Activity, CheckCircle2, XCircle, Clock, Zap, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Team {
  id: string;
  nombre: string;
  codigo: string;
  bandera_url: string;
}

interface Match {
  id: string;
  equipo_local: Team;
  equipo_visitante: Team;
  goles_local: number | null;
  goles_visitante: number | null;
  fecha_hora: string;
  estado: "proximo" | "en_vivo" | "finalizado";
  user_prediction?: {
    goles_local: number;
    goles_visitante: number;
    puntos_obtenidos: number;
    es_exacto: boolean;
  };
}

// Country code to flag emoji mapping
const codeToFlag: Record<string, string> = {
  ARG: "🇦🇷", BRA: "🇧🇷", MEX: "🇲🇽", USA: "🇺🇸", COL: "🇨🇴",
  GER: "🇩🇪", FRA: "🇫🇷", ESP: "🇪🇸", ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", ITA: "🇮🇹",
  POR: "🇵🇹", NED: "🇳🇱", BEL: "🇧🇪", CRO: "🇭🇷", URU: "🇺🇾",
  JPN: "🇯🇵", KOR: "🇰🇷", AUS: "🇦🇺", SEN: "🇸🇳", MAR: "🇲🇦",
  GHA: "🇬🇭", CAM: "🇨🇲", NGA: "🇳🇬", TUN: "🇹🇳", EGY: "🇪🇬",
  KSA: "🇸🇦", QAT: "🇶🇦", IRN: "🇮🇷", CAN: "🇨🇦", CRC: "🇨🇷",
  ECU: "🇪🇨", CHI: "🇨🇱", PER: "🇵🇪", PAR: "🇵🇾", VEN: "🇻🇪",
  SUI: "🇨🇭", DEN: "🇩🇰", SWE: "🇸🇪", NOR: "🇳🇴", POL: "🇵🇱",
  UKR: "🇺🇦", SRB: "🇷🇸", WAL: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", SCO: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
};

function getFlag(codigo: string): string {
  return codeToFlag[codigo] || "🏳️";
}

function StatusBadge({ status }: { status: Match["estado"] }) {
  if (status === "en_vivo") {
    return (
      <Badge variant="destructive" className="animate-pulse gap-1 bg-destructive text-destructive-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        EN VIVO
      </Badge>
    );
  }
  if (status === "finalizado") {
    return (
      <Badge variant="secondary" className="bg-muted text-muted-foreground">
        Finalizado
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-border text-muted-foreground">
      <Clock className="mr-1 h-3 w-3" />
      Próximo
    </Badge>
  );
}

function PredictionResult({
  prediction,
  matchGoalsLocal,
  matchGoalsVisitante
}: {
  prediction: Match["user_prediction"];
  matchGoalsLocal: number | null;
  matchGoalsVisitante: number | null;
}) {
  if (!prediction || matchGoalsLocal === null || matchGoalsVisitante === null) return null;

  // Calculate if prediction was correct (same winner or draw)
  const actualResult = matchGoalsLocal > matchGoalsVisitante ? "home" : matchGoalsLocal < matchGoalsVisitante ? "away" : "draw";
  const predictedResult = prediction.goles_local > prediction.goles_visitante ? "home" : prediction.goles_local < prediction.goles_visitante ? "away" : "draw";
  const isCorrectResult = actualResult === predictedResult;

  return (
    <div className={cn(
      "flex items-center justify-between rounded-lg px-3 py-2 mt-2",
      prediction.es_exacto ? "bg-success/10" : isCorrectResult ? "bg-accent/10" : "bg-destructive/10"
    )}>
      <div className="flex items-center gap-2">
        {prediction.es_exacto ? (
          <CheckCircle2 className="h-4 w-4 text-success" />
        ) : isCorrectResult ? (
          <CheckCircle2 className="h-4 w-4 text-accent" />
        ) : (
          <XCircle className="h-4 w-4 text-destructive" />
        )}
        <span className="text-xs text-muted-foreground">
          Tu predicción: {prediction.goles_local} - {prediction.goles_visitante}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {prediction.puntos_obtenidos > 0 && (
          <Badge variant="outline" className={cn(
            "text-xs font-bold",
            prediction.es_exacto ? "border-success text-success" : "border-accent text-accent"
          )}>
            +{prediction.puntos_obtenidos} pts
          </Badge>
        )}
      </div>
    </div>
  );
}

export function LiveResults() {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [finishedMatches, setFinishedMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchMatches = useCallback(async () => {
    try {
      // Fetch live and recently finished matches in parallel
      const [liveResponse, finishedResponse] = await Promise.all([
        fetch('/api/matches?estado=en_vivo'),
        fetch('/api/matches?estado=finalizado&limit=5'),
      ]);

      const [liveData, finishedData] = await Promise.all([
        liveResponse.json(),
        finishedResponse.json(),
      ]);

      if (liveData.success) {
        setLiveMatches(liveData.matches);
      }

      if (finishedData.success) {
        // Sort by date descending to show most recent first
        const sorted = finishedData.matches.sort((a: Match, b: Match) =>
          new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime()
        );
        setFinishedMatches(sorted.slice(0, 5)); // Only show last 5
      }

      setLastUpdate(new Date());
    } catch {
      // Handle error silently - show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and polling every 60 seconds
  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 60000);
    return () => clearInterval(interval);
  }, [fetchMatches]);

  const allMatches = [...liveMatches, ...finishedMatches];
  const totalPoints = allMatches.reduce((acc, m) => acc + (m.user_prediction?.puntos_obtenidos || 0), 0);
  const correctPredictions = allMatches.filter(m => {
    if (!m.user_prediction || m.goles_local === null || m.goles_visitante === null) return false;
    const actualResult = m.goles_local > m.goles_visitante ? "home" : m.goles_local < m.goles_visitante ? "away" : "draw";
    const predictedResult = m.user_prediction.goles_local > m.user_prediction.goles_visitante ? "home" : m.user_prediction.goles_local < m.user_prediction.goles_visitante ? "away" : "draw";
    return actualResult === predictedResult;
  }).length;
  const exactPredictions = allMatches.filter(m => m.user_prediction?.es_exacto).length;

  if (loading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (liveMatches.length === 0 && finishedMatches.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <Activity className="h-5 w-5 text-destructive" />
            </div>
            <CardTitle className="text-lg font-bold text-card-foreground">
              Resultados en Vivo
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-sm font-medium text-foreground mb-1">
              No hay partidos en vivo ni finalizados recientemente
            </p>
            <p className="text-xs text-muted-foreground">
              Los resultados aparecerán aquí una vez que los partidos finalicen.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <Activity className="h-5 w-5 text-destructive" />
              {liveMatches.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {liveMatches.length}
                </span>
              )}
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-card-foreground">
                Resultados en Vivo
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Actualizado: {lastUpdate.toLocaleTimeString("es-ES")}
              </p>
            </div>
          </div>
          {totalPoints > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-primary">+{totalPoints} pts</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Live Matches */}
        {liveMatches.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              En Juego
            </h3>
            {liveMatches.map((match) => (
              <div
                key={match.id}
                className="rounded-xl border border-destructive/30 bg-destructive/5 p-3"
              >
                <div className="flex items-center justify-between">
                  {/* Home Team */}
                  <div className="flex flex-1 items-center gap-2">
                    <span className="text-xl">{getFlag(match.equipo_local.codigo)}</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-card-foreground">
                        {match.equipo_local.codigo}
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex flex-col items-center">
                    <StatusBadge status={match.estado} />
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-2xl font-bold text-card-foreground">
                        {match.goles_local ?? 0}
                      </span>
                      <span className="text-lg text-muted-foreground">-</span>
                      <span className="text-2xl font-bold text-card-foreground">
                        {match.goles_visitante ?? 0}
                      </span>
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className="flex flex-1 items-center justify-end gap-2">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-card-foreground">
                        {match.equipo_visitante.codigo}
                      </span>
                    </div>
                    <span className="text-xl">{getFlag(match.equipo_visitante.codigo)}</span>
                  </div>
                </div>
                <PredictionResult
                  prediction={match.user_prediction}
                  matchGoalsLocal={match.goles_local}
                  matchGoalsVisitante={match.goles_visitante}
                />
              </div>
            ))}
          </div>
        )}

        {/* Finished Matches */}
        {finishedMatches.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Finalizados
            </h3>
            {finishedMatches.map((match) => (
              <div
                key={match.id}
                className="rounded-xl border border-border bg-secondary/20 p-3"
              >
                <div className="flex items-center justify-between">
                  {/* Home Team */}
                  <div className="flex flex-1 items-center gap-2">
                    <span className="text-xl">{getFlag(match.equipo_local.codigo)}</span>
                    <span className="text-sm font-bold text-card-foreground">
                      {match.equipo_local.codigo}
                    </span>
                  </div>

                  {/* Score */}
                  <div className="flex flex-col items-center">
                    <StatusBadge status={match.estado} />
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xl font-bold text-card-foreground">
                        {match.goles_local ?? 0}
                      </span>
                      <span className="text-muted-foreground">-</span>
                      <span className="text-xl font-bold text-card-foreground">
                        {match.goles_visitante ?? 0}
                      </span>
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className="flex flex-1 items-center justify-end gap-2">
                    <span className="text-sm font-bold text-card-foreground">
                      {match.equipo_visitante.codigo}
                    </span>
                    <span className="text-xl">{getFlag(match.equipo_visitante.codigo)}</span>
                  </div>
                </div>
                <PredictionResult
                  prediction={match.user_prediction}
                  matchGoalsLocal={match.goles_local}
                  matchGoalsVisitante={match.goles_visitante}
                />
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-success/10 p-3 text-center">
            <p className="text-2xl font-bold text-success">
              {correctPredictions}
            </p>
            <p className="text-xs text-muted-foreground">Aciertos</p>
          </div>
          <div className="rounded-lg bg-primary/10 p-3 text-center">
            <p className="text-2xl font-bold text-primary">
              {exactPredictions}
            </p>
            <p className="text-xs text-muted-foreground">Exactos</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
