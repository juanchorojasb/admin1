import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { query, queryOne, withTransaction } from '../../config/db'
import { signTokenPair, verifyRefreshToken } from '../../utils/jwt'
import type { User } from '../../types'
import type { LoginDto, RegisterDto, ChangePasswordDto } from './auth.schema'

function sanitizeUser(user: User) {
  const { password_hash, ...safe } = user
  void password_hash
  return safe
}

export async function login(dto: LoginDto) {
  const user = await queryOne<User>(
    'SELECT * FROM users WHERE email = $1 AND is_active = true',
    [dto.email.toLowerCase()]
  )
  if (!user) throw new Error('Credenciales incorrectas')

  const valid = await bcrypt.compare(dto.password, user.password_hash)
  if (!valid) throw new Error('Credenciales incorrectas')

  const payload = { userId: user.id, role: user.role, email: user.email }
  const tokens = signTokenPair(payload)

  const tokenHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex')
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  await query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [user.id, tokenHash, expiresAt]
  )

  return { user: sanitizeUser(user), tokens }
}

export async function register(dto: RegisterDto) {
  const existing = await queryOne<User>(
    'SELECT id FROM users WHERE email = $1',
    [dto.email.toLowerCase()]
  )
  if (existing) throw new Error('Este correo ya está registrado')

  let referredBy: string | null = null
  if (dto.referralCode) {
    const referrer = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE referral_code = $1',
      [dto.referralCode]
    )
    if (referrer) referredBy = referrer.id
  }

  const passwordHash = await bcrypt.hash(dto.password, 12)
  const referralCode = crypto.randomBytes(4).toString('hex').toUpperCase()

  const user = await queryOne<User>(
    `INSERT INTO users (email, password_hash, role, first_name, last_name, phone, referral_code, referred_by)
     VALUES ($1, $2, 'cliente', $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      dto.email.toLowerCase(),
      passwordHash,
      dto.firstName,
      dto.lastName,
      dto.phone ?? null,
      referralCode,
      referredBy,
    ]
  )

  if (!user) throw new Error('Error al crear el usuario')

  const payload = { userId: user.id, role: user.role, email: user.email }
  const tokens = signTokenPair(payload)

  // Send welcome email async — don't block registration
  import('../../modules/email/email.service').then(({ sendWelcomeEmail }) => {
    sendWelcomeEmail({ firstName: user.first_name, email: user.email, referralCode: user.referral_code ?? undefined }).catch(() => {})
  })

  return { user: sanitizeUser(user), tokens }
}

export async function refreshTokens(refreshToken: string) {
  let payload
  try {
    payload = verifyRefreshToken(refreshToken)
  } catch {
    throw new Error('Refresh token inválido')
  }

  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')

  const stored = await queryOne<{ id: string; expires_at: Date }>(
    'SELECT id, expires_at FROM refresh_tokens WHERE token_hash = $1 AND user_id = $2',
    [tokenHash, payload.userId]
  )

  if (!stored || new Date() > stored.expires_at) {
    throw new Error('Sesión expirada, inicia sesión nuevamente')
  }

  const user = await queryOne<User>(
    'SELECT * FROM users WHERE id = $1 AND is_active = true',
    [payload.userId]
  )
  if (!user) throw new Error('Usuario no encontrado')

  await query('DELETE FROM refresh_tokens WHERE id = $1', [stored.id])

  const newPayload = { userId: user.id, role: user.role, email: user.email }
  const tokens = signTokenPair(newPayload)

  const newHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex')
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  await query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [user.id, newHash, expiresAt]
  )

  return { user: sanitizeUser(user), tokens }
}

export async function logout(refreshToken: string, userId: string) {
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
  await query(
    'DELETE FROM refresh_tokens WHERE token_hash = $1 AND user_id = $2',
    [tokenHash, userId]
  )
}

export async function logoutAll(userId: string) {
  await query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId])
}

export async function changePassword(userId: string, dto: ChangePasswordDto) {
  const user = await queryOne<User>('SELECT * FROM users WHERE id = $1', [userId])
  if (!user) throw new Error('Usuario no encontrado')

  const valid = await bcrypt.compare(dto.currentPassword, user.password_hash)
  if (!valid) throw new Error('Contraseña actual incorrecta')

  const newHash = await bcrypt.hash(dto.newPassword, 12)
  await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
    newHash,
    userId,
  ])

  await logoutAll(userId)
}

export async function getMe(userId: string) {
  const user = await queryOne<User>('SELECT * FROM users WHERE id = $1', [userId])
  if (!user) throw new Error('Usuario no encontrado')
  return sanitizeUser(user)
}
