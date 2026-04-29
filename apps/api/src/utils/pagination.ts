import type { Request } from 'express'

export function getPagination(req: Request) {
  const page = Math.max(1, parseInt(req.query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20))
  const offset = (page - 1) * limit
  return { page, limit, offset }
}

export function buildOrderClause(
  req: Request,
  allowed: string[],
  defaultField = 'created_at',
  defaultDir: 'ASC' | 'DESC' = 'DESC'
): string {
  const field = allowed.includes(req.query.sort as string)
    ? (req.query.sort as string)
    : defaultField
  const dir =
    (req.query.dir as string)?.toUpperCase() === 'ASC' ? 'ASC' : defaultDir
  return `ORDER BY ${field} ${dir}`
}
