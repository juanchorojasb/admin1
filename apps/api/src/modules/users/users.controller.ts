import type { Request, Response } from 'express'
import * as usersService from './users.service'
import { ok, created, noContent, badRequest, notFound, serverError, paginated } from '../../utils/response'

export async function list(req: Request, res: Response) {
  try {
    const result = await usersService.listUsers(req)
    return paginated(res, result.data, result.total, result.page, result.limit)
  } catch (err) {
    return serverError(res, (err as Error).message)
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const user = await usersService.getUserById(req.params.id)
    return ok(res, user)
  } catch (err) {
    return notFound(res, (err as Error).message)
  }
}

export async function create(req: Request, res: Response) {
  try {
    const user = await usersService.createUser(req.body)
    return created(res, user, 'Usuario creado')
  } catch (err) {
    return badRequest(res, (err as Error).message)
  }
}

export async function update(req: Request, res: Response) {
  try {
    const user = await usersService.updateUser(req.params.id, req.body)
    return ok(res, user, 'Usuario actualizado')
  } catch (err) {
    return badRequest(res, (err as Error).message)
  }
}

export async function toggleStatus(req: Request, res: Response) {
  try {
    const user = await usersService.toggleUserStatus(req.params.id)
    return ok(res, user, `Usuario ${user.isActive ? 'activado' : 'desactivado'}`)
  } catch (err) {
    return notFound(res, (err as Error).message)
  }
}

export async function updateFreelanceProfile(req: Request, res: Response) {
  try {
    const userId = req.params.id || req.user!.userId
    const profile = await usersService.updateFreelanceProfile(userId, req.body)
    return ok(res, profile, 'Perfil actualizado')
  } catch (err) {
    return badRequest(res, (err as Error).message)
  }
}

export async function upsertAliadoProfile(req: Request, res: Response) {
  try {
    const userId = req.params.id || req.user!.userId
    const profile = await usersService.upsertAliadoProfile(userId, req.body)
    return ok(res, profile, 'Perfil de aliado actualizado')
  } catch (err) {
    return badRequest(res, (err as Error).message)
  }
}

export async function getBadges(req: Request, res: Response) {
  try {
    const badges = await usersService.getUserBadges(req.params.id)
    return ok(res, badges)
  } catch (err) {
    return serverError(res, (err as Error).message)
  }
}

export async function getParks(req: Request, res: Response) {
  try {
    const parks = await usersService.getUserParks(req.params.id)
    return ok(res, parks)
  } catch (err) {
    return serverError(res, (err as Error).message)
  }
}

export async function getStats(_req: Request, res: Response) {
  try {
    const stats = await usersService.getStats()
    return ok(res, stats)
  } catch (err) {
    return serverError(res, (err as Error).message)
  }
}
