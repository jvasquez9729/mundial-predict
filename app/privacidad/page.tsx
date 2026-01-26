import { Metadata } from 'next'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, Shield, Lock, Eye, FileText, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Política de Privacidad - Mundial Predict',
  description: 'Política de privacidad y protección de datos de Mundial Predict',
}

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">Política de Privacidad</CardTitle>
            <CardDescription className="text-base">
              Última actualización: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Información que Recopilamos</h2>
              <p className="mb-2">
                En Mundial Predict, nos comprometemos a proteger tu privacidad. Recopilamos la siguiente información cuando te registras y utilizas nuestra plataforma:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li><strong>Información de identificación:</strong> Nombre completo, número de cédula, correo electrónico y número de celular</li>
                <li><strong>Datos de uso:</strong> Información sobre cómo interactúas con nuestra plataforma, incluyendo predicciones, puntos y actividad</li>
                <li><strong>Información técnica:</strong> Dirección IP, tipo de navegador, dispositivo y sistema operativo</li>
                <li><strong>Cookies y tecnologías similares:</strong> Utilizamos cookies para mejorar tu experiencia y mantener tu sesión activa</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <Lock className="h-5 w-5" />
                2. Uso de la Información
              </h2>
              <p className="mb-2">Utilizamos la información recopilada para los siguientes fines:</p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Gestionar tu cuenta y autenticación</li>
                <li>Procesar y registrar tus predicciones</li>
                <li>Calcular puntuaciones y mantener la clasificación</li>
                <li>Enviar notificaciones importantes sobre el torneo</li>
                <li>Mejorar nuestros servicios y experiencia del usuario</li>
                <li>Cumplir con obligaciones legales y prevenir fraudes</li>
                <li>Comunicarnos contigo sobre actualizaciones y novedades</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <Eye className="h-5 w-5" />
                3. Compartir Información
              </h2>
              <p className="mb-2">
                No vendemos, alquilamos ni compartimos tu información personal con terceros, excepto en las siguientes circunstancias:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li><strong>Proveedores de servicios:</strong> Compartimos información con proveedores que nos ayudan a operar la plataforma (hosting, email, análisis)</li>
                <li><strong>Cumplimiento legal:</strong> Cuando es requerido por ley o para proteger nuestros derechos legales</li>
                <li><strong>Con tu consentimiento:</strong> Cuando explícitamente autorizas el intercambio de información</li>
              </ul>
              <p className="mb-2">
                <strong>Nota importante:</strong> Tu nombre y posición en la clasificación son visibles públicamente en el leaderboard como parte del juego.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Seguridad de los Datos</h2>
              <p className="mb-2">
                Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Cifrado de contraseñas utilizando tecnologías seguras (bcrypt)</li>
                <li>Comunicaciones seguras mediante HTTPS/SSL</li>
                <li>Acceso restringido a datos personales solo para personal autorizado</li>
                <li>Monitoreo regular de sistemas para detectar vulnerabilidades</li>
                <li>Backups regulares de datos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Tus Derechos</h2>
              <p className="mb-2">Tienes derecho a:</p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li><strong>Acceso:</strong> Solicitar una copia de tus datos personales</li>
                <li><strong>Rectificación:</strong> Corregir información incorrecta o incompleta</li>
                <li><strong>Eliminación:</strong> Solicitar la eliminación de tu cuenta y datos (bajo ciertas condiciones)</li>
                <li><strong>Oposición:</strong> Oponerte al procesamiento de tus datos</li>
                <li><strong>Portabilidad:</strong> Recibir tus datos en un formato estructurado</li>
                <li><strong>Retirar consentimiento:</strong> Revocar tu consentimiento en cualquier momento</li>
              </ul>
              <p className="mb-2">
                Para ejercer estos derechos, contáctanos a través de <Link href="/contacto" className="text-primary hover:underline">nuestro formulario de contacto</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Retención de Datos</h2>
              <p className="mb-2">
                Conservamos tu información personal mientras tu cuenta esté activa y durante el período necesario para cumplir con nuestras obligaciones legales, resolver disputas y hacer cumplir nuestros acuerdos. Después de la eliminación de la cuenta, cierta información puede conservarse por períodos más largos según lo requiera la ley.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Cookies</h2>
              <p className="mb-2">
                Utilizamos cookies esenciales para el funcionamiento de la plataforma, incluyendo:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Cookies de sesión para mantener tu sesión activa</li>
                <li>Cookies de preferencias para recordar tu idioma seleccionado</li>
                <li>Cookies de seguridad para prevenir fraudes</li>
              </ul>
              <p className="mb-2">
                Puedes gestionar las cookies a través de la configuración de tu navegador, aunque esto puede afectar la funcionalidad de la plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Menores de Edad</h2>
              <p className="mb-2">
                Mundial Predict está dirigido a usuarios mayores de 18 años. No recopilamos intencionalmente información de menores de edad. Si descubrimos que hemos recopilado información de un menor, tomaremos medidas para eliminarla inmediatamente.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">9. Cambios a esta Política</h2>
              <p className="mb-2">
                Nos reservamos el derecho de actualizar esta Política de Privacidad en cualquier momento. Te notificaremos sobre cambios significativos mediante un aviso en la plataforma o por correo electrónico. La fecha de "Última actualización" en la parte superior de esta página indica cuándo se realizó la última modificación.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                10. Contacto
              </h2>
              <p className="mb-2">
                Si tienes preguntas, inquietudes o deseas ejercer tus derechos relacionados con esta Política de Privacidad, puedes contactarnos a través de:
              </p>
              <ul className="list-none space-y-2 mb-4">
                <li>📧 Formulario de contacto: <Link href="/contacto" className="text-primary hover:underline">/contacto</Link></li>
              </ul>
              <p className="mb-2">
                Nos comprometemos a responder a todas las solicitudes dentro de un plazo razonable.
              </p>
            </section>

            <div className="mt-8 p-4 bg-muted rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Nota:</strong> Esta Política de Privacidad se rige por las leyes de protección de datos aplicables. Al utilizar Mundial Predict, aceptas esta política y el procesamiento de tu información según se describe aquí.
              </p>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <Link href="/">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al inicio
                </Button>
              </Link>
              <Link href="/terminos">
                <Button variant="default">
                  Ver Términos y Condiciones
                  <FileText className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
