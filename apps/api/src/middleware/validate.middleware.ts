import type { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { badRequest } from '../utils/response'

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        return badRequest(res, 'Datos inválidos', err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })))
      }
      next(err)
    }
  }
}
