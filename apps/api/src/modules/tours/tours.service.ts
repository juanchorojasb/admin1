import { query, queryOne, withTransaction } from '../../config/db'
import { getPagination } from '../../utils/pagination'
import type { Tour, TourAvailability } from '../../types'
import type { CreateTourDto, UpdateTourDto, AvailabilityDto, BulkAvailabilityDto } from './tours.schema'
import type { Request } from 'express'

export async function listTours(req: Request) {
  const { limit, offset, page } = getPagination(req)
  const { type, destination, featured, active = 'true' } = req.query as Record<string, string>

  const conditions: string[] = []
  const params: unknown[] = []
  let i = 1

  if (active !== 'all') {
    conditions.push(`t.is_active = $${i++}`)
    params.push(active === 'true')
  }
  if (type) { conditions.push(`t.tour_type = $${i++}`); params.push(type) }
  if (destination) { conditions.push(`t.destination ILIKE $${i++}`); params.push(`%${destination}%`) }
  if (featured === 'true') { conditions.push(`t.is_featured = true`) }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const countRow = await queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM tours t ${where}`, params)
  const total = parseInt(countRow?.count ?? '0')

  const tours = await query<Tour & { includes: object }>(
    `SELECT t.*, ti.*
     FROM tours t
     LEFT JOIN tour_includes ti ON ti.tour_id = t.id
     ${where}
     ORDER BY t.is_featured DESC, t.created_at DESC
     LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limit, offset]
  )

  return { data: tours, total, page, limit }
}

export async function getTourById(idOrSlug: string) {
  const tour = await queryOne<Tour>(
    `SELECT t.*, ti.*
     FROM tours t
     LEFT JOIN tour_includes ti ON ti.tour_id = t.id
     WHERE t.id::text = $1 OR t.slug = $1`,
    [idOrSlug]
  )
  if (!tour) throw new Error('Tour no encontrado')
  return tour
}

