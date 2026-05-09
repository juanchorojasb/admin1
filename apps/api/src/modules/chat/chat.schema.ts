import { z } from 'zod'

export const messageSchema = z.object({
  message: z.string().min(1, 'El mensaje no puede estar vacío').max(1000, 'Mensaje demasiado largo'),
  sessionId: z.string().uuid('sessionId debe ser un UUID válido'),
})

export type MessageDto = z.infer<typeof messageSchema>
