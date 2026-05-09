import { Router } from 'express'
import { authenticate, authorize } from '../../middleware/auth.middleware'
import * as controller from './config.controller'

const router = Router()

router.get('/site', controller.getSiteConfig)
router.put('/site', authenticate, authorize('admin'), controller.updateSiteConfig)
router.post('/upload', authenticate, authorize('admin'), controller.uploadFile)

export default router
