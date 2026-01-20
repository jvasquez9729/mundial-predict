import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'Mundial Predict <noreply@mundialpredict.com>'

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (error) {
    console.error('Send email error:', error)
    return { success: false, error: 'Error al enviar email' }
  }
}

export async function sendWelcomeEmail(email: string, nombre: string) {
  const { welcomeEmailHtml, welcomeEmailText } = await import('./templates/welcome')

  return sendEmail({
    to: email,
    subject: '¡Bienvenido a Mundial Predict 2026!',
    html: welcomeEmailHtml(nombre),
    text: welcomeEmailText(nombre),
  })
}

export async function sendPredictionReminderEmail(
  email: string,
  nombre: string,
  partido: string,
  horasRestantes: number
) {
  const { reminderEmailHtml, reminderEmailText } = await import('./templates/reminder')

  return sendEmail({
    to: email,
    subject: `⚽ Recuerda hacer tu predicción - ${partido}`,
    html: reminderEmailHtml(nombre, partido, horasRestantes),
    text: reminderEmailText(nombre, partido, horasRestantes),
  })
}

export async function sendResultsEmail(
  email: string,
  nombre: string,
  partido: string,
  resultado: string,
  puntos: number,
  esExacto: boolean
) {
  const { resultsEmailHtml, resultsEmailText } = await import('./templates/results')

  return sendEmail({
    to: email,
    subject: esExacto
      ? `🎯 ¡Marcador exacto! +${puntos} puntos`
      : `⚽ Resultados - ${partido}`,
    html: resultsEmailHtml(nombre, partido, resultado, puntos, esExacto),
    text: resultsEmailText(nombre, partido, resultado, puntos, esExacto),
  })
}

export async function sendPasswordResetEmail(
  email: string,
  nombre: string,
  resetUrl: string
) {
  const { passwordResetEmailHtml, passwordResetEmailText } = await import('./templates/password-reset')

  return sendEmail({
    to: email,
    subject: '🔐 Recuperar tu contraseña - Mundial Predict',
    html: passwordResetEmailHtml(nombre, resetUrl),
    text: passwordResetEmailText(nombre, resetUrl),
  })
}
