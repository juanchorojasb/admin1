import type { Request, Response } from 'express'
import * as toursService from './tours.service'
import { ok, created, badRequest, notFound, serverError, paginated } from '../../utils/response'

export async function list(req: Request, res: Response) {
  try {
    const result = await toursService.listTours(req)
    return paginated(res, result.data, result.total, result.page, result.limit)
  } catch (err) {
    return serverError(res, (err as Error).message)
  }
}

export async function getOne(req: Request, res: Response) {
  try {
    const tour = await toursService.getTourById(req.params.id)
    return ok(res, tour)
  } catch (err) {
    return notFound(res, (err as Error).message)
  }
}

export async function create(req: Request, res: Response) {
  try {
    const tour = await toursService.createTour(req.body)
    return created(res, tour, 'Tour creado')
  } catch (err) {
    return badRequest(res, (err as Error).message)
  }
}

export async function update(req: Request, res: Response) {
  try {
    const tour = await toursService.updateTour(req.params.id, req.body)
    return ok(res, tour, 'Tour actualizado')
  } catch (err) {
    return badRequest(res, (err as Error).message)
  }
}

export async function toggleActive(req: Request, res: Response) {
  try {
    const tour = await toursService.toggleTourActive(req.params.id)
    return ok(res, tour)
  } catch (err) {
    return notFound(res, (err as Error).message)
  }
}

export async function getAvailability(req: Request, res: Response) {
  try {
    const { from, to } = req.query as { from?: string; to?: string }
    const slots = await toursService.getAvailability(req.params.id, from, to)
    return ok(res, slots)
  } catch (err) {
    return serverError(res, (err as Error).message)
  }
}

export async function upsertAvailability(req: Request, res: Response) {
  try {
    const slot = await toursService.upsertAvailability(req.params.id, req.body)
    return ok(res, slot, 'Disponibilidad actualizada')
  } catch (err) {
    return badRequest(res, (err as Error).message)
  }
}

export async function bulkAvailability(req: Request, res: Response) {
  try {
    const slots = await toursService.bulkCreateAvailability(req.params.id, req.body)
    return ok(res, slots, `${slots.length} fechas creadas`)
  } catch (err) {
    return badRequest(res, (err as Error).message)
  }
}
