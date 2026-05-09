import type { Request, Response } from 'express'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import * as configService from './config.service'
import { ok, badRequest, serverError } from '../../utils/response'

export async function getSiteConfig(_req: Request, res: Response) {
  try {
    const config = await configService.getSiteConfig()
    return ok(res, config)
  } catch (err) {
    return serverError(res, (err as Error).message)
  }
}

export async function updateSiteConfig(req: Request, res: Response) {
  try {
    const { key, value } = req.body as { key: string; value: unknown }
    if (!key || value === undefined) return badRequest(res, 'key y value son requeridos')
    await configService.updateSiteConfig(key, value)
    return ok(res, { key, value }, 'Configuración actualizada')
  } catch (err) {
    return badRequest(res, (err as Error).message)
  }
}

export async function uploadFile(req: Request, res: Response) {
  try {
    const { file, filename } = req.body as { file: string; filename: string }
    if (!file || !filename) return badRequest(res, 'file (base64) y filename requeridos')

    const ext = path.extname(filename).toLowerCase()
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext))
      return badRequest(res, 'Solo se permiten jpg, png, webp')

    const uniqueName = `${crypto.randomBytes(8).toString('hex')}${ext}`
    const uploadsDir = path.join(process.cwd(), 'uploads')
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

    const base64Data = file.replace(/^data:image\/\w+;base64,/, '')
    fs.writeFileSync(path.join(uploadsDir, uniqueName), Buffer.from(base64Data, 'base64'))

    return ok(res, { url: `/api/uploads/${uniqueName}` }, 'Imagen subida')
  } catch (err) {
    return serverError(res, (err as Error).message)
  }
}
