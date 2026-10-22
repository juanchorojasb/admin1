// Utilidades de presentación de experiencias. Funciones puras: sirven en servidor y en cliente.
import type { Tour, TourIncludes } from '@/types'

export const TIPO_ETIQUETA: Record<string, string> = {
  pasadia: 'Pasadía',
  '1n2d': '1 noche / 2 días',
  '2n3d': '2 noches / 3 días',
  multidia: 'Varios días',
}

export const DIFICULTAD_ETIQUETA: Record<string, string> = {
  facil: 'Fácil',
  moderado: 'Moderada',
  dificil: 'Difícil',
}

export const DIFICULTAD_COLOR: Record<string, string> = {
  facil: 'bg-green-100 text-green-700',
  moderado: 'bg-yellow-100 text-yellow-700',
  dificil: 'bg-red-100 text-red-700',
}

/** Los DECIMAL de PostgreSQL llegan como texto ("90000.00"). */
export function aNumero(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === '') return null
  const n = Number(valor)
  return Number.isFinite(n) ? n : null
}

export function duracionTexto(tour: Pick<Tour, 'tourType' | 'durationDays'>): string {
  if (tour.tourType === '1n2d') return '2 días · 1 noche'
  if (tour.tourType === '2n3d') return '3 días · 2 noches'
  const dias = Math.max(1, aNumero(tour.durationDays) ?? 1)
  return dias === 1 ? '1 día' : `${dias} días`
}

export function grupoTexto(tour: Pick<Tour, 'minPersons' | 'maxPersons'>): string {
  const min = aNumero(tour.minPersons) ?? 1
  const max = aNumero(tour.maxPersons) ?? min
  if (min === max) return `${min} ${min === 1 ? 'persona' : 'personas'}`
  return `De ${min} a ${max} personas`
}

/**
 * Precio de niño que se muestra al público: vacío, en cero o mayor que el de adulto no se muestra
 * (misma regla que usa Natura, para que el chat y la página digan lo mismo).
 */
export function precioNinoVisible(tour: Pick<Tour, 'basePrice' | 'priceChild'>): number | null {
  const adulto = aNumero(tour.basePrice)
  const nino = aNumero(tour.priceChild)
  if (adulto === null || nino === null || nino <= 0 || nino > adulto) return null
  return nino
}

export interface PasoItinerario {
  hora: string
  actividad: string
}

/** El admin guarda el itinerario como [{ time, activity }]; se toleran textos sueltos. */
export function itinerarioDesde(valor: unknown): PasoItinerario[] {
  if (!Array.isArray(valor)) return []
  return valor
    .map((paso): PasoItinerario | null => {
      if (typeof paso === 'string') return { hora: '', actividad: paso.trim() }
      if (paso === null || typeof paso !== 'object') return null
      const p = paso as Record<string, unknown>
      return {
        hora: typeof p.time === 'string' ? p.time.trim() : '',
        actividad: typeof p.activity === 'string' ? p.activity.trim() : '',
      }
    })
    .filter((paso): paso is PasoItinerario => paso !== null && paso.actividad !== '')
}

export function listaDesde(valor: unknown): string[] {
  if (!Array.isArray(valor)) return []
  return valor
    .filter((v): v is string => typeof v === 'string')
    .map((v) => v.trim())
    .filter(Boolean)
}

type ClaveIncluye = Exclude<keyof TourIncludes, 'activity' | 'notes'>

// Etiquetas para el público; las claves son las del formulario de /admin/tours
export const INCLUYE_ETIQUETA: Record<ClaveIncluye, string> = {
  transport: 'Transporte',
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  snacks: 'Refrigerios',
  insurance: 'Seguro',
  guide: 'Guía',
  parkEntrance: 'Entrada al parque',
  souvenir: 'Souvenir',
  accommodation: 'Alojamiento',
}

export interface Incluye {
  claves: ClaveIncluye[]
  actividad: string | null
  notas: string | null
}

export function incluyeDesde(valor: unknown): Incluye {
  const vacio: Incluye = { claves: [], actividad: null, notas: null }
  if (valor === null || typeof valor !== 'object' || Array.isArray(valor)) return vacio
  const inc = valor as Record<string, unknown>
  const texto = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null)
  return {
    claves: (Object.keys(INCLUYE_ETIQUETA) as ClaveIncluye[]).filter((clave) => inc[clave] === true),
    actividad: texto(inc.activity),
    notas: texto(inc.notes),
  }
}

/**
 * Fecha de calendario ("2026-11-15" o "2026-11-15T00:00:00.000Z" como la entrega el API) sin
 * corrimiento por zona horaria: new Date("2026-11-15") en Colombia mostraría el 14.
 */
export function fechaCalendario(fecha: string, opciones?: Intl.DateTimeFormatOptions): string {
  const dia = new Date(`${fecha.slice(0, 10)}T12:00:00Z`)
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...opciones,
  }).format(dia)
}

/** Fecha de hoy en Colombia en formato YYYY-MM-DD (para pedir solo fechas futuras). */
export function hoyEnColombia(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date())
}

/** Texto corto para meta description: primer párrafo, sin cortar palabras. */
export function resumen(texto: string | undefined | null, max = 160): string {
  const plano = (texto ?? '').split(/\n\s*\n/)[0].replace(/\s+/g, ' ').trim()
  if (plano.length <= max) return plano
  const corte = plano.slice(0, max - 1)
  return `${corte.slice(0, corte.lastIndexOf(' ') > 0 ? corte.lastIndexOf(' ') : corte.length)}…`
}
