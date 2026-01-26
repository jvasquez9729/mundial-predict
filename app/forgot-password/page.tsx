"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trophy, Loader2, Mail, ArrowLeft, CreditCard, Phone, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

type IdentifierType = "email" | "cedula" | "celular";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [identifierType, setIdentifierType] = useState<IdentifierType>("email");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          identifier_type: identifierType,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Error al solicitar recuperación");
        setLoading(false);
        return;
      }

      // Mostrar mensaje de éxito
      setSuccess(true);
      setLoading(false);
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

  if (success) {
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
            <CardContent className="pt-6 text-center">
              <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Correo enviado</h2>
              <p className="text-muted-foreground mb-6">
                Si el usuario existe, recibirás un correo con instrucciones para recuperar tu contraseña.
                Revisa tu bandeja de entrada y la carpeta de spam.
              </p>
              <div className="space-y-3">
                <Link href="/login">
                  <Button className="w-full">
                    Volver al inicio de sesión
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full bg-transparent">
                    Ir al inicio
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            <CardTitle className="text-2xl font-bold">Recuperar Contraseña</CardTitle>
            <CardDescription>
              Ingresa tu correo, cédula o celular para recibir un enlace de recuperación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>Identificarme con</Label>
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

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar enlace de recuperación"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <Link href="/login" className="text-primary hover:underline font-medium">
                ← Volver al inicio de sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
