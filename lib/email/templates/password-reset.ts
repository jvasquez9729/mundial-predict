/**
 * Template de email para recuperación de contraseña
 */

export function passwordResetEmailHtml(nombre: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperar Contraseña - Mundial Predict</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px; text-align: center;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🔐 Recuperar Contraseña</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hola <strong>${nombre}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Recibimos una solicitud para recuperar tu contraseña en Mundial Predict. Si fuiste tú, haz clic en el botón de abajo para crear una nueva contraseña.
              </p>
              
              <p style="margin: 0 0 30px; text-align: center;">
                <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Recuperar Contraseña</a>
              </p>
              
              <p style="margin: 0 0 20px; color: #666666; font-size: 14px; line-height: 1.6;">
                O copia y pega este enlace en tu navegador:
              </p>
              
              <p style="margin: 0 0 30px; color: #667eea; font-size: 12px; word-break: break-all; background-color: #f5f5f5; padding: 12px; border-radius: 4px;">
                ${resetUrl}
              </p>
              
              <p style="margin: 0 0 20px; color: #666666; font-size: 14px; line-height: 1.6;">
                <strong>⚠️ Importante:</strong>
              </p>
              
              <ul style="margin: 0 0 30px; padding-left: 20px; color: #666666; font-size: 14px; line-height: 1.8;">
                <li>Este enlace expirará en <strong>1 hora</strong></li>
                <li>Si no solicitaste este cambio, ignora este correo</li>
                <li>Tu contraseña actual seguirá siendo válida</li>
              </ul>
              
              <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.6; border-top: 1px solid #eeeeee; padding-top: 20px;">
                Si tienes problemas, contacta al administrador de Mundial Predict.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f5f5f5; text-align: center;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} Mundial Predict. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

export function passwordResetEmailText(nombre: string, resetUrl: string): string {
  return `
🔐 Recuperar Contraseña - Mundial Predict

Hola ${nombre},

Recibimos una solicitud para recuperar tu contraseña en Mundial Predict. Si fuiste tú, usa el enlace de abajo para crear una nueva contraseña.

Enlace de recuperación:
${resetUrl}

⚠️ Importante:
- Este enlace expirará en 1 hora
- Si no solicitaste este cambio, ignora este correo
- Tu contraseña actual seguirá siendo válida

Si tienes problemas, contacta al administrador de Mundial Predict.

© ${new Date().getFullYear()} Mundial Predict. Todos los derechos reservados.
  `
}
