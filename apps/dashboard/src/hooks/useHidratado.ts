import { useSyncExternalStore } from 'react'

const sinSuscripcion = () => () => {}

/**
 * false mientras React hidrata el HTML que llegó del servidor; true en cualquier otro render
 * del navegador (también al navegar entre páginas, sin render extra).
 *
 * Durante la hidratación, el store de sesión (zustand persist) entrega su estado inicial,
 * sin sesión; la sesión guardada en localStorage llega en el render siguiente. Cualquier
 * decisión que dependa de la sesión debe esperar a que esto sea true.
 */
export function useHidratado(): boolean {
  return useSyncExternalStore(sinSuscripcion, () => true, () => false)
}
