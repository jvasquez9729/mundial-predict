"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowLeft, Lock, Mail, Info } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SignUpPage() {
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
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Registro Restringido</CardTitle>
            <CardDescription>
              El registro solo está disponible con links únicos proporcionados por el administrador
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>¿Cómo registrarte?</AlertTitle>
              <AlertDescription className="mt-2">
                Para participar en Mundial Predict, necesitas un <strong>link de registro único</strong> que solo puede ser generado por el administrador.
                <br /><br />
                Si ya tienes un link de registro, asegúrate de acceder usando ese link completo (debe incluir <code>?t=TOKEN</code>).
                <br /><br />
                Si no tienes un link de registro, contacta al administrador para obtener uno.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Pasos para registrarte:</h3>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>Contacta al administrador para solicitar tu link de registro</li>
                <li>El administrador te enviará un link único (ej: <code className="text-xs bg-muted px-1 py-0.5 rounded">/registro?t=abc123...</code>)</li>
                <li>Haz clic en ese link para acceder al formulario de registro</li>
                <li>Completa tus datos y crea tu cuenta</li>
              </ol>
            </div>

            <div className="pt-4 space-y-2">
              <Button asChild className="w-full">
                <Link href="/login">
                  Ya tengo cuenta - Iniciar sesión
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/">
                  Volver al inicio
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
