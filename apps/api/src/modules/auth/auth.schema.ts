import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

export const registerSchema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe tener al menos un número'),
  firstName: z.string().min(2, 'Nombre muy corto').max(100),
  lastName: z.string().min(2, 'Apellido muy corto').max(100),
  phone: z.string().regex(/^[0-9+\s-]{7,15}$/, 'Teléfono inválido').optional(),
  referralCode: z.string().optional(),
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8)
    .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe tener al menos un número'),
})

export type LoginDto = z.infer<typeof loginSchema>
export type RegisterDto = z.infer<typeof registerSchema>
export type RefreshDto = z.infer<typeof refreshSchema>
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>
