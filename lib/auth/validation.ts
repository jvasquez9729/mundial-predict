import { z } from 'zod'

export const registerSchema = z.object({
  nombre_completo: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre es muy largo'),
  cedula: z
    .string()
    .min(6, 'La cédula debe tener al menos 6 caracteres')
    .max(20, 'La cédula es muy larga')
    .regex(/^[0-9]+$/, 'La cédula solo debe contener números'),
  email: z
    .string()
    .email('El correo no es válido'),
  celular: z
    .string()
    .min(10, 'El celular debe tener al menos 10 dígitos')
    .max(15, 'El celular es muy largo')
    .regex(/^[0-9]+$/, 'El celular solo debe contener números'),
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
