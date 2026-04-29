import { z } from 'zod'

export const createTourSchema = z.object({
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/),
  name: z.string().min(3).max(200),
  internalName: z.string().optional(),
  tourType: z.enum(['pasadia', '1n2d', '2n3d', 'multidia']),
  destination: z.string().min(2).max(200),
  description: z.string().optional(),
  basePrice: z.number().min(0),
  priceChild: z.number().min(0).optional(),
  departureCities: z.array(z.string()).optional(),
  durationDays: z.number().int().min(1).default(1),
  minPersons: z.number().int().min(1).default(1),
  maxPersons: z.number().int().min(1).default(20),
  difficulty: z.enum(['facil', 'moderado', 'dificil']).default('moderado'),
  coverImage: z.string().url().optional().or(z.literal('')),
  isFeatured: z.boolean().default(false),
})

export type CreateTourDto = z.infer<typeof createTourSchema>
