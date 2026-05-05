import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { query, queryOne, withTransaction } from '../../config/db'
import { getPagination } from '../../utils/pagination'
import type { User, FreelanceProfile, AliadoProfile, UserRole } from '../../types'
import type {
  CreateUserDto, UpdateUserDto,
  FreelanceProfileDto, AliadoProfileDto,
} from './users.schema'
import type { Request } from 'express'

function sanitize(user: User) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone ?? null,
    documentId: user.document_id ?? null,
    avatarUrl: user.avatar_url ?? null,
    isActive: user.is_active,
    emailVerified: user.email_verified,
    referralCode: user.referral_code ?? null,
    referredBy: user.referred_by ?? null,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  }
}

export async function listUsers(req: Request) {
  const { limit, offset, page } = getPagination(req)
  const role = req.query.role as UserRole | undefined
  const search = req.query.search as string | undefined

  const conditions: string[] = []
  const params: unknown[] = []
  let i = 1

  if (role) { conditions.push(`role = $${i++}`); params.push(role) }
  if (search) {
    conditions.push(`(first_name ILIKE $${i} OR last_name ILIKE $${i} OR email ILIKE $${i})`)
    params.push(`%${search}%`); i++
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const countResult = await queryOne<{ count: string }>(
    `SELECT COUNT(*) as count FROM users ${where}`, params
  )
  const total = parseInt(countResult?.count ?? '0')

  const users = await query<User>(
    `SELECT * FROM users ${where} ORDER BY created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limit, offset]
  )

  return { data: users.map(sanitize), total, page, limit }
}

export async function getUserById(id: string) {
  const user = await queryOne<User>('SELECT * FROM users WHERE id = $1', [id])
  if (!user) throw new Error('Usuario no encontrado')

  const safe = sanitize(user)

  if (user.role === 'freelance') {
    const profile = await queryOne<FreelanceProfile>(
      'SELECT * FROM freelance_profiles WHERE user_id = $1', [id]
    )
    return { ...safe, freelanceProfile: profile }
  }

  if (user.role === 'aliado') {
    const profile = await queryOne<AliadoProfile>(
      'SELECT * FROM aliado_profiles WHERE user_id = $1', [id]
    )
    return { ...safe, aliadoProfile: profile }
  }

  return safe
}

export async function createUser(dto: CreateUserDto) {
  const existing = await queryOne<{ id: string }>(
    'SELECT id FROM users WHERE email = $1', [dto.email.toLowerCase()]
  )
  if (existing) throw new Error('El correo ya está registrado')

  const hash = await bcrypt.hash(dto.password, 12)
  const referralCode = crypto.randomBytes(4).toString('hex').toUpperCase()

  const user = await queryOne<User>(
    `INSERT INTO users (email, password_hash, role, first_name, last_name, phone, document_id, referral_code)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [dto.email.toLowerCase(), hash, dto.role, dto.firstName, dto.lastName,
     dto.phone ?? null, dto.documentId ?? null, referralCode]
  )
  if (!user) throw new Error('Error al crear el usuario')

  if (dto.role === 'freelance') {
    await query(
      'INSERT INTO freelance_profiles (user_id) VALUES ($1)', [user.id]
    )
  }

  return sanitize(user)
}

export async function updateUser(id: string, dto: UpdateUserDto) {
  const fields: string[] = []
  const params: unknown[] = []
  let i = 1

  if (dto.firstName !== undefined) { fields.push(`first_name = $${i++}`); params.push(dto.firstName) }
  if (dto.lastName !== undefined) { fields.push(`last_name = $${i++}`); params.push(dto.lastName) }
  if (dto.phone !== undefined) { fields.push(`phone = $${i++}`); params.push(dto.phone) }
  if (dto.documentId !== undefined) { fields.push(`document_id = $${i++}`); params.push(dto.documentId) }
  if (dto.avatarUrl !== undefined) { fields.push(`avatar_url = $${i++}`); params.push(dto.avatarUrl) }

  if (!fields.length) throw new Error('No hay campos para actualizar')

  fields.push(`updated_at = NOW()`)
  params.push(id)

  const user = await queryOne<User>(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`, params
  )
  if (!user) throw new Error('Usuario no encontrado')
  return sanitize(user)
}

export async function toggleUserStatus(id: string) {
  const user = await queryOne<User>(
    'UPDATE users SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1 RETURNING *', [id]
  )
  if (!user) throw new Error('Usuario no encontrado')
  return sanitize(user)
}

export async function updateFreelanceProfile(userId: string, dto: FreelanceProfileDto) {
  const fields: string[] = []
  const params: unknown[] = []
  let i = 1

  if (dto.commissionRate !== undefined) { fields.push(`commission_rate = $${i++}`); params.push(dto.commissionRate) }
  if (dto.bankName !== undefined) { fields.push(`bank_name = $${i++}`); params.push(dto.bankName) }
  if (dto.bankAccount !== undefined) { fields.push(`bank_account = $${i++}`); params.push(dto.bankAccount) }
  if (dto.bankAccountType !== undefined) { fields.push(`bank_account_type = $${i++}`); params.push(dto.bankAccountType) }

  if (!fields.length) throw new Error('Sin campos para actualizar')

  params.push(userId)
  const profile = await queryOne<FreelanceProfile>(
    `INSERT INTO freelance_profiles (user_id) VALUES ($${i})
     ON CONFLICT (user_id) DO UPDATE SET ${fields.join(', ')}
     RETURNING *`,
    params
  )
  return profile
}

export async function upsertAliadoProfile(userId: string, dto: AliadoProfileDto) {
  const profile = await queryOne<AliadoProfile>(
    `INSERT INTO aliado_profiles (user_id, business_name, aliado_type, description, address, city, nit)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (user_id) DO UPDATE SET
       business_name = EXCLUDED.business_name,
       aliado_type = EXCLUDED.aliado_type,
       description = EXCLUDED.description,
       address = EXCLUDED.address,
       city = EXCLUDED.city,
       nit = EXCLUDED.nit
     RETURNING *`,
    [userId, dto.businessName, dto.aliadoType, dto.description ?? null,
     dto.address ?? null, dto.city ?? null, dto.nit ?? null]
  )
  return profile
}

export async function getUserBadges(userId: string) {
  const all = await query<{
    id: string; name: string; description: string; icon: string;
    condition_type: string; condition_value: number;
    earned_at: string | null;
  }>(
    `SELECT b.id, b.name, b.description, b.icon, b.condition_type, b.condition_value,
            ub.earned_at
     FROM badges b
     LEFT JOIN user_badges ub ON ub.badge_id = b.id AND ub.user_id = $1
     ORDER BY b.name`,
    [userId]
  )
  return all.map((b) => ({
    id: b.id,
    name: b.name,
    description: b.description,
    icon: b.icon,
    earned: b.earned_at !== null,
    earnedAt: b.earned_at ?? undefined,
  }))
}

export async function getUserParks(userId: string) {
  return query<{ park_name: string; visited_at: string; tour_id: string }>(
    'SELECT park_name, visited_at, tour_id FROM user_parks_visited WHERE user_id = $1 ORDER BY visited_at DESC',
    [userId]
  )
}

export async function getStats() {
  const [total, byRole, newThisMonth] = await Promise.all([
    queryOne<{ count: string }>('SELECT COUNT(*) as count FROM users'),
    query<{ role: string; count: string }>(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    ),
    queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM users
       WHERE created_at >= date_trunc('month', NOW())`
    ),
  ])

  return {
    total: parseInt(total?.count ?? '0'),
    byRole: Object.fromEntries(byRole.map((r) => [r.role, parseInt(r.count)])),
    newThisMonth: parseInt(newThisMonth?.count ?? '0'),
  }
}
