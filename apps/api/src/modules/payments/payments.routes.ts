import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { authenticate } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validate.middleware'
import { ok, badRequest, serverError } from '../../utils/response'
import * as wompiService from './wompi.service'
import { queryOne } from '../../config/db'
import type { Reservation } from '../../types'

const router = Router()

// ─── Wompi: generar datos de checkout ────────────────────────────────────────

const createSchema = z.object({
  reservationId: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string().min(3),
  phone: z.string().regex(/^[0-9]{10}$/),
  reference: z.string().min(5),
  amount: z.number().min(1000),
})

router.post('/wompi/create', validate(createSchema), async (req: Request, res: Response) => {
  try {
    const { reservationId, amount, email, fullName, phone, reference } = req.body

    const reservation = await queryOne<Reservation>(
      'SELECT id FROM reservations WHERE id = $1', [reservationId]
    )
    if (!reservation) return badRequest(res, 'Reserva no encontrada')

    const checkoutData = await wompiService.buildCheckoutData({
      reservationId,
      amountCOP: amount,
      email,
      fullName,
      phone,
      reference,
    })

    return ok(res, checkoutData)
  } catch (err) {
    return serverError(res, (err as Error).message)
  }
})

// ─── Wompi: consultar transacción ────────────────────────────────────────────

router.get('/wompi/transaction/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const tx = await wompiService.getTransaction(req.params.id)
    return ok(res, { status: tx.status, amount: tx.amount_in_cents / 100 })
  } catch (err) {
    return serverError(res, (err as Error).message)
  }
})

router.get('/wompi/reference/:reference', async (req: Request, res: Response) => {
  try {
    const tx = await wompiService.getTransactionByReference(req.params.reference)
    if (!tx) return badRequest(res, 'Transacción no encontrada')
    return ok(res, { status: tx.status, amount: tx.amount_in_cents / 100, id: tx.id })
  } catch (err) {
    return serverError(res, (err as Error).message)
  }
})

// ─── Wompi: webhook (sin auth, con verificación de firma) ────────────────────

router.post('/wompi/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-event-checksum'] as string
    const timestamp = req.headers['x-event-sent-at'] as string

    if (!signature || !timestamp) {
      return res.status(401).json({ message: 'Firma requerida' })
    }

    const valid = wompiService.verifyWebhookSignature(req.body, timestamp, signature)
    if (!valid) {
      return res.status(401).json({ message: 'Firma inválida' })
    }

    // Procesar de forma asíncrona — respondemos 200 inmediatamente a Wompi
    wompiService.processWebhookEvent(req.body).catch((err) =>
      console.error('[Wompi webhook error]', err)
    )

    return res.status(200).json({ received: true })
  } catch (err) {
    console.error('[Wompi webhook]', err)
    return res.status(200).json({ received: true }) // Siempre 200 a Wompi
  }
})

export default router
