/**
 * Configuración de Sentry para monitoreo y errores
 * Instalar: npm install @sentry/nextjs
 * 
 * Para usar, ejecutar: npx @sentry/wizard@latest -i nextjs
 * O configurar manualmente siguiendo: https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

// Configuración básica de Sentry (descomentar cuando instales @sentry/nextjs)
/*
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
*/

/**
 * Helper para capturar errores en el logger
 * Usar en lib/utils/logger.ts cuando Sentry esté configurado
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  // Descomentar cuando Sentry esté configurado
  // Sentry.captureException(error, { extra: context });
  
  // Por ahora, solo log
  console.error('Exception:', error, context);
}

/**
 * Helper para agregar contexto de usuario
 */
export function setUser(user: { id: string; email?: string }): void {
  // Descomentar cuando Sentry esté configurado
  // Sentry.setUser(user);
}
