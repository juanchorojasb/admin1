import { query, queryOne, withTransaction } from '../../config/db'
import { getPagination } from '../../utils/pagination'
import type { Request } from 'express'

export async function listCommissions(req: Request) {
  const { limit, offset, page } = getPagination(req)
  const role = req.user!.role
  const userId = req.user!.userId
  const { paid, freelanceId } = req.query as Record<string, string>

  const conditions: string[] = ["r.status != 'cancelada'", 'r.commission_amount > 0']
  const params: unknown[] = []
  let i = 1

  if (role === 'freelance') {
    conditions.push(`r.freelance_id = $${i++}`)
    params.push(userId)
  } else if (freelanceId) {
    conditions.push(`r.freelance_id = $${i++}`)
    params.push(freelanceId)
  }

  if (paid === 'true') conditions.push('r.commission_paid = true')
  if (paid === 'false') conditions.push('r.commission_paid = false')

  const where = `WHERE ${conditions.join(' AND ')}`
  const countRow = await queryOne<{ count: string }>(
    `SELECT COUNT(*) as count FROM reservations r ${where}`, params
  )
  const total = parseInt(countRow?.count ?? '0')

  const rows = await query(
    `SELECT r.id, r.reservation_number, r.commission_amount, r.commission_paid,
            r.total_amount, r.status, r.created_at,
            t.name as tour_name,
            u.first_name as client_first_name, u.last_name as client_last_name,
            f.first_name as freelance_first_name, f.last_name as freelance_last_name,
            fp.commission_rate
     FROM reservations r
     LEFT JOIN tours t ON t.id = r.tour_id
     LEFT JOIN users u ON u.id = r.user_id
     LEFT JOIN users f ON f.id = r.freelance_id
     LEFT JOIN freelance_profiles fp ON fp.user_id = r.freelance_id
     ${where}
     ORDER BY r.created_at DESC
     LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limit, offset]
  )

  return { data: rows, total, page, limit }
}

export async function getFreelanceSummary(freelanceId: string) {
  const [summary, monthly, recent] = await Promise.all([
    queryOne(
      `SELECT
         COALESCE(SUM(commission_amount), 0) as total_earned,
         COALESCE(SUM(commission_amount) FILTER (WHERE commission_paid = false AND status != 'cancelada'), 0) as pending,
         COALESCE(SUM(commission_amount) FILTER (WHERE commission_paid = true), 0) as paid,
         COALESCE(SUM(commission_amount) FILTER (WHERE created_at >= date_trunc('month', NOW())), 0) as this_month,
         COUNT(*) FILTER (WHERE status != 'cancelada') as total_sales,
         COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW()) AND status != 'cancelada') as monthly_sales,
         COUNT(DISTINCT user_id) as unique_clients
       FROM reservations WHERE freelance_id = $1`,
      [freelanceId]
    ),
    query(
      `SELECT to_char(date_trunc('month', created_at), 'Mon YYYY') as month,
              COUNT(*) as sales, SUM(commission_amount) as commission
       FROM reservations
       WHERE freelance_id = $1 AND status != 'cancelada'
         AND created_at >= NOW() - INTERVAL '6 months'
       GROUP BY date_trunc('month', created_at)
       ORDER BY date_trunc('month', created_at)`,
      [freelanceId]
    ),
    query(
      `SELECT r.reservation_number, r.commission_amount, r.commission_paid,
              r.created_at, t.name as tour_name
       FROM reservations r JOIN tours t ON t.id = r.tour_id
       WHERE r.freelance_id = $1 ORDER BY r.created_at DESC LIMIT 10`,
      [freelanceId]
    ),
  ])

  return { summary, monthly, recent }
}

export async function markAsPaid(reservationIds: string[]) {
  return withTransaction(async (client) => {
    if (!reservationIds.length) throw new Error('Sin reservas seleccionadas')

    const placeholders = reservationIds.map((_, i) => `$${i + 1}`).join(',')
    const { rows } = await client.query(
      `UPDATE reservations
       SET commission_paid = true, updated_at = NOW()
       WHERE id IN (${placeholders}) AND commission_paid = false AND commission_amount > 0
       RETURNING id, reservation_number, commission_amount, freelance_id`,
      reservationIds
    )

    // Actualizar total_paid en freelance_profiles
    const byFreelance: Record<string, number> = {}
    for (const r of rows) {
      const f = (r as { freelance_id: string; commission_amount: number })
      byFreelance[f.freelance_id] = (byFreelance[f.freelance_id] ?? 0) + f.commission_amount
    }

    for (const [fId, amount] of Object.entries(byFreelance)) {
      await client.query(
        'UPDATE freelance_profiles SET total_paid = total_paid + $1, total_earned = total_earned + $1 WHERE user_id = $2',
        [amount, fId]
      )
    }

    const totalPaid = rows.reduce(
      (s, r) => s + Number((r as { commission_amount: number }).commission_amount), 0
    )
    return { updated: rows.length, totalPaid, details: rows }
  })
}
