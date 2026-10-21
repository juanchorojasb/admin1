// Utilidades de texto de Natura: funciones puras, sin dependencias, para poder probarlas aisladas.

const SEPARADOR_TABLA = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/
const FILA_TABLA = /^\s*\|.*\|\s*$/

/**
 * El widget del chat muestra texto plano: se quitan las marcas de markdown que el modelo
 * a veces usa aunque se le pida no hacerlo (negritas, encabezados y tablas).
 * Las filas de una tabla se convierten en líneas con las celdas separadas por " · ".
 */
export function aTextoPlano(texto: string): string {
  return texto
    .split('\n')
    .filter((linea) => !SEPARADOR_TABLA.test(linea))
    .map((linea) =>
      FILA_TABLA.test(linea)
        ? linea
            .trim()
            .slice(1, -1)
            .split('|')
            .map((celda) => celda.trim())
            .filter(Boolean)
            .join(' · ')
        : linea
    )
    .join('\n')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .trim()
}

/** Un precio de niño vacío, en cero o mayor que el de adulto no se le muestra a Natura. */
export function precioNinoValido(precioAdulto: string, precioNino: string | null): boolean {
  if (precioNino === null) return false
  const adulto = Number(precioAdulto)
  const nino = Number(precioNino)
  return Number.isFinite(nino) && nino > 0 && nino <= adulto
}

export function pesos(valor: string | null): string | null {
  if (valor === null) return null
  return `$${Math.round(Number(valor)).toLocaleString('es-CO')}`
}

// ─── Catálogo ──────────────────────────────────────────────────────────────────

/** Fila de la tabla tours tal como la devuelve pg (DECIMAL llega como string, JSONB ya parseado). */
export interface ExperienciaFila {
  name: string
  tour_type: string
  destination: string
  description: string | null
  base_price: string
  price_child: string | null
  min_persons: number
  max_persons: number
  difficulty: string
  departure_cities: unknown
  includes: unknown
  excludes: unknown
}

const TIPO: Record<string, string> = {
  pasadia: 'Pasadía',
  '1n2d': '1 noche / 2 días',
  '2n3d': '2 noches / 3 días',
  multidia: 'Varios días',
}
const DIFICULTAD: Record<string, string> = { facil: 'Fácil', moderado: 'Moderada', dificil: 'Difícil' }

// Llaves del objeto includes que guarda el formulario de /admin/tours
const INCLUYE: Record<string, string> = {
  transport: 'transporte',
  breakfast: 'desayuno',
  lunch: 'almuerzo',
  snacks: 'refrigerios',
  insurance: 'seguro',
  guide: 'guía',
  parkEntrance: 'entrada al parque',
  souvenir: 'souvenir',
  accommodation: 'alojamiento',
}

const MAX_DESCRIPCION = 300 // caracteres por experiencia: el prompt viaja en cada mensaje

function listaDeTextos(valor: unknown): string[] {
  if (!Array.isArray(valor)) return []
  return valor
    .filter((v): v is string => typeof v === 'string')
    .map((v) => v.trim())
    .filter(Boolean)
}

function incluyeTexto(valor: unknown): string | null {
  if (valor === null || typeof valor !== 'object' || Array.isArray(valor)) return null
  const incluye = valor as Record<string, unknown>
  const partes = Object.entries(INCLUYE)
    .filter(([clave]) => incluye[clave] === true)
    .map(([, etiqueta]) => etiqueta)
  if (typeof incluye.activity === 'string' && incluye.activity.trim()) partes.push(incluye.activity.trim())
  const notas = typeof incluye.notes === 'string' ? incluye.notes.trim() : ''
  const texto = partes.join(', ')
  if (texto && notas) return `${texto}. Nota: ${notas}`
  return texto || notas || null
}

export function formatearExperiencia(t: ExperienciaFila, numero: number): string {
  const precioNino = precioNinoValido(t.base_price, t.price_child) ? pesos(t.price_child) : null
  const salidas = listaDeTextos(t.departure_cities)
  const incluye = incluyeTexto(t.includes)
  const noIncluye = listaDeTextos(t.excludes)

  const lineas = [
    `${numero}. ${t.name}`,
    `- Tipo: ${TIPO[t.tour_type] ?? t.tour_type} | Dificultad: ${DIFICULTAD[t.difficulty] ?? t.difficulty}`,
    `- Lugar: ${t.destination} | Grupo: ${t.min_persons} a ${t.max_persons} personas`,
    `- Precio: ${pesos(t.base_price)} por adulto${precioNino ? ` / ${precioNino} por niño` : ' (precio para niños: lo confirma el equipo)'}`,
  ]
  if (salidas.length > 0) lineas.push(`- Salida desde: ${salidas.join(', ')}`)
  if (incluye) lineas.push(`- Incluye: ${incluye}`)
  if (noIncluye.length > 0) lineas.push(`- No incluye: ${noIncluye.join(', ')}`)
  if (t.description) lineas.push(`- Descripción: ${t.description.trim().slice(0, MAX_DESCRIPCION)}`)
  return lineas.join('\n')
}

// ─── Contacto ──────────────────────────────────────────────────────────────────

/** Valor de site_config 'contacto', editable en /admin/contenido. */
export interface ContactoConfig {
  phone?: string
  email?: string
  whatsapp?: string
  instagram?: string
}

export function formatearContacto(c: ContactoConfig): string | null {
  const whatsapp = (c.whatsapp ?? '').replace(/\D/g, '')
  const partes = [
    whatsapp ? `WhatsApp: +${whatsapp}` : null,
    c.phone?.trim() ? `Teléfono: ${c.phone.trim()}` : null,
    c.email?.trim() ? `Email: ${c.email.trim()}` : null,
    c.instagram?.trim() ? `Instagram: ${c.instagram.trim()}` : null,
  ].filter((p): p is string => p !== null)
  return partes.length > 0 ? partes.join(' | ') : null
}
