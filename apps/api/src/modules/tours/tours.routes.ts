import { Router } from 'express'
import { authenticate, authorize } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validate.middleware'
import {
  createTourSchema, updateTourSchema,
  availabilitySchema, bulkAvailabilitySchema,
} from './tours.schema'
import * as controller from './tours.controller'

const router = Router()

// Rutas públicas (sin auth - para la web pública)
router.get('/', controller.list)
router.get('/:id', controller.getOne)
router.get('/:id/availability', controller.getAvailability)

// Rutas protegidas - solo admin
router.post('/', authenticate, authorize('admin'), validate(createTourSchema), controller.create)
router.put('/:id', authenticate, authorize('admin'), validate(updateTourSchema), controller.update)
router.patch('/:id/toggle', authenticate, authorize('admin'), controller.toggleActive)
router.put('/:id/availability', authenticate, authorize('admin'), validate(availabilitySchema), controller.upsertAvailability)
router.post('/:id/availability/bulk', authenticate, authorize('admin'), validate(bulkAvailabilitySchema), controller.bulkAvailability)

export default router
