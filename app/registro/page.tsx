"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trophy, Loader2, Mail, Lock, User, ArrowLeft, CheckCircle, CreditCard, AlertCircle } from "lucide-react";
import { PhoneInput } from "@/components/phone-input";
import Link from "next/link";

function RegistrationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("t");

  const [nombreCompleto, setNombreCompleto] = useState("");
  const [cedula, setCedula] = useState("");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");
  const [countryCode, setCountryCode] = useState("+57"); // Colombia por defecto
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  // Validar token al cargar
  useEffect(() => {
    if (!token) {
      setError("Token de registro no válido o faltante");
      setValidating(false);
      setTokenValid(false);
      return;
    }

    // Verificar token con el servidor usando endpoint de validación
    fetch(`/api/auth/validate-token?t=${encodeURIComponent(token)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then(async (res) => {
        const data = await res.json();
        // Corregir: verificar data.valid explícitamente
        if (data.success === true && data.valid === true) {
          setTokenValid(true);
          setError(null);
        } else {
          setTokenValid(false);
          setError(data.error || "Token de registro inválido");
        }
      })
      .catch((err) => {
        console.error('Error validating token:', err);
        setTokenValid(false);
        setError("Error al validar el token. Por favor, intenta de nuevo.");
      })
      .finally(() => {
        setValidating(false);
      });
  }, [token]);

  // Validar email con dominios válidos
  const validateEmailDomain = (email: string): boolean => {
    const validDomains = [
      'gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com',
      'protonmail.com', 'mail.com', 'aol.com', 'live.com', 'msn.com',
      'yandex.com', 'zoho.com', 'gmx.com', 'tutanota.com', 'fastmail.com',
      'mail.ru', 'qq.com', '163.com', 'sina.com', 'rediffmail.com',
      'cox.net', 'verizon.net', 'att.net', 'sbcglobal.net', 'comcast.net',
      'earthlink.net', 'juno.com', 'aim.com', 'rocketmail.com', 'ymail.com',
      'me.com', 'mac.com', 'inbox.com', 'hushmail.com', 'lavabit.com',
      'gmx.de', 'web.de', 't-online.de', 'orange.fr', 'wanadoo.fr',
      'free.fr', 'laposte.net', 'libero.it', 'virgilio.it', 'alice.it',
      'terra.com.br', 'uol.com.br', 'bol.com.br', 'ig.com.br', 'globo.com',
      'hotmail.es', 'terra.es', 'telefonica.net', 'movistar.es', 'yahoo.es',
      'gmail.co', 'outlook.co', 'hotmail.co', 'yahoo.co', 'live.co',
      'gmail.com.co', 'outlook.com.co', 'hotmail.com.co', 'yahoo.com.co',
    ];
    
    const domain = email.toLowerCase().split('@')[1];
    return validDomains.some(validDomain => domain === validDomain || domain?.endsWith('.' + validDomain));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validaciones del cliente
    if (!nombreCompleto.trim() || nombreCompleto.trim().length < 3) {
      setError("El nombre completo debe tener al menos 3 caracteres");
      setLoading(false);
      return;
    }

    // Validar cédula: si se ingresa, debe ser exactamente 10 dígitos
    if (cedula.trim() && cedula.trim().length !== 10) {
      setError("La cédula debe tener exactamente 10 dígitos");
      setLoading(false);
      return;
    }

    // Validar email: debe tener formato válido y dominio válido
    const emailTrimmed = email.toLowerCase().trim();
    if (!emailTrimmed) {
      setError("El correo electrónico es obligatorio");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setError("El formato del correo electrónico no es válido");
      setLoading(false);
      return;
    }

    if (!validateEmailDomain(emailTrimmed)) {
      setError("El correo electrónico debe tener un dominio válido (gmail, outlook, hotmail, etc.)");
      setLoading(false);
      return;
    }

    // Validar celular: obligatorio
    if (!celular.trim() || celular.trim().length < 7) {
      setError("El número de celular es obligatorio y debe tener al menos 7 dígitos");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("Token de registro no válido");
      setLoading(false);
      return;
    }

    try {
      // Combinar código de país con número de celular
      const fullPhoneNumber = `${countryCode}${celular.trim()}`;
      
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          nombre_completo: nombreCompleto.trim(),
          cedula: cedula.trim() || undefined, // Opcional: undefined si está vacío
          email: emailTrimmed,
          celular: fullPhoneNumber, // Incluir código de país
          password,
          confirm_password: confirmPassword, // Agregar confirm_password que falta
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Error al registrar usuario");
        setLoading(false);
        return;
      }

      // Registro exitoso
      setSuccess(true);
      setLoading(false);

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Validando token de registro...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!token || !tokenValid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="pt-6 text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Token inválido</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {error || "El link de registro no es válido, ha expirado o ya fue utilizado."}
                </p>
                {!token && (
                  <Alert variant="destructive" className="mt-4 text-left">
                    <AlertDescription className="text-xs">
                      No se detectó un token de registro en la URL. Asegúrate de usar el link completo que te proporcionó el administrador.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              <div className="space-y-2">
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full">
                    Ir al inicio de sesión
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => {
                    // Intentar recargar la página
                    window.location.reload();
                  }}
                >
                  Reintentar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold mb-2">¡Registro exitoso!</h2>
            <p className="text-muted-foreground mb-6">
              Tu cuenta ha sido creada correctamente. Serás redirigido al inicio de sesión en unos segundos...
            </p>
            <Link href="/login">
              <Button className="w-full">
                Ir al inicio de sesión
              </Button>
            </Link>
          </CardContent>
        </Card>
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
            <CardTitle className="text-2xl font-bold">Únete al Mundial Predict</CardTitle>
            <CardDescription>
              Completa el formulario para crear tu cuenta y comenzar a predecir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="nombre_completo">Nombre Completo <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="nombre_completo"
                    type="text"
                    placeholder="Juan Pérez"
                    value={nombreCompleto}
                    onChange={(e) => setNombreCompleto(e.target.value)}
                    required
                    minLength={3}
                    className="pl-10 bg-input border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cedula">
                  Número de Cédula <span className="text-muted-foreground text-xs">(Opcional)</span>
                </Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="cedula"
                    type="text"
                    placeholder="1234567890 (10 dígitos)"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    minLength={10}
                    maxLength={10}
                    className="pl-10 bg-input border-border"
                  />
                </div>
                {cedula && cedula.length !== 10 && (
                  <p className="text-xs text-muted-foreground">
                    La cédula debe tener exactamente 10 dígitos
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className="pl-10 bg-input border-border"
                  />
                </div>
                {email && !validateEmailDomain(email.toLowerCase().trim()) && (
                  <p className="text-xs text-destructive">
                    El correo debe tener un dominio válido (gmail, outlook, hotmail, etc.)
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="celular">Número de Celular <span className="text-destructive">*</span></Label>
                <PhoneInput
                  id="celular"
                  value={celular}
                  onChange={setCelular}
                  countryCode={countryCode}
                  onCountryCodeChange={setCountryCode}
                  required
                  placeholder="3001234567"
                />
                <p className="text-xs text-muted-foreground">
                  Selecciona tu país e ingresa tu número de celular
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    className="pl-10 bg-input border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirmar Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm_password"
                    type="password"
                    placeholder="Confirma tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={6}
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
                    Creando cuenta...
                  </>
                ) : (
                  "Crear cuenta"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
              <Link href="/login" className="text-primary hover:underline font-medium">
                Inicia sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RegistrationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <RegistrationForm />
    </Suspense>
  );
}
