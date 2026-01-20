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

export function welcomeEmailHtml(nombre: string): string {
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
    <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">Mundial Predict 2026</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Copa del Mundo FIFA</p>
    </div>

    <!-- Content -->
    <div style="padding: 32px;">
      <h2 style="color: #1a1a1a; margin: 0 0 16px 0;">¡Bienvenido, ${nombre}!</h2>

      <p style="color: #525252; margin: 0 0 16px 0;">
        Tu cuenta ha sido creada exitosamente. Ya puedes comenzar a hacer tus predicciones
        para la Copa del Mundo 2026.
      </p>

      <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; color: #991b1b; font-weight: 600;">Recuerda:</p>
        <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #525252;">
          <li>Las predicciones cierran 1 hora antes de cada partido</li>
          <li>Marcador exacto = 3 puntos</li>
          <li>Acertar ganador/empate = 1 punto</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${appUrl}/dashboard" style="${buttonStyles}">
          Ir a mis predicciones
        </a>
      </div>

      <p style="color: #525252; margin: 0;">
        ¡Buena suerte!<br>
        <strong>El equipo de Mundial Predict</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f5f5f5; padding: 24px; text-align: center; border-top: 1px solid #e5e5e5;">
      <p style="color: #737373; font-size: 12px; margin: 0;">
        Este email fue enviado porque te registraste en Mundial Predict.<br>
        <a href="${appUrl}" style="color: #dc2626;">mundialpredict.com</a>
      </p>
    </div>
  </div>
</body>
</html>
`
}

export function welcomeEmailText(nombre: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mundialpredict.com'

  return `
¡Bienvenido a Mundial Predict 2026, ${nombre}!

Tu cuenta ha sido creada exitosamente. Ya puedes comenzar a hacer tus predicciones para la Copa del Mundo 2026.

Recuerda:
- Las predicciones cierran 1 hora antes de cada partido
- Marcador exacto = 3 puntos
- Acertar ganador/empate = 1 punto

Ir a mis predicciones: ${appUrl}/dashboard

¡Buena suerte!
El equipo de Mundial Predict
`
}
