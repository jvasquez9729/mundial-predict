"use client";

import { useState, useEffect, useCallback } from "react";
import { Send, Clock, MapPin, ChevronLeft, ChevronRight, Check, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressRing } from "@/components/progress-ring";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";

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
  fecha_hora: string;
  estadio: string;
  fase: string;
  predicciones_cerradas: boolean;
  user_prediction?: {
    goles_local: number;
    goles_visitante: number;
  };
}

interface PredictionStats {
  total: number;
  correctas: number;
  exactas: number;
}

interface PredictionState {
  [matchId: string]: {
    home: string;
    away: string;
  };
}

const faseLabels: Record<string, string> = {
  grupos: "Fase de Grupos",
  octavos: "Octavos",
  cuartos: "Cuartos",
  semifinal: "Semifinal",
  tercer_puesto: "3er Puesto",
  final: "Final",
};

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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

export function PredictionForm() {
  const { t } = useTranslation();
  const [matches, setMatches] = useState<Match[]>([]);
  const [stats, setStats] = useState<PredictionStats>({ total: 0, correctas: 0, exactas: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [predictions, setPredictions] = useState<PredictionState>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<string[]>([]);

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/matches?upcoming=true&limit=10");
      const data = await response.json();

      if (data.success) {
        setMatches(data.matches);
        const existingPredictions: PredictionState = {};
        data.matches.forEach((match: Match) => {
          if (match.user_prediction) {
            existingPredictions[match.id] = {
              home: match.user_prediction.goles_local.toString(),
              away: match.user_prediction.goles_visitante.toString(),
            };
          }
        });
        setPredictions(existingPredictions);
        setSubmitted(data.matches.filter((m: Match) => m.user_prediction).map((m: Match) => m.id));
        setError(null);
      } else {
        setError(data.error || "Error al cargar partidos");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/predictions");
      const data = await response.json();
      if (data.success && data.stats) {
        setStats({
          total: data.stats.total || 0,
          correctas: data.stats.aciertos || 0,
          exactas: data.stats.marcadores_exactos || 0,
        });
      }
    } catch {
      // Stats are not critical
    }
  }, []);

  useEffect(() => {
    fetchMatches();
    fetchStats();
  }, [fetchMatches, fetchStats]);

  const currentMatch = matches[currentMatchIndex];

  const handlePredictionChange = (matchId: string, team: "home" | "away", value: string) => {
    const numValue = value.replace(/\D/g, "").slice(0, 2);
    setPredictions((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: numValue,
      },
    }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (matchId: string) => {
    const prediction = predictions[matchId];
    if (!prediction?.home || !prediction?.away) return;

    setSubmitting(matchId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          match_id: matchId,
          goles_local: parseInt(prediction.home, 10),
          goles_visitante: parseInt(prediction.away, 10),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted((prev) => [...prev, matchId]);
        setSuccess("¡Predicción guardada exitosamente!");
        fetchStats();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || "Error al enviar predicción");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setSubmitting(null);
    }
  };

  const canSubmit = (matchId: string) => {
    const prediction = predictions[matchId];
    const match = matches.find((m) => m.id === matchId);
    return (
      prediction?.home !== undefined &&
      prediction?.away !== undefined &&
      prediction.home !== "" &&
      prediction.away !== "" &&
      !match?.predicciones_cerradas
    );
  };

  const accuracy = stats.total > 0 ? Math.round(((stats.correctas + stats.exactas) / stats.total) * 100) : 0;

  if (loading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (matches.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Send className="h-5 w-5 text-accent" />
            </div>
            <CardTitle className="text-lg font-bold text-card-foreground">
              {t("predictions.title")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-sm font-medium text-foreground mb-1">{t("predictions.noMatches")}</p>
            <p className="text-xs text-muted-foreground">
              Los partidos se publicarán próximamente. Mantente atento para hacer tus predicciones.
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Send className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-card-foreground">
                {t("predictions.title")}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {t("predictions.availableMatches", { count: matches.length })}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive flex items-center justify-between"
            >
              <span>{error}</span>
              <button onClick={() => setError(null)} className="underline text-xs">
                {t("common.close")}
              </button>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-lg bg-success/10 p-3 text-sm text-success flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Match Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMatchIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentMatchIndex === 0}
            className="transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex gap-1">
            {matches.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentMatchIndex(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === currentMatchIndex ? "w-6 bg-primary" : "w-2 bg-muted hover:bg-muted-foreground/50"
                )}
                aria-label={t("predictions.goToMatch", { index: index + 1 })}
              />
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMatchIndex((prev) => Math.min(matches.length - 1, prev + 1))}
            disabled={currentMatchIndex === matches.length - 1}
            className="transition-all"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {currentMatch && (
          <motion.div
            key={currentMatch.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Match Card */}
            <div className="rounded-xl border-2 border-border bg-gradient-to-br from-card to-secondary/20 p-6 shadow-lg">
              {/* Match Info */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-primary text-xs font-medium">
                  {faseLabels[currentMatch.fase] || currentMatch.fase}
                </span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDate(currentMatch.fecha_hora)} - {formatTime(currentMatch.fecha_hora)}
                  </span>
                </div>
              </div>

              {currentMatch.predicciones_cerradas && (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="mb-4 rounded-lg bg-destructive/10 p-3 text-center text-xs text-destructive"
                >
                  {t("predictions.closed")}
                </motion.div>
              )}

              {/* Teams & Score Input */}
              <div className="flex items-center justify-center gap-4 mb-4">
                {/* Home Team */}
                <div className="flex flex-1 flex-col items-center gap-3">
                  <motion.span
                    className="text-5xl"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    {getFlag(currentMatch.equipo_local.codigo)}
                  </motion.span>
                  <span className="text-sm font-bold text-card-foreground">
                    {currentMatch.equipo_local.codigo}
                  </span>
                  <span className="text-xs text-muted-foreground text-center">
                    {currentMatch.equipo_local.nombre}
                  </span>
                </div>

                {/* Score Inputs */}
                <div className="flex items-center gap-3">
                  <motion.div whileFocus={{ scale: 1.05 }} whileHover={{ scale: 1.02 }}>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={predictions[currentMatch.id]?.home || ""}
                      onChange={(e) => handlePredictionChange(currentMatch.id, "home", e.target.value)}
                      className={cn(
                        "h-16 w-16 text-center text-3xl font-bold bg-input border-2 transition-all",
                        predictions[currentMatch.id]?.home &&
                          !currentMatch.predicciones_cerradas &&
                          "border-primary shadow-lg"
                      )}
                      placeholder="0"
                      maxLength={2}
                      disabled={
                        currentMatch.predicciones_cerradas || submitted.includes(currentMatch.id)
                      }
                    />
                  </motion.div>
                  <span className="text-2xl font-bold text-muted-foreground">-</span>
                  <motion.div whileFocus={{ scale: 1.05 }} whileHover={{ scale: 1.02 }}>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={predictions[currentMatch.id]?.away || ""}
                      onChange={(e) => handlePredictionChange(currentMatch.id, "away", e.target.value)}
                      className={cn(
                        "h-16 w-16 text-center text-3xl font-bold bg-input border-2 transition-all",
                        predictions[currentMatch.id]?.away &&
                          !currentMatch.predicciones_cerradas &&
                          "border-primary shadow-lg"
                      )}
                      placeholder="0"
                      maxLength={2}
                      disabled={
                        currentMatch.predicciones_cerradas || submitted.includes(currentMatch.id)
                      }
                    />
                  </motion.div>
                </div>

                {/* Away Team */}
                <div className="flex flex-1 flex-col items-center gap-3">
                  <motion.span
                    className="text-5xl"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    {getFlag(currentMatch.equipo_visitante.codigo)}
                  </motion.span>
                  <span className="text-sm font-bold text-card-foreground">
                    {currentMatch.equipo_visitante.codigo}
                  </span>
                  <span className="text-xs text-muted-foreground text-center">
                    {currentMatch.equipo_visitante.nombre}
                  </span>
                </div>
              </div>

              {/* Stadium */}
              <div className="mt-4 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {currentMatch.estadio}
              </div>
            </div>

            {/* Submit Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="w-full gap-2 mt-4 h-12 text-base font-semibold"
                onClick={() => handleSubmit(currentMatch.id)}
                disabled={!canSubmit(currentMatch.id) || submitting === currentMatch.id}
              >
                <AnimatePresence mode="wait">
                  {submitting === currentMatch.id ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("predictions.sending")}
                    </motion.div>
                  ) : submitted.includes(currentMatch.id) ? (
                    <motion.div
                      key="sent"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      {t("predictions.predictionSent")}
                    </motion.div>
                  ) : currentMatch.predicciones_cerradas ? (
                    <motion.div
                      key="closed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {t("predictions.predictionsClosed")}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="send"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      {t("predictions.sendPrediction")}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 rounded-lg bg-muted/30 p-4 border border-border">
          <div className="text-center">
            <p className="text-xl font-bold text-card-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">{t("predictions.sent")}</p>
          </div>
          <div className="text-center border-x border-border">
            <p className="text-xl font-bold text-success">{stats.correctas + stats.exactas}</p>
            <p className="text-xs text-muted-foreground">{t("predictions.correct")}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <ProgressRing progress={accuracy} size={40} strokeWidth={5} />
              <div className="text-left">
                <p className="text-lg font-bold text-primary">{accuracy}%</p>
                <p className="text-xs text-muted-foreground">{t("predictions.accuracy")}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
