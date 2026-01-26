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

export function resultsEmailHtml(
  nombre: string,
  partido: string,
  resultado: string,
  puntos: number,
  esExacto: boolean
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mundialpredict.com'

  const headerGradient = esExacto
    ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
    : puntos > 0
    ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
    : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'

  const emoji = esExacto ? '🎯' : puntos > 0 ? '✓' : '❌'
  const title = esExacto
    ? '¡Marcador Exacto!'
    : puntos > 0
    ? '¡Acertaste el resultado!'
    : 'Mejor suerte la próxima'

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
    <div style="background: ${headerGradient}; padding: 32px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 8px;">${emoji}</div>
      <h1 style="color: white; margin: 0; font-size: 24px;">${title}</h1>
    </div>

    <!-- Content -->
    <div style="padding: 32px;">
      <p style="color: #525252; margin: 0 0 16px 0;">
        Hola <strong>${nombre}</strong>,
      </p>

      <p style="color: #525252; margin: 0 0 24px 0;">
        El partido <strong>${partido}</strong> ha finalizado.
      </p>

      <div style="background-color: #f5f5f5; padding: 24px; border-radius: 12px; text-align: center; margin: 24px 0;">
        <p style="margin: 0 0 8px 0; color: #737373; font-size: 14px;">Resultado final</p>
        <p style="margin: 0; font-size: 32px; font-weight: bold; color: #1a1a1a;">${resultado}</p>
      </div>

      <div style="background-color: ${esExacto ? '#dcfce7' : puntos > 0 ? '#dbeafe' : '#f3f4f6'}; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
        <p style="margin: 0 0 8px 0; color: #525252; font-size: 14px;">Puntos obtenidos</p>
        <p style="margin: 0; font-size: 48px; font-weight: bold; color: ${esExacto ? '#16a34a' : puntos > 0 ? '#3b82f6' : '#6b7280'};">
          +${puntos}
        </p>
        ${esExacto ? '<p style="margin: 8px 0 0 0; color: #16a34a; font-weight: 600;">¡Marcador exacto! 🎉</p>' : ''}
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${appUrl}/dashboard" style="${buttonStyles}">
          Ver mi clasificación
        </a>
      </div>
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

export function resultsEmailText(
  nombre: string,
  partido: string,
  resultado: string,
  puntos: number,
  esExacto: boolean
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mundialpredict.com'

  return `
Hola ${nombre},

El partido ${partido} ha finalizado.

Resultado final: ${resultado}

Puntos obtenidos: +${puntos}${esExacto ? ' (¡Marcador exacto!)' : ''}

Ver mi clasificación: ${appUrl}/dashboard
`
}
