import crypto from 'crypto'
import axios from 'axios'
import { query, queryOne, withTransaction } from '../../config/db'

const WOMPI_BASE = process.env.NODE_ENV === 'production'
  ? 'https://production.wompi.co/v1'
  : 'https://sandbox.wompi.co/v1'

const PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY!
const PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY!
const INTEGRITY_SECRET = process.env.WOMPI_INTEGRITY_SECRET!
const EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET!

// Wompi trabaja en centavos
const toCents = (cop: number) => Math.round(cop * 100)

export interface WompiTransactionInput {
  reservationId: string
  amountCOP: number
  email: string
  fullName: string
  phone: string
  reference: string
}

export async function buildCheckoutData(input: WompiTransactionInput) {
  // La firma de integridad es: SHA256(reference + amount_in_cents + currency + integrity_secret)
  const amountCents = toCents(input.amountCOP)
  const signatureString = `${input.reference}${amountCents}COP${INTEGRITY_SECRET}`
  const signature = crypto.createHash('sha256').update(signatureString).digest('hex')

  // Registrar intención de pago en nuestra DB
  await query(
    `INSERT INTO wompi_transactions
       (reservation_id, reference, amount_cents, status)
     VALUES ($1, $2, $3, 'PENDING')
     ON CONFLICT (reference) DO NOTHING`,
    [input.reservationId, input.reference, amountCents]
  )

  return {
    publicKey: PUBLIC_KEY,
    currency: 'COP',
    amountInCents: amountCents,
    reference: input.reference,
    signature,
    customerData: {
      email: input.email,
      fullName: input.fullName,
      phoneNumber: input.phone,
      phoneNumberPrefix: '+57',
    },
    redirectUrl: `${process.env.APP_URL}/reservas/confirmacion?ref=${input.reference}`,
  }
}

export async function getTransaction(transactionId: string) {
  const response = await axios.get(`${WOMPI_BASE}/transactions/${transactionId}`, {
    headers: { Authorization: `Bearer ${PRIVATE_KEY}` },
  })
  return response.data.data
}

export async function getTransactionByReference(reference: string) {
  const response = await axios.get(
    `${WOMPI_BASE}/transactions?reference=${reference}`,
    { headers: { Authorization: `Bearer ${PRIVATE_KEY}` } }
  )
  return response.data.data?.[0]
}

export function verifyWebhookSignature(
  payload: object,
  timestamp: string,
  signature: string
): boolean {
  const checksumInput = JSON.stringify(payload) + timestamp + EVENTS_SECRET
  const expected = crypto.createHash('sha256').update(checksumInput).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

export async function processWebhookEvent(event: {
  event: string
  data: { transaction: { id: string; reference: string; status: string; amount_in_cents: number } }
  timestamp: string
  signature: { checksum: string; properties: string[] }
}) {
  if (event.event !== 'transaction.updated') return

  const tx = event.data.transaction
  const { reference, status, id: wompiId } = tx

  await withTransaction(async (client) => {
    // 1. Actualizar registro de transacción Wompi
    const { rows: [wompiTx] } = await client.query(
      `UPDATE wompi_transactions
       SET status = $1, wompi_id = $2, updated_at = NOW()
       WHERE reference = $3
       RETURNING reservation_id, amount_cents`,
      [status, wompiId, reference]
    )

    if (!wompiTx) return

    const { reservation_id: reservationId, amount_cents: amountCents } = wompiTx as {
      reservation_id: string
      amount_cents: number
    }

    if (status === 'APPROVED') {
      // 2. Determinar si es anticipo o pago completo
      const { rows: [reservation] } = await client.query(
        'SELECT total_amount, deposit_amount FROM reservations WHERE id = $1',
        [reservationId]
      )

      if (!reservation) return

      const amountCOP = amountCents / 100
      const isDeposit = Math.abs(amountCOP - reservation.deposit_amount) < 10
      const isFull = Math.abs(amountCOP - reservation.total_amount) < 10

      // 3. Registrar pago
      await client.query(
        `INSERT INTO payments
           (reservation_id, amount, payment_method, gateway, gateway_transaction_id, status, paid_at)
         VALUES ($1, $2, 'tarjeta', 'wompi', $3, 'completado', NOW())`,
        [reservationId, amountCOP, wompiId]
      )

      // 4. Actualizar estado de reserva
      if (isFull) {
        await client.query(
          `UPDATE reservations SET
             payment_status = 'completo', status = 'pagada',
             balance_paid_at = NOW(), updated_at = NOW()
           WHERE id = $1`,
          [reservationId]
        )
      } else if (isDeposit) {
        await client.query(
          `UPDATE reservations SET
             payment_status = 'parcial', status = 'confirmada',
             deposit_paid_at = NOW(), updated_at = NOW()
           WHERE id = $1`,
          [reservationId]
        )
      }
    } else if (['DECLINED', 'ERROR', 'VOIDED'].includes(status)) {
      // No cambiar estado de la reserva, solo registrar el fallo
      await client.query(
        `INSERT INTO payments
           (reservation_id, amount, payment_method, gateway, gateway_transaction_id, status)
         VALUES ($1, $2, 'tarjeta', 'wompi', $3, $4)`,
        [reservationId, amountCents / 100, wompiId, status.toLowerCase()]
      )
    }
  })
}
