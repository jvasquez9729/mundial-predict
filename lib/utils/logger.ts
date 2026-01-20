/**
 * Sistema de logging estructurado
 * Reemplaza console.log/error para mejor manejo en producción
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  error?: Error
  context?: Record<string, unknown>
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatLog(level: LogLevel, message: string, error?: Error, context?: Record<string, unknown>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(error && { error: { message: error.message, stack: error.stack } }),
      ...(context && { context }),
    }
  }

  private log(entry: LogEntry): void {
    if (this.isDevelopment) {
      // En desarrollo, usar console con formato legible
      const emoji = {
        debug: '🔍',
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
      }[entry.level]

      const style = {
        debug: 'color: gray',
        info: 'color: blue',
        warn: 'color: orange',
        error: 'color: red',
      }[entry.level]

      console.log(
        `%c${emoji} [${entry.level.toUpperCase()}] ${entry.message}`,
        style,
        entry.context || '',
        entry.error || ''
      )
    } else {
      // En producción, usar formato JSON estructurado
      // Idealmente, aquí deberías enviar a un servicio de logging (Sentry, Datadog, etc.)
      console.log(JSON.stringify(entry))
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(this.formatLog('debug', message, undefined, context))
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(this.formatLog('info', message, undefined, context))
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(this.formatLog('warn', message, undefined, context))
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log(this.formatLog('error', message, error, context))
  }
}

// Exportar instancia singleton
export const logger = new Logger()

// Helper para logging en API routes
export function logApiError(route: string, error: unknown, context?: Record<string, unknown>): void {
  if (error instanceof Error) {
    logger.error(`API Error [${route}]: ${error.message}`, error, context)
  } else {
    logger.error(`API Error [${route}]: Unknown error`, new Error(String(error)), context)
  }
}
