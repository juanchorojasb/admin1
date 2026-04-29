import { Router } from 'express'
import { authenticate, authorize } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validate.middleware'
import {
  createReservationSchema, updateReservationSchema, registerPaymentSchema,
} from './reservas.schema'
import * as controller from './reservas.controller'

const router = Router()

router.use(authenticate)

router.get('/', controller.list)
router.get('/stats', controller.stats)
router.get('/:id', controller.getOne)

// Cualquier usuario autenticado puede crear una reserva
router.post('/', validate(createReservationSchema), controller.create)

// Admin puede actualizar estado
router.put('/:id', authorize('admin'), validate(updateReservationSchema), controller.update)

// Admin registra pagos
router.post('/:id/payments', authorize('admin'), validate(registerPaymentSchema), controller.registerPayment)

// Cliente o admin puede cancelar
router.post('/:id/cancel', authorize('admin', 'cliente'), controller.cancel)

export default router
