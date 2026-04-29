import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { validate } from '../../middleware/validate.middleware'
import { authenticate } from '../../middleware/auth.middleware'
import { loginSchema, registerSchema, refreshSchema, changePasswordSchema } from './auth.schema'
import * as controller from './auth.controller'

const router = Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Demasiados intentos. Espera 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Demasiados registros desde esta IP.' },
})

router.post('/login', loginLimiter, validate(loginSchema), controller.login)
router.post('/register', registerLimiter, validate(registerSchema), controller.register)
router.post('/refresh', validate(refreshSchema), controller.refresh)
router.post('/logout', authenticate, controller.logout)
router.post('/logout-all', authenticate, controller.logoutAll)
router.put('/change-password', authenticate, validate(changePasswordSchema), controller.changePassword)
router.get('/me', authenticate, controller.getMe)

export default router
