import type { Request, Response } from 'express'
import * as chatService from './chat.service'
import { ok, serverError } from '../../utils/response'

export async function message(req: Request, res: Response) {
  try {
    const { message: userMessage, sessionId } = req.body
    const reply = await chatService.sendMessage(sessionId, userMessage)
    return ok(res, { reply, sessionId })
  } catch (err) {
    // El detalle (clave, modelo, cuota de Groq, Redis) queda en el log; al visitante no se le muestra.
    // Los errores de validación del mensaje los responde antes el middleware validate().
    console.error('[Natura] Error al responder:', err)
    return serverError(res, 'Natura no está disponible en este momento. Intenta de nuevo en unos minutos.')
  }
}
