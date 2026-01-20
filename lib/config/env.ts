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

  // Google Sheets (opcional)
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().email().optional(),
  GOOGLE_PRIVATE_KEY: z.string().optional(),
  GOOGLE_SHEET_ID: z.string().optional(),

  // Cron Secret (opcional, solo para cron jobs)
  CRON_SECRET: z.string().optional(),

  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

type Env = z.infer<typeof envSchema>

// Validar variables de entorno
function validateEnv(): Env {
  try {
    return envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      JWT_SECRET: process.env.JWT_SECRET,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      FOOTBALL_DATA_API_KEY: process.env.FOOTBALL_DATA_API_KEY,
      THE_ODDS_API_KEY: process.env.THE_ODDS_API_KEY,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
      GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID,
      CRON_SECRET: process.env.CRON_SECRET,
      NODE_ENV: process.env.NODE_ENV,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`)
      throw new Error(
        `❌ Variables de entorno inválidas:\n${missingVars.join('\n')}\n\n` +
          'Por favor, revisa tu archivo .env.local'
      )
    }
    throw error
  }
}

// Exportar configuración validada
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
