const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #1a1a1a;
`

const buttonStyles = `
  display: inline-block;
  background-color: #dc2626;
  color: white;
  padding: 12px 24px;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
`

export function reminderEmailHtml(
  nombre: string,
  partido: string,
  horasRestantes: number
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mundialpredict.com'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="${baseStyles} background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 32px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 8px;">⚽</div>
      <h1 style="color: white; margin: 0; font-size: 24px;">¡No olvides tu predicción!</h1>
    </div>

    <!-- Content -->
    <div style="padding: 32px;">
      <p style="color: #525252; margin: 0 0 16px 0;">
        Hola <strong>${nombre}</strong>,
      </p>

      <p style="color: #525252; margin: 0 0 24px 0;">
        El partido <strong>${partido}</strong> comienza pronto y aún no has hecho tu predicción.
      </p>

      <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0;">
        <p style="margin: 0; color: #92400e; font-size: 14px;">Tiempo restante para predecir:</p>
        <p style="margin: 8px 0 0 0; color: #d97706; font-size: 32px; font-weight: bold;">
          ${horasRestantes} ${horasRestantes === 1 ? 'hora' : 'horas'}
        </p>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${appUrl}/predicciones" style="${buttonStyles}">
          Hacer mi predicción
        </a>
      </div>

      <p style="color: #737373; font-size: 14px; margin: 0; text-align: center;">
        Recuerda: las predicciones cierran 1 hora antes del partido.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f5f5f5; padding: 24px; text-align: center; border-top: 1px solid #e5e5e5;">
      <p style="color: #737373; font-size: 12px; margin: 0;">
        <a href="${appUrl}" style="color: #dc2626;">mundialpredict.com</a>
      </p>
    </div>
  </div>
</body>
</html>
`
}

export function reminderEmailText(
  nombre: string,
  partido: string,
  horasRestantes: number
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mundialpredict.com'

  return `
Hola ${nombre},

El partido ${partido} comienza pronto y aún no has hecho tu predicción.

Tiempo restante: ${horasRestantes} ${horasRestantes === 1 ? 'hora' : 'horas'}

Haz tu predicción: ${appUrl}/predicciones

Recuerda: las predicciones cierran 1 hora antes del partido.
`
}
