import { Router } from 'express'
import { authenticate, authorize } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validate.middleware'
import {
  createReservationSchema, updateReservationSchema, registerPaymentSchema,
} from './reservas.schema'
import * as controller from './reservas.controller'

const router = Router()

// Crear reserva es público — req.user es opcional (guest checkout)
router.post('/', validate(createReservationSchema), controller.create)

// Rutas autenticadas
router.get('/', authenticate, controller.list)
router.get('/stats', authenticate, controller.stats)
router.get('/:id', authenticate, controller.getOne)
router.put('/:id', authenticate, authorize('admin'), validate(updateReservationSchema), controller.update)
router.post('/:id/payments', authenticate, authorize('admin'), validate(registerPaymentSchema), controller.registerPayment)
router.post('/:id/cancel', authenticate, authorize('admin', 'cliente'), controller.cancel)

export default router
