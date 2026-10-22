// ─── Marca de Aves y Naturaleza ─────────────────────────────────────────────────
// Datos de marca que usan la página de detalle de tours y los metadatos para compartir.
// El contacto que se muestra en el sitio se edita en /admin/contenido → Contacto (site_config).

export const BRAND = {
  name: 'Aves y Naturaleza',
  description: 'Agencia de viajes ecológicos en Colombia',
  url: 'https://avesynaturaleza.uno',
  logo: '/logo.png',
} as const

export interface ContactoData {
  phone: string
  phoneHref: string
  email: string
  instagram: string
  whatsapp: string
}

// Mismos datos de respaldo que el footer del sitio público ((public)/layout.tsx)
export const DEFAULT_CONTACTO: ContactoData = {
  phone: '+57 320 645 1470',
  phoneHref: 'tel:+573206451470',
  email: 'turismoavesynaturaleza@gmail.com',
  instagram: '@avesynaturaleza.travel',
  whatsapp: 'https://wa.me/573206451470',
}

/** Combina el contacto guardado en site_config con los valores por defecto. */
export function contactoDesde(valor: unknown): ContactoData {
  if (valor === null || typeof valor !== 'object') return DEFAULT_CONTACTO
  return { ...DEFAULT_CONTACTO, ...(valor as Partial<ContactoData>) }
}

/** Deja solo los dígitos: acepta "+57 320 645 1470", "573206451470" o "https://wa.me/573206451470". */
export function soloDigitos(valor: string | undefined): string {
  return (valor ?? '').replace(/\D/g, '')
}

export function whatsappHref(numero: string | undefined, mensaje?: string): string | null {
  const digitos = soloDigitos(numero)
  if (!digitos) return null
  return mensaje
    ? `https://wa.me/${digitos}?text=${encodeURIComponent(mensaje)}`
    : `https://wa.me/${digitos}`
}
