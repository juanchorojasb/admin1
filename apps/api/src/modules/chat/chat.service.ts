import Groq from 'groq-sdk'
import { redis } from '../../config/redis'
import { query, queryOne } from '../../config/db'
import {
  aTextoPlano,
  formatearContacto,
  formatearExperiencia,
  type ContactoConfig,
  type ExperienciaFila,
} from './chat.texto'

let _groq: Groq | null = null
function getGroq(): Groq {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  return _groq
}

// Groq retira modelos con frecuencia (llama-3.3-70b-versatile se apagó el 16/08/2026):
// el modelo se cambia en el .env con GROQ_MODEL. Ver https://console.groq.com/docs/deprecations
const MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b'
// En los modelos gpt-oss el límite incluye los tokens de razonamiento
const MAX_TOKENS = 1024
const SESSION_TTL = 60 * 60 * 2 // 2 horas
const MAX_HISTORY = 20 // máximo 10 turnos (user + assistant)

// Los tours se leen de la base de datos en cada mensaje: los precios y textos que el admin
// cambie en /admin/tours quedan disponibles para Natura sin tocar código.
async function catalogoTexto(): Promise<string> {
  try {
    const filas = await query<ExperienciaFila>(
      `SELECT name, tour_type, destination, description, base_price, price_child,
              min_persons, max_persons, difficulty, departure_cities, includes, excludes
         FROM tours
        WHERE is_active = true
        ORDER BY is_featured DESC, name
        LIMIT 30`
    )
    if (filas.length === 0) return 'Por ahora no hay tours publicados en la plataforma.'
    return filas.map((t, i) => formatearExperiencia(t, i + 1)).join('\n\n')
  } catch (err) {
    console.error('[Natura] No se pudo leer el catálogo:', err)
    return 'El catálogo no está disponible en este momento.'
  }
}

async function contactoTexto(): Promise<string> {
  const respaldo = 'Canales de contacto en avesynaturaleza.uno'
  try {
    const fila = await queryOne<{ value: ContactoConfig }>(`SELECT value FROM site_config WHERE key = 'contacto'`)
    return formatearContacto(fila?.value ?? {}) ?? respaldo
  } catch (err) {
    console.error('[Natura] No se pudo leer el contacto:', err)
    return respaldo
  }
}

async function systemPrompt(): Promise<string> {
  const [catalogo, contacto] = await Promise.all([catalogoTexto(), contactoTexto()])

  return `Eres Natura, la asistente virtual de Aves y Naturaleza, una agencia de turismo ecológico colombiana especializada en ecoturismo, avistamiento de aves y naturaleza. Eres amable, entusiasta y apasionada por la naturaleza colombiana.

TOURS DISPONIBLES:
${catalogo}

POLÍTICA DE RESERVAS:
- Reserva con el 30% de anticipo (depósito)
- Saldo restante 48 horas antes del tour
- Cancelación gratuita hasta 72 horas antes
- Entre 72 y 24 horas: retención del 50% del depósito
- Menos de 24 horas o no presentación: sin reembolso
- Para grupos de 10+ personas, contactar directamente para tarifas especiales

DISPONIBILIDAD:
- Los tours operan según disponibilidad de fechas en el sistema
- Para verificar fechas disponibles, pide al visitante que se registre o contacte a nuestro equipo
- Tours de temporada: el avistamiento de ballenas solo opera de julio a octubre

CONTACTO DEL EQUIPO:
${contacto}

INSTRUCCIONES:
- Responde SIEMPRE en español colombiano, de forma cálida y natural.
- Escribe en texto plano: sin tablas, sin negritas, sin encabezados ni otros símbolos de markdown. Para enumerar usa guiones o números.
- Si el visitante pregunta por precios, sé específico con las cifras del catálogo.
- Si un tour no muestra precio para niños, di que el equipo lo confirma.
- Si quiere reservar, indícale que debe registrarse o iniciar sesión en la plataforma.
- No inventes tours, precios ni políticas que no estén en esta información.
- Si no sabes algo, ofrece conectarlo con el equipo por los canales de contacto.
- Mantén las respuestas concisas (máximo 3-4 párrafos) a menos que sea necesario más detalle.
- Puedes usar emojis de naturaleza con moderación 🌿🦅🏔️`
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

async function getHistory(sessionId: string): Promise<ChatMessage[]> {
  const raw = await redis.get(`chat:${sessionId}`)
  if (!raw) return []
  try {
    return JSON.parse(raw) as ChatMessage[]
  } catch {
    return []
  }
}

async function saveHistory(sessionId: string, history: ChatMessage[]): Promise<void> {
  const trimmed = history.slice(-MAX_HISTORY)
  await redis.setex(`chat:${sessionId}`, SESSION_TTL, JSON.stringify(trimmed))
}

export async function sendMessage(sessionId: string, userMessage: string): Promise<string> {
  const history = await getHistory(sessionId)

  history.push({ role: 'user', content: userMessage })

  const esRazonador = MODEL.startsWith('openai/gpt-oss')

  const completion = await getGroq().chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: await systemPrompt() },
      ...history,
    ],
    temperature: 0.7,
    max_completion_tokens: MAX_TOKENS,
    // Razonamiento corto y fuera de la respuesta: el visitante solo ve el texto final
    ...(esRazonador ? { reasoning_effort: 'low' as const, include_reasoning: false } : {}),
  })

  const assistantMessage =
    aTextoPlano(completion.choices[0]?.message?.content ?? '') ||
    'Lo siento, no pude procesar tu mensaje. Intenta de nuevo.'

  history.push({ role: 'assistant', content: assistantMessage })

  await saveHistory(sessionId, history)

  return assistantMessage
}
