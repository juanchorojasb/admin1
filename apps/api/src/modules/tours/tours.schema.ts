import { z } from 'zod'

export const createTourSchema = z.object({
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  name: z.string().min(3).max(200),
  internalName: z.string().optional(),
  tourType: z.enum(['pasadia', '1n2d', '2n3d', 'multidia']),
  destination: z.string().min(2).max(200),
  description: z.string().optional(),
  itinerary: z.array(z.object({
    time: z.string(),
    activity: z.string(),
  })).optional(),
  includes: z.object({
    transport: z.boolean().default(false),
    breakfast: z.boolean().default(false),
    lunch: z.boolean().default(false),
    snacks: z.boolean().default(false),
    insurance: z.boolean().default(false),
    guide: z.boolean().default(false),
    parkEntrance: z.boolean().default(false),
    activity: z.string().optional(),
    souvenir: z.boolean().default(false),
    accommodation: z.boolean().default(false),
    notes: z.string().optional(),
  }).optional(),
  excludes: z.array(z.string()).optional(),
  recommendations: z.array(z.string()).optional(),
  restrictions: z.array(z.string()).optional(),
  whatToBring: z.array(z.string()).optional(),
  basePrice: z.number().min(0),
  priceChild: z.number().min(0).optional(),
  departureCities: z.array(z.string()).optional(),
  durationDays: z.number().int().min(1).default(1),
  minPersons: z.number().int().min(1).default(1),
  maxPersons: z.number().int().min(1).default(20),
  difficulty: z.enum(['facil', 'moderado', 'dificil']).default('moderado'),
  coverImage: z.string().url().optional(),
  gallery: z.array(z.string().url()).optional(),
  isFeatured: z.boolean().default(false),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(300).optional(),
})

export const updateTourSchema = createTourSchema.partial()

export const availabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
  departureCity: z.string().min(2),
  totalSpots: z.number().int().min(1),
  priceOverride: z.number().min(0).optional(),
  isActive: z.boolean().default(true),
})

export const bulkAvailabilitySchema = z.object({
  dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).min(1).max(60),
  departureCity: z.string().min(2),
  totalSpots: z.number().int().min(1),
  priceOverride: z.number().min(0).optional(),
})

export type CreateTourDto = z.infer<typeof createTourSchema>
export type UpdateTourDto = z.infer<typeof updateTourSchema>
export type AvailabilityDto = z.infer<typeof availabilitySchema>
export type BulkAvailabilityDto = z.infer<typeof bulkAvailabilitySchema>
