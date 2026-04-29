import type { Request, Response } from 'express'
import * as reservasService from './reservas.service'
import { ok, created, badRequest, notFound, forbidden, serverError, paginated } from '../../utils/response'

export async function list(req: Request, res: Response) {
  try {
    const result = await reservasService.listReservations(req)
    return paginated(res, result.data, result.total, result.page, result.limit)
  } catch (err) {
    return serverError(res, (err as Error).message)
  }
}

export async function getOne(req: Request, res: Response) {
  try {
    const reservation = await reservasService.getReservationById(
      req.params.id,
      req.user!.userId,
      req.user!.role
    )
    return ok(res, reservation)
  } catch (err) {
    const msg = (err as Error).message
    if (msg === 'Acceso denegado') return forbidden(res)
    return notFound(res, msg)
  }
}

export async function create(req: Request, res: Response) {
  try {
    const reservation = await reservasService.createReservation(req.body, req.user?.userId)
    return created(res, reservation, 'Reserva creada exitosamente')
  } catch (err) {
    return badRequest(res, (err as Error).message)
  }
}

export async function update(req: Request, res: Response) {
  try {
    const reservation = await reservasService.updateReservation(req.params.id, req.body)
    return ok(res, reservation, 'Reserva actualizada')
  } catch (err) {
    return badRequest(res, (err as Error).message)
  }
}

export async function registerPayment(req: Request, res: Response) {
  try {
    const payment = await reservasService.registerPayment(req.params.id, req.body)
    return ok(res, payment, 'Pago registrado')
  } catch (err) {
    return badRequest(res, (err as Error).message)
  }
}

export async function cancel(req: Request, res: Response) {
  try {
    const result = await reservasService.cancelReservation(
      req.params.id,
      req.user!.userId,
      req.user!.role
    )
    return ok(res, result)
  } catch (err) {
    const msg = (err as Error).message
    if (msg === 'Acceso denegado') return forbidden(res)
    return badRequest(res, msg)
  }
}

export async function stats(req: Request, res: Response) {
  try {
    const data = await reservasService.getDashboardStats(req.user!.userId, req.user!.role)
    return ok(res, data)
  } catch (err) {
    return serverError(res, (err as Error).message)
  }
}
