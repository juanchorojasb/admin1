import crypto from 'crypto'
import { query, queryOne, withTransaction } from '../../config/db'
import { getPagination } from '../../utils/pagination'
import type { Reservation, Tour, User } from '../../types'
import type { CreateReservationDto, UpdateReservationDto, RegisterPaymentDto } from './reservas.schema'
import type { Request } from 'express'

function genReservationNumber(): string {
  const year = new Date().getFullYear().toString().slice(-2)
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase()
  return `AVN${year}-${rand}`
}

export async function listReservations(req: Request) {
  const { limit, offset, page } = getPagination(req)
  const { status, tourId, userId, freelanceId } = req.query as Record<string, string>
  const role = req.user!.role
  const currentUserId = req.user!.userId

  const conditions: string[] = []
  const params: unknown[] = []
  let i = 1

  // Filtro por rol: freelance solo ve sus propias ventas, cliente solo sus reservas
  if (role === 'freelance') {
    conditions.push(`r.freelance_id = $${i++}`)
    params.push(currentUserId)
  } else if (role === 'cliente') {
    conditions.push(`r.user_id = $${i++}`)
    params.push(currentUserId)
  } else {
    // admin puede filtrar por cualquier campo
    if (userId) { conditions.push(`r.user_id = $${i++}`); params.push(userId) }
    if (freelanceId) { conditions.push(`r.freelance_id = $${i++}`); params.push(freelanceId) }
    if (tourId) { conditions.push(`r.tour_id = $${i++}`); params.push(tourId) }
  }
  if (status) { conditions.push(`r.status = $${i++}`); params.push(status) }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const countRow = await queryOne<{ count: string }>(
    `SELECT COUNT(*) as count FROM reservations r ${where}`, params
  )
  const total = parseInt(countRow?.count ?? '0')

  const rows = await query<Reservation & { tour_name: string; tour_destination: string }>(
    `SELECT r.*,
            t.name as tour_name, t.destination as tour_destination,
            u.first_name as client_first_name, u.last_name as client_last_name,
            f.first_name as freelance_first_name, f.last_name as freelance_last_name
     FROM reservations r
     LEFT JOIN tours t ON t.id = r.tour_id
     LEFT JOIN users u ON u.id = r.user_id
     LEFT JOIN users f ON f.id = r.freelance_id
     ${where}
     ORDER BY r.created_at DESC
     LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limit, offset]
  )

  return { data: rows, total, page, limit }
}

export async function getReservationById(id: string, userId: string, role: string) {
  const row = await queryOne<Reservation & { tour_name: string }>(
    `SELECT r.*,
            t.name as tour_name, t.destination as tour_destination,
            t.base_price, t.duration_days, t.departure_cities,
            ti.transport, ti.breakfast, ti.lunch, ti.snacks,
            ti.insurance, ti.guide, ti.park_entrance, ti.souvenir, ti.accommodation,
            u.first_name as client_first_name, u.last_name as client_last_name,
            u.phone as client_phone, u.email as client_email,
            f.first_name as freelance_first_name, f.last_name as freelance_last_name
     FROM reservations r
     LEFT JOIN tours t ON t.id = r.tour_id
     LEFT JOIN tour_includes ti ON ti.tour_id = t.id
     LEFT JOIN users u ON u.id = r.user_id
     LEFT JOIN users f ON f.id = r.freelance_id
     WHERE r.id = $1`,
    [id]
  )

  if (!row) throw new Error('Reserva no encontrada')

  // Control de acceso: cliente solo ve las suyas, freelance solo las suyas
  if (role === 'cliente' && (row as unknown as { user_id: string }).user_id !== userId) {
    throw new Error('Acceso denegado')
  }
  if (role === 'freelance' && (row as unknown as { freelance_id: string }).freelance_id !== userId) {
    throw new Error('Acceso denegado')
  }

  const payments = await query(
    'SELECT * FROM payments WHERE reservation_id = $1 ORDER BY created_at ASC', [id]
  )

  return { ...row, payments }
}

export async function createReservation(dto: CreateReservationDto, userId?: string) {
  return withTransaction(async (client) => {
    // 1. Obtener tour y validar
    const { rows: [tour] } = await client.query<Tour>(
      'SELECT * FROM tours WHERE id = $1 AND is_active = true', [dto.tourId]
    )
    if (!tour) throw new Error('Tour no encontrado o inactivo')

    // 2. Validar disponibilidad si se especificó
    let pricePerPerson = tour.base_price
    if (dto.availabilityId) {
      const { rows: [avail] } = await client.query(
        'SELECT * FROM tour_availability WHERE id = $1 AND tour_id = $2 AND is_active = true FOR UPDATE',
        [dto.availabilityId, dto.tourId]
      )
      if (!avail) throw new Error('Fecha no disponible')
      const totalPersons = dto.numAdults + dto.numChildren
      if (avail.available_spots < totalPersons) {
        throw new Error(`Solo quedan ${avail.available_spots} cupos disponibles`)
      }
      if (avail.price_override) pricePerPerson = avail.price_override

      // Reducir cupos
      await client.query(
        'UPDATE tour_availability SET available_spots = available_spots - $1 WHERE id = $2',
        [totalPersons, dto.availabilityId]
      )
    }

    // 3. Calcular precio y comisión
    const priceChild = tour.price_child ?? pricePerPerson * 0.7
    const totalAmount = (dto.numAdults * pricePerPerson) + (dto.numChildren * priceChild)
    const depositAmount = Math.ceil(totalAmount * 0.30)
    const balanceAmount = totalAmount - depositAmount

    // 4. Resolver freelance por código de referido
    let freelanceId: string | null = null
    let commissionAmount = 0
    if (dto.freelanceCode) {
      const { rows: [referrer] } = await client.query<User & { commission_rate: number }>(
        `SELECT u.id, fp.commission_rate
         FROM users u
         JOIN freelance_profiles fp ON fp.user_id = u.id
         WHERE u.referral_code = $1 AND u.role = 'freelance' AND u.is_active = true`,
        [dto.freelanceCode]
      )
      if (referrer) {
        freelanceId = referrer.id
        commissionAmount = Math.round(totalAmount * (referrer.commission_rate / 100))
      }
    }

    // 5. Crear reserva
    const reservationNumber = genReservationNumber()
    const { rows: [reservation] } = await client.query<Reservation>(
      `INSERT INTO reservations (
        reservation_number, user_id, tour_id, availability_id, freelance_id,
        num_adults, num_children, departure_city, total_amount,
        deposit_amount, balance_amount, commission_amount,
        contact_name, contact_phone, contact_email, special_requests
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING *`,
      [
        reservationNumber, userId ?? null, dto.tourId, dto.availabilityId ?? null,
        freelanceId, dto.numAdults, dto.numChildren, dto.departureCity,
        totalAmount, depositAmount, balanceAmount, commissionAmount,
        dto.contactName, dto.contactPhone, dto.contactEmail,
        dto.specialRequests ?? null,
      ]
    )

    return reservation
  })
}

export async function updateReservation(id: string, dto: UpdateReservationDto) {
  const fields: string[] = []
  const params: unknown[] = []
  let i = 1

  if (dto.status !== undefined) { fields.push(`status = $${i++}`); params.push(dto.status) }
  if (dto.paymentStatus !== undefined) { fields.push(`payment_status = $${i++}`); params.push(dto.paymentStatus) }
  if (dto.internalNotes !== undefined) { fields.push(`internal_notes = $${i++}`); params.push(dto.internalNotes) }
  if (dto.freelanceId !== undefined) { fields.push(`freelance_id = $${i++}`); params.push(dto.freelanceId) }

  if (!fields.length) throw new Error('Sin campos para actualizar')
  fields.push(`updated_at = NOW()`)
  params.push(id)

  const reservation = await queryOne<Reservation>(
    `UPDATE reservations SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`, params
  )
  if (!reservation) throw new Error('Reserva no encontrada')
  return reservation
}

export async function registerPayment(reservationId: string, dto: RegisterPaymentDto) {
  return withTransaction(async (client) => {
    const { rows: [reservation] } = await client.query<Reservation>(
      'SELECT * FROM reservations WHERE id = $1 FOR UPDATE', [reservationId]
    )
    if (!reservation) throw new Error('Reserva no encontrada')

    // Insertar pago
    const { rows: [payment] } = await client.query(
      `INSERT INTO payments (reservation_id, amount, payment_method, gateway, status, receipt_url, paid_at)
       VALUES ($1, $2, $3, 'manual', 'completado', $4, $5) RETURNING *`,
      [reservationId, dto.amount, dto.paymentMethod, dto.receiptUrl ?? null, dto.paidAt ?? new Date()]
    )

    // Actualizar estado de pago en reserva
    let paymentStatus = 'parcial'
    let updateFields = 'payment_status = $1, updated_at = NOW()'
    const updateParams: unknown[] = [paymentStatus]

    if (dto.type === 'deposit') {
      updateFields += ', deposit_paid_at = NOW(), status = $2'
      updateParams.push('confirmada')
    } else if (dto.type === 'balance' || dto.type === 'full') {
      paymentStatus = 'completo'
      updateParams[0] = paymentStatus
      updateFields += ', balance_paid_at = NOW(), status = $2'
      updateParams.push('pagada')
    }

    updateParams.push(reservationId)
    await client.query(
      `UPDATE reservations SET ${updateFields} WHERE id = $${updateParams.length}`,
      updateParams
    )

    return payment
  })
}

export async function cancelReservation(id: string, userId: string, role: string) {
  return withTransaction(async (client) => {
    const { rows: [reservation] } = await client.query<Reservation>(
      'SELECT * FROM reservations WHERE id = $1', [id]
    )
    if (!reservation) throw new Error('Reserva no encontrada')

    const r = reservation as unknown as { user_id: string; status: string; availability_id: string }
    if (role === 'cliente' && r.user_id !== userId) throw new Error('Acceso denegado')
    if (['cancelada', 'completada'].includes(r.status)) {
      throw new Error('Esta reserva no puede cancelarse')
    }

    await client.query(
      `UPDATE reservations SET status = 'cancelada', updated_at = NOW() WHERE id = $1`, [id]
    )

    // Restaurar cupos si tenía disponibilidad
    if (r.availability_id) {
      const totalPersons =
        (reservation as unknown as { num_adults: number; num_children: number }).num_adults +
        (reservation as unknown as { num_children: number }).num_children
      await client.query(
        'UPDATE tour_availability SET available_spots = available_spots + $1 WHERE id = $2',
        [totalPersons, r.availability_id]
      )
    }

    return { message: 'Reserva cancelada' }
  })
}

export async function getDashboardStats(userId: string, role: string) {
  if (role === 'admin') {
    const [totals, monthly, topTours] = await Promise.all([
      queryOne<{ total: string; confirmed: string; revenue: string; clients: string }>(
        `SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status IN ('confirmada','pagada','completada')) as confirmed,
          COALESCE(SUM(total_amount) FILTER (WHERE payment_status IN ('parcial','completo')), 0) as revenue,
          COUNT(DISTINCT user_id) as clients
         FROM reservations`
      ),
      query<{ month: string; revenue: string; count: string }>(
        `SELECT to_char(date_trunc('month', created_at), 'Mon') as month,
                COALESCE(SUM(total_amount),0) as revenue,
                COUNT(*) as count
         FROM reservations
         WHERE created_at >= NOW() - INTERVAL '7 months'
         GROUP BY date_trunc('month', created_at)
         ORDER BY date_trunc('month', created_at)`
      ),
      query<{ tour_name: string; count: string; revenue: string }>(
        `SELECT t.name as tour_name, COUNT(*) as count, SUM(r.total_amount) as revenue
         FROM reservations r JOIN tours t ON t.id = r.tour_id
         WHERE r.status != 'cancelada'
         GROUP BY t.id, t.name ORDER BY count DESC LIMIT 5`
      ),
    ])
    return { totals, monthly, topTours }
  }

  if (role === 'freelance') {
    const stats = await queryOne(
      `SELECT
         COUNT(*) as total_sales,
         COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW())) as monthly_sales,
         COALESCE(SUM(commission_amount), 0) as total_commission,
         COALESCE(SUM(commission_amount) FILTER (WHERE NOT commission_paid), 0) as pending_commission,
         COALESCE(SUM(commission_amount) FILTER (WHERE commission_paid), 0) as paid_commission
       FROM reservations WHERE freelance_id = $1 AND status != 'cancelada'`,
      [userId]
    )
    return stats
  }

  // cliente
  const stats = await queryOne(
    `SELECT
       COUNT(*) as total_reservations,
       COUNT(*) FILTER (WHERE status = 'completada') as completed,
       COALESCE(SUM(total_amount), 0) as total_spent
     FROM reservations WHERE user_id = $1`,
    [userId]
  )
  return stats
}
