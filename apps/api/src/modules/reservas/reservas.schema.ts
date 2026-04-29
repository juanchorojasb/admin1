import { z } from 'zod'

export const createReservationSchema = z.object({
  tourId: z.string().uuid(),
  availabilityId: z.string().uuid().optional(),
  freelanceCode: z.string().optional(),
  numAdults: z.number().int().min(1),
  numChildren: z.number().int().min(0).default(0),
  departureCity: z.string().min(2),
  contactName: z.string().min(3).max(200),
  contactPhone: z.string().regex(/^[0-9+\s-]{7,15}$/),
  contactEmail: z.string().email(),
  specialRequests: z.string().max(500).optional(),
})

export const updateReservationSchema = z.object({
  status: z.enum(['pendiente', 'confirmada', 'pagada', 'cancelada', 'completada']).optional(),
  paymentStatus: z.enum(['pendiente', 'parcial', 'completo', 'reembolsado']).optional(),
  internalNotes: z.string().max(1000).optional(),
  freelanceId: z.string().uuid().nullable().optional(),
})

export const registerPaymentSchema = z.object({
  amount: z.number().min(1),
  paymentMethod: z.enum(['efectivo', 'transferencia', 'nequi', 'daviplata', 'tarjeta', 'pse']),
  type: z.enum(['deposit', 'balance', 'full']),
  receiptUrl: z.string().url().optional(),
  paidAt: z.string().datetime().optional(),
})

export type CreateReservationDto = z.infer<typeof createReservationSchema>
export type UpdateReservationDto = z.infer<typeof updateReservationSchema>
export type RegisterPaymentDto = z.infer<typeof registerPaymentSchema>
