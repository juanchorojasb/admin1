import type { Request, Response } from 'express'
import * as authService from './auth.service'
import { ok, created, noContent, badRequest, serverError } from '../../utils/response'

export async function login(req: Request, res: Response) {
  try {
    const result = await authService.login(req.body)
    return ok(res, result, 'Sesión iniciada')
  } catch (err) {
    return badRequest(res, (err as Error).message)
  }
}

export async function register(req: Request, res: Response) {
  try {
    const result = await authService.register(req.body)
    return created(res, result, 'Cuenta creada exitosamente')
  } catch (err) {
    const msg = (err as Error).message
    if (msg.includes('ya está registrado')) {
      return badRequest(res, msg)
    }
    return serverError(res, msg)
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const result = await authService.refreshTokens(req.body.refreshToken)
    return ok(res, result)
  } catch (err) {
    return badRequest(res, (err as Error).message)
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body
    if (refreshToken && req.user) {
      await authService.logout(refreshToken, req.user.userId)
    }
    return noContent(res)
  } catch {
    return noContent(res)
  }
}

export async function logoutAll(req: Request, res: Response) {
  try {
    await authService.logoutAll(req.user!.userId)
    return noContent(res)
  } catch {
    return serverError(res)
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    await authService.changePassword(req.user!.userId, req.body)
    return ok(res, null, 'Contraseña actualizada. Inicia sesión nuevamente.')
  } catch (err) {
    return badRequest(res, (err as Error).message)
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    const user = await authService.getMe(req.user!.userId)
    return ok(res, user)
  } catch (err) {
    return serverError(res, (err as Error).message)
  }
}
