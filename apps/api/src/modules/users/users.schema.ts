import { z } from 'zod'

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  role: z.enum(['admin', 'cliente', 'freelance', 'aliado']),
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  phone: z.string().optional(),
  documentId: z.string().optional(),
})

export const updateUserSchema = z.object({
  firstName: z.string().min(2).max(100).optional(),
  lastName: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  documentId: z.string().optional(),
  avatarUrl: z.string().url().optional(),
})

export const updateUserRoleSchema = z.object({
  role: z.enum(['admin', 'cliente', 'freelance', 'aliado']),
})

export const freelanceProfileSchema = z.object({
  commissionRate: z.number().min(0).max(100).optional(),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  bankAccountType: z.enum(['ahorros', 'corriente']).optional(),
})

export const aliadoProfileSchema = z.object({
  businessName: z.string().min(2).max(200),
  aliadoType: z.enum(['ecohotel', 'transporte', 'restaurante', 'otro']),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  nit: z.string().optional(),
})

export type CreateUserDto = z.infer<typeof createUserSchema>
export type UpdateUserDto = z.infer<typeof updateUserSchema>
export type FreelanceProfileDto = z.infer<typeof freelanceProfileSchema>
export type AliadoProfileDto = z.infer<typeof aliadoProfileSchema>
