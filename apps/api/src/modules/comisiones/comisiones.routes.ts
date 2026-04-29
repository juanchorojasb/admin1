import { Router } from 'express'
import { authenticate, authorize } from '../../middleware/auth.middleware'
import { query, queryOne } from '../../config/db'
import * as service from './comisiones.service'
import { ok, badRequest, serverError, paginated } from '../../utils/response'
import { z } from 'zod'

const router = Router()
router.use(authenticate)

router.get('/', authorize('admin', 'freelance'), async (req, res) => {
  try {
    const result = await service.listCommissions(req)
    return paginated(res, result.data, result.total, result.page, result.limit)
  } catch (err) {
    return serverError(res, (err as Error).message)
  }
})

router.get('/summary/:freelanceId?', authorize('admin', 'freelance'), async (req, res) => {
  try {
    const id = req.params.freelanceId ?? req.user!.userId
    const data = await service.getFreelanceSummary(id)
    return ok(res, data)
  } catch (err) {
    return serverError(res, (err as Error).message)
  }
})

router.post('/mark-paid', authorize('admin'), async (req, res) => {
  try {
    const schema = z.object({ reservationIds: z.array(z.string().uuid()).min(1) })
    const { reservationIds } = schema.parse(req.body)
    const result = await service.markAsPaid(reservationIds)
    return ok(res, result, `${result.updated} comisiones marcadas como pagadas`)
  } catch (err) {
    return badRequest(res, (err as Error).message)
  }
})

export default router