export async function createTour(dto: CreateTourDto) {
  return withTransaction(async (client) => {
    const existing = await client.query('SELECT id FROM tours WHERE slug = $1', [dto.slug])
    if (existing.rows.length) throw new Error('Ya existe un tour con ese slug')

    const { rows: [tour] } = await client.query<Tour>(
      `INSERT INTO tours (
        slug, name, internal_name, tour_type, destination, description,
        itinerary, excludes, recommendations, restrictions, what_to_bring,
        base_price, price_child, departure_cities, duration_days,
        min_persons, max_persons, difficulty, cover_image, gallery,
        is_featured, seo_title, seo_description
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
      RETURNING *`,
      [
        dto.slug, dto.name, dto.internalName ?? null, dto.tourType, dto.destination,
        dto.description ?? null,
        dto.itinerary ? JSON.stringify(dto.itinerary) : null,
        dto.excludes ? JSON.stringify(dto.excludes) : null,
        dto.recommendations ? JSON.stringify(dto.recommendations) : null,
        dto.restrictions ? JSON.stringify(dto.restrictions) : null,
        dto.whatToBring ? JSON.stringify(dto.whatToBring) : null,
        dto.basePrice, dto.priceChild ?? null,
        dto.departureCities ? JSON.stringify(dto.departureCities) : null,
        dto.durationDays, dto.minPersons, dto.maxPersons, dto.difficulty,
        dto.coverImage ?? null,
        dto.gallery ? JSON.stringify(dto.gallery) : null,
        dto.isFeatured ?? false,
        dto.seoTitle ?? null, dto.seoDescription ?? null,
      ]
    )

    if (dto.includes) {
      const inc = dto.includes
      await client.query(
        `INSERT INTO tour_includes (
          tour_id, transport, breakfast, lunch, snacks, insurance,
          guide, park_entrance, activity, souvenir, accommodation, notes
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          tour.id, inc.transport, inc.breakfast, inc.lunch, inc.snacks,
          inc.insurance, inc.guide, inc.parkEntrance, inc.activity ?? null,
          inc.souvenir, inc.accommodation, inc.notes ?? null,
        ]
      )
    }

    return tour
  })
}

export async function updateTour(id: string, dto: UpdateTourDto) {
  return withTransaction(async (client) => {
    const fields: string[] = []
    const params: unknown[] = []
    let i = 1

    const mappings: Record<string, unknown> = {
      slug: dto.slug, name: dto.name, internal_name: dto.internalName,
      tour_type: dto.tourType, destination: dto.destination,
      description: dto.description,
      itinerary: dto.itinerary ? JSON.stringify(dto.itinerary) : undefined,
      excludes: dto.excludes ? JSON.stringify(dto.excludes) : undefined,
      recommendations: dto.recommendations ? JSON.stringify(dto.recommendations) : undefined,
      restrictions: dto.restrictions ? JSON.stringify(dto.restrictions) : undefined,
      what_to_bring: dto.whatToBring ? JSON.stringify(dto.whatToBring) : undefined,
      base_price: dto.basePrice, price_child: dto.priceChild,
      departure_cities: dto.departureCities ? JSON.stringify(dto.departureCities) : undefined,
      duration_days: dto.durationDays, min_persons: dto.minPersons,
      max_persons: dto.maxPersons, difficulty: dto.difficulty,
      cover_image: dto.coverImage,
      gallery: dto.gallery ? JSON.stringify(dto.gallery) : undefined,
      is_featured: dto.isFeatured, seo_title: dto.seoTitle, seo_description: dto.seoDescription,
    }

    for (const [col, val] of Object.entries(mappings)) {
      if (val !== undefined) { fields.push(`${col} = $${i++}`); params.push(val) }
    }

    if (!fields.length) throw new Error('Sin campos para actualizar')
    fields.push(`updated_at = NOW()`)
    params.push(id)

    const { rows: [tour] } = await client.query<Tour>(
      `UPDATE tours SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`, params
    )
    if (!tour) throw new Error('Tour no encontrado')

    if (dto.includes) {
      const inc = dto.includes
      await client.query(
        `INSERT INTO tour_includes (tour_id, transport, breakfast, lunch, snacks, insurance,
          guide, park_entrance, activity, souvenir, accommodation, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (tour_id) DO UPDATE SET
           transport = EXCLUDED.transport, breakfast = EXCLUDED.breakfast,
           lunch = EXCLUDED.lunch, snacks = EXCLUDED.snacks,
           insurance = EXCLUDED.insurance, guide = EXCLUDED.guide,
           park_entrance = EXCLUDED.park_entrance, activity = EXCLUDED.activity,
           souvenir = EXCLUDED.souvenir, accommodation = EXCLUDED.accommodation,
           notes = EXCLUDED.notes`,
        [
          id, inc.transport, inc.breakfast, inc.lunch, inc.snacks,
          inc.insurance, inc.guide, inc.parkEntrance, inc.activity ?? null,
          inc.souvenir, inc.accommodation, inc.notes ?? null,
        ]
      )
    }

    return tour
  })
}

export async function toggleTourActive(id: string) {
  const tour = await queryOne<Tour>(
    'UPDATE tours SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1 RETURNING *', [id]
  )
  if (!tour) throw new Error('Tour no encontrado')
  return tour
}

export async function getAvailability(tourId: string, from?: string, to?: string) {
  const params: unknown[] = [tourId]
  let dateFilter = ''
  if (from) { params.push(from); dateFilter += ` AND date >= $${params.length}` }
  if (to) { params.push(to); dateFilter += ` AND date <= $${params.length}` }

  return query<TourAvailability>(
    `SELECT * FROM tour_availability
     WHERE tour_id = $1 AND is_active = true ${dateFilter}
     ORDER BY date ASC`,
    params
  )
}

export async function upsertAvailability(tourId: string, dto: AvailabilityDto) {
  return queryOne<TourAvailability>(
    `INSERT INTO tour_availability (tour_id, date, departure_city, total_spots, available_spots, price_override, is_active)
     VALUES ($1, $2, $3, $4, $4, $5, $6)
     ON CONFLICT (tour_id, date, departure_city) DO UPDATE SET
       total_spots = EXCLUDED.total_spots,
       available_spots = EXCLUDED.available_spots,
       price_override = EXCLUDED.price_override,
       is_active = EXCLUDED.is_active
     RETURNING *`,
    [tourId, dto.date, dto.departureCity, dto.totalSpots, dto.priceOverride ?? null, dto.isActive]
  )
}

export async function bulkCreateAvailability(tourId: string, dto: BulkAvailabilityDto) {
  return withTransaction(async (client) => {
    const results: TourAvailability[] = []
    for (const date of dto.dates) {
      const { rows: [row] } = await client.query<TourAvailability>(
        `INSERT INTO tour_availability (tour_id, date, departure_city, total_spots, available_spots, price_override)
         VALUES ($1, $2, $3, $4, $4, $5)
         ON CONFLICT (tour_id, date, departure_city) DO UPDATE SET
           total_spots = EXCLUDED.total_spots,
           available_spots = EXCLUDED.available_spots,
           price_override = EXCLUDED.price_override
         RETURNING *`,
        [tourId, date, dto.departureCity, dto.totalSpots, dto.priceOverride ?? null]
      )
      results.push(row)
    }
    return results
  })
}
