import { Router } from 'express'
import { authenticate, authorize, authorizeOwnerOrAdmin } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validate.middleware'
import {
  createUserSchema, updateUserSchema,
  freelanceProfileSchema, aliadoProfileSchema,
} from './users.schema'
import * as controller from './users.controller'

const router = Router()

router.use(authenticate)

// Admin: listado y estadísticas
router.get('/', authorize('admin'), controller.list)
router.get('/stats', authorize('admin'), controller.getStats)
router.post('/', authorize('admin'), validate(createUserSchema), controller.create)

// Perfil propio o admin
router.get('/:id', authorizeOwnerOrAdmin(), controller.getById)
router.put('/:id', authorizeOwnerOrAdmin(), validate(updateUserSchema), controller.update)
router.patch('/:id/status', authorize('admin'), controller.toggleStatus)

// Badges y parques
router.get('/:id/badges', authorizeOwnerOrAdmin(), controller.getBadges)
router.get('/:id/parks', authorizeOwnerOrAdmin(), controller.getParks)

// Perfiles especializados
router.put('/:id/freelance-profile', authorize('admin', 'freelance'), validate(freelanceProfileSchema), controller.updateFreelanceProfile)
router.put('/:id/aliado-profile', authorize('admin', 'aliado'), validate(aliadoProfileSchema), controller.upsertAliadoProfile)

export default router
