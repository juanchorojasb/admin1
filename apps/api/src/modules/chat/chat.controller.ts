import type { Request, Response } from 'express'
import * as chatService from './chat.service'
import { ok, badRequest, serverError } from '../../utils/response'

export async function message(req: Request, res: Response) {
  try {
    const { message: userMessage, sessionId } = req.body
    const reply = await chatService.sendMessage(sessionId, userMessage)
    return ok(res, { reply, sessionId })
  } catch (err) {
    const msg = (err as Error).message
    if (msg.includes('GROQ_API_KEY') || msg.includes('authentication')) {
      return serverError(res, 'Servicio de chat no disponible temporalmente')
    }
    return badRequest(res, msg)
  }
}
