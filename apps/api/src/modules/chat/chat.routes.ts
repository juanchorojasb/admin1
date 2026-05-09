import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { validate } from '../../middleware/validate.middleware'
import { messageSchema } from './chat.schema'
import * as controller from './chat.controller'

const router = Router()

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: 'Demasiados mensajes. Espera un momento.' },
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/message', chatLimiter, validate(messageSchema), controller.message)

export default router
