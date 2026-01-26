"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trophy, Loader2, Mail, Lock, ArrowLeft, CreditCard, Phone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type IdentifierType = "email" | "cedula" | "celular";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [identifierType, setIdentifierType] = useState<IdentifierType>("email");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          password,
          identifier_type: identifierType,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Error al iniciar sesión");
        setLoading(false);
        return;
      }

      // Breve pausa para que el navegador persista las cookies antes de navegar.
      await new Promise((r) => setTimeout(r, 50));

      // Redirigir según rol (sin refresh para evitar latencia extra)
      if (data.user.es_admin) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
      setLoading(false);
    }
  };

  const getPlaceholder = () => {
    switch (identifierType) {
      case "email": return "tu@email.com";
      case "cedula": return "1234567890";
      case "celular": return "3001234567";
    }
  };

  const getIcon = () => {
    switch (identifierType) {
      case "email": return <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />;
      case "cedula": return <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />;
      case "celular": return <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Bienvenido de vuelta</CardTitle>
            <CardDescription>
              Inicia sesión para continuar con tus predicciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>Iniciar sesión con</Label>
                <RadioGroup
                  value={identifierType}
                  onValueChange={(value) => {
                    setIdentifierType(value as IdentifierType);
                    setIdentifier("");
                  }}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="email-option" />
                    <Label htmlFor="email-option" className="cursor-pointer">Correo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cedula" id="cedula-option" />
                    <Label htmlFor="cedula-option" className="cursor-pointer">Cédula</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="celular" id="celular-option" />
                    <Label htmlFor="celular-option" className="cursor-pointer">Celular</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="identifier">
                  {identifierType === "email" && "Correo electrónico"}
                  {identifierType === "cedula" && "Número de cédula"}
                  {identifierType === "celular" && "Número de celular"}
                </Label>
                <div className="relative">
                  {getIcon()}
                  <Input
                    id="identifier"
                    type={identifierType === "email" ? "email" : "text"}
                    placeholder={getPlaceholder()}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    autoComplete={
                      identifierType === "email"
                        ? "email"
                        : identifierType === "cedula"
                        ? "username"
                        : "tel"
                    }
                    required
                    className="pl-10 bg-input border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="pl-10 bg-input border-border"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-3 text-center text-sm">
              <div>
                <Link href="/forgot-password" className="text-primary hover:underline font-medium">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="text-muted-foreground">
                ¿No tienes cuenta? Contacta al administrador para obtener tu link de registro.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
