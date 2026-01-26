import { z } from 'zod'

// Esquema de validación para variables de entorno
const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // JWT Secret - debe estar definido en producción
  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),

  // App URL
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  // Football Data API (opcional)
  FOOTBALL_DATA_API_KEY: z.string().optional(),

  // The Odds API (opcional)
  THE_ODDS_API_KEY: z.string().optional(),

  // Resend (opcional)
  RESEND_API_KEY: z.string().optional(),

  // Google Sheets (opcional) - vacío o ausente = no usado
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : val),
    z.string().email().optional()
  ),
  GOOGLE_PRIVATE_KEY: z.string().optional(),
  GOOGLE_SHEET_ID: z.string().optional(),

  // Cron Secret (opcional, solo para cron jobs)
  CRON_SECRET: z.string().optional(),

  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

type Env = z.infer<typeof envSchema>

// Detectar si estamos en tiempo de build
// Vercel establece NEXT_PHASE durante el build
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                    (!process.env.VERCEL_ENV && !process.env.NEXT_PUBLIC_SUPABASE_URL)

// Validar variables de entorno
// Durante el build, algunas variables pueden no estar disponibles
// Usamos valores placeholder válidos para permitir el build
function validateEnv(): Env {
  // Si estamos en build time y faltan variables, usar placeholders
  const envData = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 
      (isBuildTime ? 'https://placeholder.supabase.co' : undefined),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
      (isBuildTime ? 'placeholder-anon-key-min-1-char' : undefined),
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 
      (isBuildTime ? 'placeholder-service-role-key-min-1-char' : undefined),
    JWT_SECRET: process.env.JWT_SECRET || 
      (isBuildTime ? 'build-time-placeholder-secret-minimum-32-characters-long' : undefined),
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    FOOTBALL_DATA_API_KEY: process.env.FOOTBALL_DATA_API_KEY,
    THE_ODDS_API_KEY: process.env.THE_ODDS_API_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
    GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID,
    CRON_SECRET: process.env.CRON_SECRET,
    NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
  }

  // Durante el build, usar safeParse y siempre retornar valores válidos
  if (isBuildTime) {
    const result = envSchema.safeParse(envData)
    if (result.success) {
      return result.data
    }
    // Si falla durante el build, forzar valores placeholder válidos
    return {
      NEXT_PUBLIC_SUPABASE_URL: 'https://placeholder.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'placeholder-anon-key-min-1-char',
      SUPABASE_SERVICE_ROLE_KEY: 'placeholder-service-role-key-min-1-char',
      JWT_SECRET: 'build-time-placeholder-secret-minimum-32-characters-long',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      FOOTBALL_DATA_API_KEY: undefined,
      THE_ODDS_API_KEY: undefined,
      RESEND_API_KEY: undefined,
      GOOGLE_SERVICE_ACCOUNT_EMAIL: undefined,
      GOOGLE_PRIVATE_KEY: undefined,
      GOOGLE_SHEET_ID: undefined,
      CRON_SECRET: undefined,
      NODE_ENV: 'development',
    } as Env
  }

  // En runtime, validar estrictamente
  try {
    return envSchema.parse(envData)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`)
      throw new Error(
        `❌ Variables de entorno inválidas:\n${missingVars.join('\n')}\n\n` +
          'Por favor, configura las variables de entorno en Vercel'
      )
    }
    throw error
  }
}

// Exportar configuración validada
// Esto se ejecuta al importar el módulo, pero con validación permisiva durante build
export const env = validateEnv()

// Helpers para acceso seguro
export const getJwtSecret = (): string => {
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET no está configurado. Es requerido para producción.')
  }
  return env.JWT_SECRET
}

export const isProduction = env.NODE_ENV === 'production'
export const isDevelopment = env.NODE_ENV === 'development'
