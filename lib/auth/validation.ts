import { z } from 'zod'

// Lista de dominios de email válidos
const validEmailDomains = [
  'gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com',
  'protonmail.com', 'mail.com', 'aol.com', 'live.com', 'msn.com',
  'yandex.com', 'zoho.com', 'gmx.com', 'tutanota.com', 'fastmail.com',
  'mail.ru', 'qq.com', '163.com', 'sina.com', 'rediffmail.com',
  'cox.net', 'verizon.net', 'att.net', 'sbcglobal.net', 'comcast.net',
  'earthlink.net', 'juno.com', 'aim.com', 'rocketmail.com', 'ymail.com',
  'me.com', 'mac.com', 'inbox.com', 'hushmail.com', 'lavabit.com',
  'gmx.de', 'web.de', 't-online.de', 'orange.fr', 'wanadoo.fr',
  'free.fr', 'laposte.net', 'libero.it', 'virgilio.it', 'alice.it',
  'terra.com.br', 'uol.com.br', 'bol.com.br', 'ig.com.br', 'globo.com',
  'hotmail.es', 'terra.es', 'telefonica.net', 'movistar.es', 'yahoo.es',
  'gmail.co', 'outlook.co', 'hotmail.co', 'yahoo.co', 'live.co',
  'gmail.com.co', 'outlook.com.co', 'hotmail.com.co', 'yahoo.com.co',
];

// Función para validar dominio de email
const validateEmailDomain = (email: string): boolean => {
  const domain = email.toLowerCase().split('@')[1];
  if (!domain) return false;
  return validEmailDomains.some(validDomain => 
    domain === validDomain || domain.endsWith('.' + validDomain)
  );
};

export const registerSchema = z.object({
  nombre_completo: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre es muy largo'),
  cedula: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true
        return /^[0-9]{10}$/.test(val)
      },
      {
        message: 'La cédula debe tener exactamente 10 dígitos o estar vacía',
      }
    )
    .transform((val) => {
      if (!val || val.trim() === '') return null
      return val
    })
    .nullable(),
  email: z
    .string()
    .email('El correo no es válido')
    .refine((email) => validateEmailDomain(email), {
      message: 'El correo debe tener un dominio válido (gmail, outlook, hotmail, etc.)',
    }),
  celular: z
    .string()
    .min(1, 'El celular es obligatorio')
    .regex(/^\+[0-9]{1,4}[0-9]{7,14}$/, 'El celular debe incluir código de país (ej: +573001234567)'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña es muy larga'),
  confirm_password: z.string(),
  token: z.string().min(1, 'Token de registro requerido'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm_password'],
})

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Ingrese su correo, cédula o celular'),
  password: z
    .string()
    .min(1, 'Ingrese su contraseña'),
  identifier_type: z.enum(['email', 'cedula', 'celular']),
})

export const predictionSchema = z.object({
  match_id: z.string().uuid('ID de partido inválido'),
  goles_local: z
    .number()
    .int()
    .min(0, 'Los goles no pueden ser negativos')
    .max(20, 'Máximo 20 goles'),
  goles_visitante: z
    .number()
    .int()
    .min(0, 'Los goles no pueden ser negativos')
    .max(20, 'Máximo 20 goles'),
})

export const specialPredictionSchema = z.object({
  campeon_id: z.string().uuid().nullable().optional(),
  subcampeon_id: z.string().uuid().nullable().optional(),
  goleador: z.string().max(100).nullable().optional(),
  colombia_hasta: z.enum(['grupos', 'octavos', 'cuartos', 'semifinal', 'final', 'campeon']).nullable().optional(),
})

export const generateLinksSchema = z.object({
  cantidad: z
    .number()
    .int()
    .min(1, 'Mínimo 1 link')
    .max(100, 'Máximo 100 links'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type PredictionInput = z.infer<typeof predictionSchema>
export type SpecialPredictionInput = z.infer<typeof specialPredictionSchema>
export type GenerateLinksInput = z.infer<typeof generateLinksSchema>
