import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import { unauthorized, forbidden } from '../utils/response'
import type { UserRole } from '../types'

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return unauthorized(res)
  }
  const token = header.slice(7)
  try {
    req.user = verifyAccessToken(token)
    next()
  } catch {
    return unauthorized(res, 'Token inválido o expirado')
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return unauthorized(res)
    if (!roles.includes(req.user.role)) {
      return forbidden(res, `Requiere rol: ${roles.join(' o ')}`)
    }
    next()
  }
}

export function authorizeOwnerOrAdmin(userIdParam = 'id') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return unauthorized(res)
    const targetId = req.params[userIdParam]
    if (req.user.role === 'admin' || req.user.userId === targetId) {
      return next()
    }
    return forbidden(res)
  }
}
