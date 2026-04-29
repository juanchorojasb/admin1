import { Router } from 'express'
import { authenticate, authorize } from '../../middleware/auth.middleware'
import { query, queryOne } from '../../config/db'
import { ok, serverError, paginated } from '../../utils/response'
import { getPagination } from '../../utils/pagination'

const router = Router()
router.use(authenticate)

// Listado de aliados (admin)
router.get('/', authorize('admin'), async (req, res) => {
  try {
    const { limit, offset, page } = getPagination(req)
    const type = req.query.type as string | undefined

    const conditions = ['u.role = $1']
    const params: unknown[] = ['aliado']
    let i = 2

    if (type) { conditions.push(`ap.aliado_type = $${i++}`); params.push(type) }

    const countRow = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM users u
       LEFT JOIN aliado_profiles ap ON ap.user_id = u.id
       WHERE ${conditions.join(' AND ')}`, params
    )
    const total = parseInt(countRow?.count ?? '0')

    const rows = await query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.is_active,
              ap.business_name, ap.aliado_type, ap.city, ap.rating, ap.is_verified, ap.description
       FROM users u
       LEFT JOIN aliado_profiles ap ON ap.user_id = u.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY u.created_at DESC
       LIMIT $${i} OFFSET $${i + 1}`,
      [...params, limit, offset]
    )
    return paginated(res, rows, total, page, limit)
  } catch (err) {
    return serverError(res, (err as Error).message)
  }
})

// Reservas asignadas a un aliado
router.get('/my-services', authorize('aliado', 'admin'), async (req, res) => {
  try {
    const aliadoId = req.user!.role === 'aliado' ? req.user!.userId : req.query.aliadoId as string
    const { limit, offset, page } = getPagination(req)

    // Servicios del aliado son tours de transporte que incluyen su vehículo
    // En esta versión simplificada, mostramos reservas de tours donde el aliado presta servicio
    const countRow = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM reservations r
       JOIN tours t ON t.id = r.tour_id
       WHERE r.status NOT IN ('cancelada')
         AND t.departure_cities::text ILIKE $1`,
      [`%${aliadoId}%`]
    )
    const total = parseInt(countRow?.count ?? '0')

    const rows = await query(
      `SELECT r.id, r.reservation_number, r.num_adults, r.num_children,
              r.departure_city, r.contact_name, r.contact_phone, r.status,
              t.name as tour_name, t.duration_days,
              a.date as tour_date, a.departure_city as scheduled_city
       FROM reservations r
       JOIN tours t ON t.id = r.tour_id
       LEFT JOIN tour_availability a ON a.id = r.availability_id
       WHERE r.status NOT IN ('cancelada')
       ORDER BY a.date ASC NULLS LAST
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    )
    return paginated(res, rows, total, page, limit)
  } catch (err) {
    return serverError(res, (err as Error).message)
  }
})

// Estadísticas del aliado
router.get('/stats', authorize('aliado', 'admin'), async (req, res) => {
  try {
    const stats = await queryOne(
      `SELECT
         COUNT(*) FILTER (WHERE r.status = 'completada') as completed_services,
         COUNT(*) FILTER (WHERE r.status IN ('confirmada','pagada') AND a.date >= CURRENT_DATE) as upcoming_services,
         COUNT(DISTINCT r.id) as total_services
       FROM reservations r
       LEFT JOIN tour_availability a ON a.id = r.availability_id`
    )
    return ok(res, stats)
  } catch (err) {
    return serverError(res, (err as Error).message)
  }
})

// Verificar aliado (admin)
router.patch('/:id/verify', authorize('admin'), async (req, res) => {
  try {
    const row = await queryOne(
      'UPDATE aliado_profiles SET is_verified = NOT is_verified WHERE user_id = $1 RETURNING *',
      [req.params.id]
    )
    return ok(res, row, 'Estado de verificación actualizado')
  } catch (err) {
    return serverError(res, (err as Error).message)
  }
})

export default router
