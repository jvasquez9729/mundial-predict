"use client";

import { useState, useTransition, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getCsrfHeaders } from "@/lib/api/client";
import {
  Trophy,
  LogOut,
  Calendar,
  Clock,
  Target,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Star,
  Users,
  ArrowLeft,
  Send,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SimpleUser {
  id: string;
  email: string | null;
}

interface TeamRef {
  id: string;
  nombre: string;
  codigo: string;
  bandera_url?: string | null;
}

interface Match {
  id: string;
  equipo_local: TeamRef;
  equipo_visitante: TeamRef;
  fecha_hora: string;
  fase: string;
  estadio: string | null;
  estado: string;
  predicciones_cerradas?: boolean;
}

interface Profile {
  id: string;
  nombre_completo: string;
  email: string;
  cedula: string | null;
  celular: string | null;
  es_admin: boolean;
  creado_en: string;
}

interface Prediction {
  id: string;
  match_id: string;
  goles_local: number;
  goles_visitante: number;
}

interface PredictionsPanelProps {
  user: SimpleUser;
  profile: Profile | null;
  matches: Match[];
  existingPredictions: Prediction[];
}

/** Misma regla que la API: predicciones cierran 1 día antes del inicio del Mundial. */
const WORLD_CUP_START = new Date("2026-06-11T00:00:00.000Z");
function predictionsClosed(): boolean {
  const now = new Date();
  const one = new Date(WORLD_CUP_START);
  one.setUTCDate(one.getUTCDate() - 1);
  return now >= one;
}

export function PredictionsPanel({
  user,
  profile,
  matches,
  existingPredictions,
}: PredictionsPanelProps) {
  const [predictions, setPredictions] = useState<
    Record<string, { home: string; away: string }>
  >(() => {
    const initial: Record<string, { home: string; away: string }> = {};
    existingPredictions.forEach((p) => {
      initial[p.match_id] = {
        home: String(p.goles_local),
        away: String(p.goles_visitante),
      };
    });
    return initial;
  });
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deletedMatchIds, setDeletedMatchIds] = useState<Set<string>>(new Set());
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = createClient();
  const closed = useMemo(() => predictionsClosed(), []);

  const pendingMatches = useMemo(
    () => matches.filter((m) => m.estado === "proximo"),
    [matches]
  );
  const currentMatch = useMemo(
    () => pendingMatches[currentMatchIndex] ?? null,
    [pendingMatches, currentMatchIndex]
  );
  const predictionCount = useMemo(
    () => Math.max(0, existingPredictions.length - deletedMatchIds.size),
    [existingPredictions.length, deletedMatchIds.size]
  );

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: getCsrfHeaders(),
      credentials: "include",
    });
    router.push("/");
    router.refresh();
  }, [router, supabase]);

  const handlePredictionChange = useCallback(
    (matchId: string, team: "home" | "away", value: string) => {
      if (value === "" || /^\d+$/.test(value)) {
        setPredictions((prev) => ({
          ...prev,
          [matchId]: { ...prev[matchId], [team]: value },
        }));
      }
    },
    []
  );

  const submitPrediction = useCallback(async (matchId: string) => {
    const pred = predictions[matchId];
    if (!pred || pred.home === "" || pred.away === "") {
      setError("Ingresa ambos marcadores");
      return;
    }

    const goles_local = parseInt(pred.home, 10);
    const goles_visitante = parseInt(pred.away, 10);
    if (Number.isNaN(goles_local) || Number.isNaN(goles_visitante)) {
      setError("Ingresa números válidos");
      return;
    }

    setSubmitting(matchId);
    setError(null);
    setSuccess(null);

    const res = await fetch("/api/predictions", {
      method: "POST",
      headers: getCsrfHeaders(),
      body: JSON.stringify({
        match_id: matchId,
        goles_local,
        goles_visitante,
      }),
    });
    const data = await res.json().catch(() => ({}));

    setSubmitting(null);

    if (!res.ok || !data.success) {
      setError(data.error || "Error al guardar predicción");
      return;
    }

    setSuccess(matchId);
    startTransition(() => router.refresh());
    setTimeout(() => setSuccess(null), 3000);
  }, [predictions, startTransition, router]);

  const deletePrediction = useCallback(async (matchId: string) => {
    if (closed) return;
    setDeleting(matchId);
    setError(null);

    const res = await fetch(`/api/predictions?match_id=${encodeURIComponent(matchId)}`, {
      method: "DELETE",
      headers: getCsrfHeaders(),
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));

    setDeleting(null);

    if (!res.ok || !data.success) {
      setError(data.error || "Error al eliminar predicción");
      return;
    }

    setPredictions((prev) => {
      const next = { ...prev };
      delete next[matchId];
      return next;
    });
    setDeletedMatchIds((prev) => new Set(prev).add(matchId));
    startTransition(() => router.refresh());
  }, [closed, startTransition]);

  const formatDate = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }, []);

  const formatTime = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const hasPrediction = useCallback(
    (matchId: string) =>
      existingPredictions.some((p) => p.match_id === matchId) &&
      !deletedMatchIds.has(matchId),
    [existingPredictions, deletedMatchIds]
  );

  const onPrevMatch = useCallback(
    () => setCurrentMatchIndex((p) => Math.max(0, p - 1)),
    []
  );
  const onNextMatch = useCallback(
    () =>
      setCurrentMatchIndex((p) =>
        Math.min(Math.max(0, pendingMatches.length - 1), p + 1)
      ),
    [pendingMatches.length]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Volver al inicio</span>
            </Link>

            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Mis Predicciones</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <Avatar className="h-8 w-8 border-2 border-primary">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {profile?.nombre_completo?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {profile?.nombre_completo || user.email}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{predictionCount}</p>
                <p className="text-xs text-muted-foreground">Predicciones</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  0
                </p>
                <p className="text-xs text-muted-foreground">Aciertos</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  0
                </p>
                <p className="text-xs text-muted-foreground">Exactos</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Flame className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{predictionCount}</p>
                <p className="text-xs text-muted-foreground">Predicciones</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="destacado" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto bg-secondary">
            <TabsTrigger
              value="destacado"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Partido destacado
            </TabsTrigger>
            <TabsTrigger
              value="todos"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Todos los partidos
            </TabsTrigger>
          </TabsList>

          {/* Featured Match Tab */}
          <TabsContent value="destacado" className="space-y-6">
            {pendingMatches.length > 0 && currentMatch ? (
              <Card className="overflow-hidden border-border/50 bg-gradient-to-b from-card to-card/50">
                <CardHeader className="text-center pb-2 border-b border-border/30">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className="border-primary/50 text-primary"
                    >
                      {currentMatch.fase}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center justify-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(currentMatch.fecha_hora)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatTime(currentMatch.fecha_hora)}
                    </span>
                  </CardDescription>
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentMatch.estadio ?? "—"}
                  </p>
                </CardHeader>

                <CardContent className="p-6">
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success === currentMatch.id && (
                    <Alert className="mb-4 border-success/50 bg-success/10">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <AlertDescription className="text-success">
                        Prediccion guardada correctamente
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex items-center justify-center gap-4 md:gap-8">
                    {/* Local */}
                    <div className="flex-1 text-center">
                      <div className="text-4xl md:text-6xl mb-2">
                        {currentMatch.equipo_local?.bandera_url ? (
                          <img
                            src={currentMatch.equipo_local.bandera_url}
                            alt=""
                            className="w-12 h-12 md:w-16 md:h-16 mx-auto object-contain"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-muted-foreground">
                            {currentMatch.equipo_local?.codigo ?? "—"}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-sm md:text-base">
                        {currentMatch.equipo_local?.nombre ?? "—"}
                      </p>
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={predictions[currentMatch.id]?.home || ""}
                        onChange={(e) =>
                          handlePredictionChange(
                            currentMatch.id,
                            "home",
                            e.target.value
                          )
                        }
                        className="w-16 h-16 text-center text-2xl font-bold mx-auto mt-3 bg-input border-border"
                        placeholder="-"
                        aria-label={`Goles de ${currentMatch.equipo_local?.nombre ?? "local"}`}
                      />
                    </div>

                    {/* VS */}
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold text-muted-foreground">
                        VS
                      </span>
                      {hasPrediction(currentMatch.id) && (
                        <Badge className="mt-2 bg-success/20 text-success border-success/30">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Guardado
                        </Badge>
                      )}
                    </div>

                    {/* Visitante */}
                    <div className="flex-1 text-center">
                      <div className="text-4xl md:text-6xl mb-2">
                        {currentMatch.equipo_visitante?.bandera_url ? (
                          <img
                            src={currentMatch.equipo_visitante.bandera_url}
                            alt=""
                            className="w-12 h-12 md:w-16 md:h-16 mx-auto object-contain"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-muted-foreground">
                            {currentMatch.equipo_visitante?.codigo ?? "—"}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-sm md:text-base">
                        {currentMatch.equipo_visitante?.nombre ?? "—"}
                      </p>
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={predictions[currentMatch.id]?.away || ""}
                        onChange={(e) =>
                          handlePredictionChange(
                            currentMatch.id,
                            "away",
                            e.target.value
                          )
                        }
                        className="w-16 h-16 text-center text-2xl font-bold mx-auto mt-3 bg-input border-border"
                        placeholder="-"
                        aria-label={`Goles de ${currentMatch.equipo_visitante?.nombre ?? "visitante"}`}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3">
                    <Button
                      onClick={() => submitPrediction(currentMatch.id)}
                      disabled={
                        submitting === currentMatch.id ||
                        !predictions[currentMatch.id]?.home ||
                        !predictions[currentMatch.id]?.away
                      }
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base"
                    >
                      {submitting === currentMatch.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          {hasPrediction(currentMatch.id)
                            ? "Actualizar prediccion"
                            : "Guardar prediccion"}
                        </>
                      )}
                    </Button>
                    {hasPrediction(currentMatch.id) && !closed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deletePrediction(currentMatch.id)}
                        disabled={deleting === currentMatch.id}
                        className="w-full border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        {deleting === currentMatch.id ? (
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-3 w-3" />
                        )}
                        Eliminar prediccion
                      </Button>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/30">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onPrevMatch}
                      disabled={currentMatchIndex === 0}
                      className="text-muted-foreground"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </Button>

                    <span className="text-sm text-muted-foreground">
                      {currentMatchIndex + 1} de {pendingMatches.length}
                    </span>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onNextMatch}
                      disabled={currentMatchIndex === pendingMatches.length - 1}
                      className="text-muted-foreground"
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/50 bg-card/50">
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">
                    No hay partidos pendientes
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Todos los partidos han sido cerrados para predicciones. Vuelve pronto para nuevos partidos.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* All Matches Tab */}
          <TabsContent value="todos" className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {pendingMatches.length > 0 ? (
              <div className="grid gap-4">
                {pendingMatches.map((match) => (
                  <Card
                    key={match.id}
                    className="border-border/50 bg-card/50 overflow-hidden"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge
                          variant="outline"
                          className="text-xs border-border"
                        >
                          {match.fase}
                        </Badge>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(match.fecha_hora)}
                          <Clock className="h-3 w-3 ml-2" />
                          {formatTime(match.fecha_hora)}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Local */}
                        <div className="flex-1 flex items-center gap-2">
                          {match.equipo_local?.bandera_url ? (
                            <img
                              src={match.equipo_local.bandera_url}
                              alt=""
                              className="w-6 h-6 object-contain"
                            />
                          ) : (
                            <span className="text-sm font-medium text-muted-foreground">
                              {match.equipo_local?.codigo ?? "—"}
                            </span>
                          )}
                          <span className="font-medium text-sm truncate">
                            {match.equipo_local?.nombre ?? "—"}
                          </span>
                        </div>

                        {/* Score Inputs */}
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={predictions[match.id]?.home || ""}
                            onChange={(e) =>
                              handlePredictionChange(
                                match.id,
                                "home",
                                e.target.value
                              )
                            }
                            className="w-12 h-10 text-center font-bold bg-input border-border"
                            placeholder="-"
                            aria-label={`Goles de ${match.equipo_local?.nombre ?? "local"}`}
                          />
                          <span className="text-muted-foreground font-medium">
                            -
                          </span>
                          <Input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={predictions[match.id]?.away || ""}
                            onChange={(e) =>
                              handlePredictionChange(
                                match.id,
                                "away",
                                e.target.value
                              )
                            }
                            className="w-12 h-10 text-center font-bold bg-input border-border"
                            placeholder="-"
                            aria-label={`Goles de ${match.equipo_visitante?.nombre ?? "visitante"}`}
                          />
                        </div>

                        {/* Visitante */}
                        <div className="flex-1 flex items-center justify-end gap-2">
                          <span className="font-medium text-sm truncate">
                            {match.equipo_visitante?.nombre ?? "—"}
                          </span>
                          {match.equipo_visitante?.bandera_url ? (
                            <img
                              src={match.equipo_visitante.bandera_url}
                              alt=""
                              className="w-6 h-6 object-contain"
                            />
                          ) : (
                            <span className="text-sm font-medium text-muted-foreground">
                              {match.equipo_visitante?.codigo ?? "—"}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                        <span className="text-xs text-muted-foreground">
                          {match.estadio ?? "—"}
                        </span>
                        <div className="flex items-center gap-2">
                          {hasPrediction(match.id) && (
                            <Badge className="bg-success/20 text-success border-success/30 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Guardado
                            </Badge>
                          )}
                          {hasPrediction(match.id) && !closed && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deletePrediction(match.id)}
                              disabled={deleting === match.id}
                              className="h-8 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive px-2"
                              aria-label="Eliminar predicción"
                            >
                              {deleting === match.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => submitPrediction(match.id)}
                            disabled={
                              submitting === match.id ||
                              !predictions[match.id]?.home ||
                              !predictions[match.id]?.away
                            }
                            className="bg-primary hover:bg-primary/90 text-primary-foreground h-8"
                          >
                            {submitting === match.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Send className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {success === match.id && (
                        <Alert className="mt-3 border-success/50 bg-success/10 py-2">
                          <CheckCircle className="h-3 w-3 text-success" />
                          <AlertDescription className="text-success text-xs">
                            Guardado
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-border/50 bg-card/50">
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">
                    No hay partidos disponibles
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Los partidos se publicarán próximamente. Mantente atento para hacer tus predicciones.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Tips */}
        <Card className="mt-8 border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Consejo del dia</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Las predicciones cierran 1 día antes del inicio del Mundial.
                  Recuerda hacer tus predicciones a tiempo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
