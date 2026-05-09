import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import path from 'path'
import fs from 'fs'

import authRoutes from './modules/auth/auth.routes'
import usersRoutes from './modules/users/users.routes'
import toursRoutes from './modules/tours/tours.routes'
import reservasRoutes from './modules/reservas/reservas.routes'
import comisionesRoutes from './modules/comisiones/comisiones.routes'
import aliadosRoutes from './modules/aliados/aliados.routes'
import paymentsRoutes from './modules/payments/payments.routes'
import chatRoutes from './modules/chat/chat.routes'
import configRoutes from './modules/config/config.routes'

import { errorHandler, notFoundHandler } from './middleware/error.middleware'
import { pool } from './config/db'

const app = express()
const PORT = parseInt(process.env.PORT ?? '4000')

// Seguridad y utilidades
app.use(helmet())
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3000'],
  credentials: true,
}))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

// Rate limit global
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
}))

// Healthcheck
app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() })
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' })
  }
})

// Archivos subidos (imágenes del sitio)
const uploadsDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
app.use('/api/uploads', express.static(uploadsDir))

// Rutas API v1
const v1 = '/api/v1'
app.use(`${v1}/auth`, authRoutes)
app.use(`${v1}/users`, usersRoutes)
app.use(`${v1}/tours`, toursRoutes)
app.use(`${v1}/reservas`, reservasRoutes)
app.use(`${v1}/comisiones`, comisionesRoutes)
app.use(`${v1}/aliados`, aliadosRoutes)
app.use(`${v1}/payments`, paymentsRoutes)
app.use(`${v1}/chat`, chatRoutes)
app.use(`${v1}/config`, configRoutes)

// Handlers de error
app.use(notFoundHandler)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🌿 API Aves y Naturaleza → http://localhost:${PORT}`)
  console.log(`📋 Health: http://localhost:${PORT}/health`)
})

export default app
