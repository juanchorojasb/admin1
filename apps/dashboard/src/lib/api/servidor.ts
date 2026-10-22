// Consultas al API desde el servidor de Next.js (componentes de servidor y generateMetadata).
// No importar desde componentes de cliente: el navegador usa lib/api/client.ts.

import { toCamel } from './camel'
import type { Tour } from '@/types'

// En Docker el dashboard llega al API por la red interna (API_INTERNAL_URL=http://api:4000).
// Fuera de Docker se usa la URL pública.
const API_BASE = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

// Los cambios hechos en /admin/tours se ven en la página de detalle en máximo este tiempo
export const SEGUNDOS_CACHE_EXPERIENCIA = 60

/** Devuelve la experiencia por slug, o null si no existe. Lanza error si el API falla. */
export async function obtenerExperiencia(slug: string): Promise<Tour | null> {
  const res = await fetch(`${API_BASE}/api/v1/tours/${encodeURIComponent(slug)}`, {
    next: { revalidate: SEGUNDOS_CACHE_EXPERIENCIA },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`El API respondió ${res.status} al consultar la experiencia "${slug}"`)

  const cuerpo = (await res.json()) as { data?: unknown }
  return cuerpo.data ? (toCamel(cuerpo.data) as Tour) : null
}
