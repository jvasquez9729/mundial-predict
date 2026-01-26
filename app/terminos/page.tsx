import { Metadata } from 'next'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, FileText, Scale, Trophy, AlertTriangle, Users, Gavel, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Términos y Condiciones - Mundial Predict',
  description: 'Términos y condiciones de uso de Mundial Predict',
}

export default function TerminosPage() {
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
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">Términos y Condiciones</CardTitle>
            <CardDescription className="text-base">
              Última actualización: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <Scale className="h-5 w-5" />
                1. Aceptación de los Términos
              </h2>
              <p className="mb-2">
                Al acceder y utilizar Mundial Predict ("la Plataforma", "nosotros", "nuestro"), aceptas estar sujeto a estos Términos y Condiciones de Uso. Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar la Plataforma.
              </p>
              <p className="mb-2">
                Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación. Es tu responsabilidad revisar periódicamente estos términos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <Users className="h-5 w-5" />
                2. Elegibilidad y Registro
              </h2>
              <p className="mb-2">Para utilizar Mundial Predict, debes:</p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Ser mayor de 18 años o tener la mayoría de edad legal en tu jurisdicción</li>
                <li>Proporcionar información verdadera, precisa y completa durante el registro</li>
                <li>Mantener la seguridad de tu cuenta y contraseña</li>
                <li>Ser responsable de todas las actividades que ocurran bajo tu cuenta</li>
                <li>Notificarnos inmediatamente sobre cualquier uso no autorizado de tu cuenta</li>
                <li>Poseer un link de registro válido proporcionado por el administrador</li>
              </ul>
              <p className="mb-2">
                Nos reservamos el derecho de rechazar el registro o suspender/cancelar cuentas que violen estos términos o que consideremos inapropiadas.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                3. Uso de la Plataforma
              </h2>
              <p className="mb-2"><strong>Permitido:</strong></p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Hacer predicciones sobre partidos del Mundial 2026</li>
                <li>Participar en la competencia y clasificación</li>
                <li>Ver estadísticas y resultados</li>
                <li>Compartir tu progreso en redes sociales (de forma apropiada)</li>
              </ul>
              
              <p className="mb-2 mt-4"><strong>Prohibido:</strong></p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Crear múltiples cuentas para manipular la clasificación</li>
                <li>Intentar hackear, manipular o interferir con el sistema de puntuación</li>
                <li>Usar bots, scripts automatizados o herramientas para hacer predicciones</li>
                <li>Compartir tu cuenta con otras personas</li>
                <li>Intentar acceder a áreas restringidas o datos de otros usuarios</li>
                <li>Publicar contenido ofensivo, discriminatorio o ilegal</li>
                <li>Usar la plataforma para fines comerciales no autorizados</li>
                <li>Interferir con la seguridad o el funcionamiento de la plataforma</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Sistema de Puntuación y Premios</h2>
              <p className="mb-2">
                <strong>Puntuación:</strong> El sistema de puntos se calcula automáticamente según criterios predefinidos:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Los puntos se otorgan por aciertos y marcadores exactos</li>
                <li>Las puntuaciones son finales una vez que se procesan los resultados oficiales</li>
                <li>No se otorgan puntos por partidos cancelados o pospuestos indefinidamente</li>
                <li>Nos reservamos el derecho de ajustar puntuaciones en caso de errores del sistema</li>
              </ul>
              
              <p className="mb-2 mt-4">
                <strong>Premios:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Los premios se otorgan según los criterios establecidos en las reglas del torneo</li>
                <li>La distribución de premios está sujeta a la disponibilidad de fondos del pozo</li>
                <li>Los ganadores serán contactados dentro de los 7 días posteriores a la final del torneo</li>
                <li>Es responsabilidad del ganador proporcionar información de contacto válida</li>
                <li>Los premios no son transferibles ni canjeables por dinero efectivo (excepto donde se especifique)</li>
                <li>En caso de empate, el premio se dividirá equitativamente entre los ganadores</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                5. Predicciones y Plazos
              </h2>
              <p className="mb-2">
                Las predicciones deben realizarse antes del plazo límite establecido para cada partido. Una vez cerrado el plazo:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>No se pueden modificar las predicciones</li>
                <li>Las predicciones no realizadas no recibirán puntos</li>
                <li>Los plazos se basan en la hora oficial del servidor</li>
                <li>No somos responsables de problemas técnicos que impidan realizar predicciones a tiempo</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Propiedad Intelectual</h2>
              <p className="mb-2">
                Todo el contenido de Mundial Predict, incluyendo pero no limitado a diseño, logotipos, textos, gráficos, imágenes y software, es propiedad de Mundial Predict o sus licenciantes y está protegido por leyes de propiedad intelectual.
              </p>
              <p className="mb-2">
                No puedes reproducir, distribuir, modificar, crear obras derivadas, realizar ingeniería inversa o explotar comercialmente ningún contenido de la Plataforma sin nuestro permiso explícito por escrito.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Limitación de Responsabilidad</h2>
              <p className="mb-2">
                Mundial Predict se proporciona "tal cual" y "según disponibilidad". No garantizamos que:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>La plataforma estará libre de errores o interrupciones</li>
                <li>Los resultados o estadísticas sean siempre precisos o actualizados</li>
                <li>Los datos se conservarán indefinidamente</li>
                <li>La plataforma será compatible con todos los dispositivos o navegadores</li>
              </ul>
              <p className="mb-2">
                En ningún caso seremos responsables de daños indirectos, incidentales, especiales, consecuentes o punitivos, incluyendo pero no limitado a pérdida de beneficios, datos o uso, resultantes del uso o la incapacidad de usar la Plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Indemnización</h2>
              <p className="mb-2">
                Aceptas indemnizar, defender y mantener indemne a Mundial Predict, sus afiliados, directores, empleados y agentes de cualquier reclamo, daño, obligación, pérdida, responsabilidad, costo o deuda, y gastos (incluyendo honorarios de abogados) que surjan de:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Tu uso de la Plataforma</li>
                <li>Tu violación de estos Términos</li>
                <li>Tu violación de cualquier derecho de terceros</li>
                <li>Cualquier contenido que publiques o transmitas a través de la Plataforma</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">9. Terminación</h2>
              <p className="mb-2">
                Nos reservamos el derecho de suspender o terminar tu acceso a la Plataforma en cualquier momento, sin previo aviso, por cualquier motivo, incluyendo pero no limitado a:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Violación de estos Términos y Condiciones</li>
                <li>Comportamiento fraudulento o sospechoso</li>
                <li>Uso de la plataforma para actividades ilegales</li>
                <li>Solicitud de terminación por parte del usuario</li>
              </ul>
              <p className="mb-2">
                Puedes cerrar tu cuenta en cualquier momento contactándonos a través de <Link href="/contacto" className="text-primary hover:underline">nuestro formulario de contacto</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <Gavel className="h-5 w-5" />
                10. Ley Aplicable y Jurisdicción
              </h2>
              <p className="mb-2">
                Estos Términos y Condiciones se rigen por las leyes de la República de Colombia. Cualquier disputa que surja de o esté relacionada con estos términos será resuelta exclusivamente en los tribunales competentes de Colombia.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                11. Disposiciones Generales
              </h2>
              <p className="mb-2">
                Si alguna disposición de estos términos se considera inválida o inaplicable, las disposiciones restantes seguirán en pleno vigor y efecto. Nuestra falta de hacer cumplir cualquier derecho o disposición de estos términos no constituirá una renuncia a tal derecho o disposición.
              </p>
              <p className="mb-2">
                Estos términos constituyen el acuerdo completo entre tú y Mundial Predict respecto al uso de la Plataforma y reemplazan todos los acuerdos o entendimientos previos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">12. Contacto</h2>
              <p className="mb-2">
                Si tienes preguntas sobre estos Términos y Condiciones, puedes contactarnos a través de:
              </p>
              <ul className="list-none space-y-2 mb-4">
                <li>📧 Formulario de contacto: <Link href="/contacto" className="text-primary hover:underline">/contacto</Link></li>
              </ul>
            </section>

            <div className="mt-8 p-4 bg-muted rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Nota importante:</strong> Al utilizar Mundial Predict, confirmas que has leído, entendido y aceptas estos Términos y Condiciones. Si no estás de acuerdo con alguno de estos términos, debes dejar de usar la Plataforma inmediatamente.
              </p>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <Link href="/">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al inicio
                </Button>
              </Link>
              <Link href="/privacidad">
                <Button variant="default">
                  Ver Política de Privacidad
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
