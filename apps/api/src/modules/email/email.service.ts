import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT ?? '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const FROM = `"Aves y Naturaleza" <${process.env.SMTP_FROM ?? 'noreply@avesynaturaleza.travel'}>`
const BASE_URL = process.env.FRONTEND_URL ?? 'https://avesynaturaleza.travel'

function baseTemplate(content: string) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1A5FA8 0%, #4BA3D8 100%); padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px; }
    .body { padding: 32px; }
    .body h2 { color: #1A5FA8; font-size: 20px; margin-top: 0; }
    .body p { color: #444; line-height: 1.6; }
    .info-box { background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #888; font-size: 13px; }
    .info-value { color: #222; font-size: 13px; font-weight: 600; }
    .btn { display: inline-block; background: #7DC242; color: white; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 15px; margin: 20px 0; }
    .footer { background: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #eee; }
    .footer p { color: #999; font-size: 12px; margin: 4px 0; }
    .green { color: #7DC242; }
    .amount { font-size: 28px; font-weight: 800; color: #1A5FA8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌿 Aves y Naturaleza</h1>
      <p>Ecoturismo · PNN Los Nevados</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>Aves y Naturaleza · Ecoturismo Colombiano</p>
      <p>avesynaturaleza.travel · +57 300 000 0000</p>
    </div>
  </div>
</body>
</html>`
}

export interface WelcomeEmailData {
  firstName: string
  email: string
  referralCode?: string
}

export async function sendWelcomeEmail(data: WelcomeEmailData) {
  const html = baseTemplate(`
    <h2>¡Bienvenido a Aves y Naturaleza, ${data.firstName}! 🎉</h2>
    <p>Estamos emocionados de tenerte en nuestra comunidad de ecoturismo. Prepárate para vivir experiencias únicas en el Parque Nacional Natural Los Nevados y otros destinos de Colombia.</p>
    ${data.referralCode ? `
    <div class="info-box">
      <p style="margin:0 0 8px; font-weight:600; color:#1A5FA8;">Tu código de referido</p>
      <p style="font-size:28px; font-weight:800; letter-spacing:4px; color:#7DC242; margin:0;">${data.referralCode}</p>
      <p style="font-size:12px; color:#888; margin:8px 0 0;">Compártelo y gana beneficios exclusivos</p>
    </div>` : ''}
    <p>Con tu cuenta puedes:</p>
    <ul style="color:#444; line-height:2;">
      <li>Explorar nuestro catálogo de tours ecoturísticos</li>
      <li>Reservar en línea con pago seguro via Wompi</li>
      <li>Seguir el estado de tus reservas en tiempo real</li>
      <li>Desbloquear insignias y logros en cada experiencia</li>
    </ul>
    <a href="${BASE_URL}/cliente/tours" class="btn">🌄 Explorar tours</a>
  `)

  await transporter.sendMail({ from: FROM, to: data.email, subject: `¡Bienvenido a Aves y Naturaleza, ${data.firstName}!`, html })
}

export interface ReservationConfirmEmailData {
  firstName: string
  email: string
  reservationNumber: string
  tourName: string
  destination: string
  numAdults: number
  numChildren: number
  totalAmount: number
  depositAmount: number
  departureCity: string
}

export async function sendReservationConfirmEmail(data: ReservationConfirmEmailData) {
  const fmt = (n: number) => `$${n.toLocaleString('es-CO')}`
  const html = baseTemplate(`
    <h2>¡Tu reserva está confirmada! 🎊</h2>
    <p>Hola <strong>${data.firstName}</strong>, hemos recibido tu reserva exitosamente. Aquí está el resumen:</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Número de reserva</span><span class="info-value" style="font-family:monospace;">${data.reservationNumber}</span></div>
      <div class="info-row"><span class="info-label">Tour</span><span class="info-value">${data.tourName}</span></div>
      <div class="info-row"><span class="info-label">Destino</span><span class="info-value">${data.destination}</span></div>
      <div class="info-row"><span class="info-label">Ciudad de salida</span><span class="info-value">${data.departureCity}</span></div>
      <div class="info-row"><span class="info-label">Viajeros</span><span class="info-value">${data.numAdults} adulto${data.numAdults !== 1 ? 's' : ''}${data.numChildren > 0 ? ` · ${data.numChildren} niño${data.numChildren !== 1 ? 's' : ''}` : ''}</span></div>
      <div class="info-row"><span class="info-label">Total</span><span class="info-value amount">${fmt(data.totalAmount)}</span></div>
      <div class="info-row"><span class="info-label">Anticipo a pagar (30%)</span><span class="info-value green">${fmt(data.depositAmount)}</span></div>
    </div>
    <p>Para confirmar tu cupo, realiza el pago del anticipo del 30% a través de nuestro portal seguro:</p>
    <a href="${BASE_URL}/cliente/reservas" class="btn">💳 Ir a mis reservas</a>
    <p style="font-size:12px; color:#888; margin-top:20px;">¿Necesitas ayuda? Escríbenos por WhatsApp o responde este correo.</p>
  `)

  await transporter.sendMail({ from: FROM, to: data.email, subject: `Reserva confirmada · ${data.reservationNumber}`, html })
}

export interface PaymentConfirmEmailData {
  firstName: string
  email: string
  reservationNumber: string
  tourName: string
  amountPaid: number
  paymentType: 'deposito' | 'saldo_total'
  balanceRemaining?: number
}

export async function sendPaymentConfirmEmail(data: PaymentConfirmEmailData) {
  const fmt = (n: number) => `$${n.toLocaleString('es-CO')}`
  const isFullPaid = data.paymentType === 'saldo_total' || !data.balanceRemaining
  const html = baseTemplate(`
    <h2>Pago recibido <span class="green">✓</span></h2>
    <p>Hola <strong>${data.firstName}</strong>, confirmamos el recibo de tu pago.</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Reserva</span><span class="info-value" style="font-family:monospace;">${data.reservationNumber}</span></div>
      <div class="info-row"><span class="info-label">Tour</span><span class="info-value">${data.tourName}</span></div>
      <div class="info-row"><span class="info-label">Monto pagado</span><span class="info-value amount">${fmt(data.amountPaid)}</span></div>
      <div class="info-row"><span class="info-label">Tipo de pago</span><span class="info-value">${data.paymentType === 'deposito' ? 'Anticipo (30%)' : 'Pago total'}</span></div>
      ${!isFullPaid && data.balanceRemaining ? `<div class="info-row"><span class="info-label">Saldo pendiente</span><span class="info-value" style="color:#f59e0b;">${fmt(data.balanceRemaining)}</span></div>` : ''}
    </div>
    ${isFullPaid ? `<p style="color:#7DC242; font-weight:600;">🎉 ¡Tu reserva está completamente pagada! Prepárate para la aventura.</p>` : `<p>Recuerda pagar el saldo restante antes de la fecha del tour.</p>`}
    <a href="${BASE_URL}/cliente/reservas" class="btn">Ver mis reservas</a>
  `)

  await transporter.sendMail({ from: FROM, to: data.email, subject: `Pago confirmado · ${data.reservationNumber}`, html })
}

export async function sendCommissionPaidEmail(data: {
  firstName: string; email: string; amount: number; period: string
}) {
  const html = baseTemplate(`
    <h2>¡Comisión liquidada! 💰</h2>
    <p>Hola <strong>${data.firstName}</strong>, hemos procesado el pago de tu comisión:</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Período</span><span class="info-value">${data.period}</span></div>
      <div class="info-row"><span class="info-label">Monto</span><span class="info-value amount">$${data.amount.toLocaleString('es-CO')}</span></div>
    </div>
    <p>El pago será transferido a la cuenta bancaria registrada en tu perfil en los próximos 1-2 días hábiles.</p>
    <a href="${BASE_URL}/freelance/comisiones" class="btn">Ver mis comisiones</a>
  `)

  await transporter.sendMail({ from: FROM, to: data.email, subject: 'Comisión liquidada · Aves y Naturaleza', html })
}
