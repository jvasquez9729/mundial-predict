/**
 * Sistema de logging estructurado mejorado
 * - Soporte para request ID (trazabilidad)
 * - Formato JSON estructurado para producción
 * - Preparado para integración con servicios externos
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  requestId?: string
  route?: string
  error?: {
    name: string
    message: string
    stack?: string
    code?: string
  }
  context?: Record<string, unknown>
  duration?: number
}

interface LoggerOptions {
  requestId?: string
  route?: string
}

// Generar un ID único para cada request
export function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private options: LoggerOptions = {}

  // Crear un logger con contexto específico (request ID, route)
  withContext(options: LoggerOptions): Logger {
    const childLogger = new Logger()
    childLogger.options = { ...this.options, ...options }
    return childLogger
  }

  private formatLog(
    level: LogLevel,
    message: string,
    error?: Error | Record<string, unknown>,
    context?: Record<string, unknown>
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(this.options.requestId && { requestId: this.options.requestId }),
      ...(this.options.route && { route: this.options.route }),
    }

    // Manejar error si es un Error nativo o un objeto de error de Supabase
    if (error) {
      if (error instanceof Error) {
        entry.error = {
          name: error.name,
          message: error.message,
          stack: this.isDevelopment ? error.stack : undefined,
        }
      } else if (typeof error === 'object' && 'message' in error) {
        // Error de Supabase u otro formato
        entry.error = {
          name: 'SupabaseError',
          message: String(error.message),
          code: 'code' in error ? String(error.code) : undefined,
        }
      }
    }

    if (context && Object.keys(context).length > 0) {
      // Filtrar información sensible
      entry.context = this.sanitizeContext(context)
    }

    return entry
  }

  private sanitizeContext(context: Record<string, unknown>): Record<string, unknown> {
    const sensitiveKeys = ['password', 'password_hash', 'token', 'secret', 'api_key', 'apiKey']
    const sanitized: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(context)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        sanitized[key] = '[REDACTED]'
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeContext(value as Record<string, unknown>)
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }

  private log(entry: LogEntry): void {
    if (this.isDevelopment) {
      this.logDevelopment(entry)
    } else {
      this.logProduction(entry)
    }
  }

  private logDevelopment(entry: LogEntry): void {
    const emoji = {
      debug: '🔍',
      info: 'ℹ️ ',
      warn: '⚠️ ',
      error: '❌',
    }[entry.level]

    const prefix = entry.requestId ? `[${entry.requestId}]` : ''
    const route = entry.route ? `[${entry.route}]` : ''

    const logFn = entry.level === 'error' ? console.error :
                  entry.level === 'warn' ? console.warn :
                  console.log

    logFn(
      `${emoji} ${prefix}${route} ${entry.message}`,
      ...(entry.context ? [entry.context] : []),
      ...(entry.error ? [entry.error] : [])
    )
  }

  private logProduction(entry: LogEntry): void {
    // Formato JSON estructurado para servicios de logging
    // Compatible con: Vercel Logs, Axiom, Datadog, etc.
    console.log(JSON.stringify(entry))

    // TODO: Integración con servicios externos
    // Descomentar cuando se configure el servicio:
    // this.sendToExternalService(entry)
  }

  // Preparado para integración con servicios externos
  // private async sendToExternalService(entry: LogEntry): Promise<void> {
  //   if (entry.level === 'error' && process.env.SENTRY_DSN) {
  //     // Sentry.captureException(entry.error)
  //   }
  //   if (process.env.AXIOM_TOKEN) {
  //     // await axiom.ingest(process.env.AXIOM_DATASET, [entry])
  //   }
  // }

  debug(message: string, context?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      this.log(this.formatLog('debug', message, undefined, context))
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(this.formatLog('info', message, undefined, context))
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(this.formatLog('warn', message, undefined, context))
  }

  error(message: string, error?: Error | Record<string, unknown>, context?: Record<string, unknown>): void {
    this.log(this.formatLog('error', message, error, context))
  }
}

// Exportar instancia singleton
export const logger = new Logger()

// Helper para logging en API routes con contexto
export function createApiLogger(route: string, requestId?: string) {
  return logger.withContext({ route, requestId: requestId || generateRequestId() })
}

// Helper para logging de errores en API routes (retrocompatible)
export function logApiError(route: string, error: unknown, context?: Record<string, unknown>): void {
  const apiLogger = logger.withContext({ route })

  if (error instanceof Error) {
    apiLogger.error(`API Error: ${error.message}`, error, context)
  } else if (typeof error === 'object' && error !== null) {
    apiLogger.error('API Error', error as Record<string, unknown>, context)
  } else {
    apiLogger.error(`API Error: ${String(error)}`, undefined, context)
  }
}

// Helper para medir duración de operaciones
export function createTimer() {
  const start = Date.now()
  return {
    elapsed: () => Date.now() - start,
    log: (logger: Logger, message: string, context?: Record<string, unknown>) => {
      const duration = Date.now() - start
      logger.info(message, { ...context, durationMs: duration })
    }
  }
}
