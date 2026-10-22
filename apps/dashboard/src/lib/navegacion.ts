// Regreso a la página de origen después de iniciar sesión o registrarse (?next=/ruta).

/**
 * Acepta solo rutas internas ("/reservas/nueva?tour=..."). Rechaza "//dominio", barras invertidas
 * y caracteres de control, que el navegador podría convertir en un salto a otro sitio.
 */
export function destinoInterno(valor: string | null | undefined): string | null {
  if (!valor || !valor.startsWith('/') || valor.startsWith('//')) return null
  if (valor.includes('\\') || /[\u0000-\u001F\u007F]/.test(valor)) return null
  return valor
}

/** Lee ?next= de la URL actual. Solo en el navegador (useEffect o manejadores de eventos). */
export function leerDestino(): string | null {
  if (typeof window === 'undefined') return null
  return destinoInterno(new URLSearchParams(window.location.search).get('next'))
}

function conDestino(ruta: string, destino: string | null | undefined): string {
  const seguro = destinoInterno(destino)
  return seguro ? `${ruta}?next=${encodeURIComponent(seguro)}` : ruta
}

export function rutaLogin(destino?: string | null): string {
  return conDestino('/auth/login', destino)
}

export function rutaRegistro(destino?: string | null): string {
  return conDestino('/auth/register', destino)
}
