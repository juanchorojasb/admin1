// El API responde en snake_case (columnas de PostgreSQL); el dashboard trabaja en camelCase.
// Sin dependencias: lo usan el cliente axios (navegador) y las consultas desde el servidor.

function camelize(str: string): string {
  return str.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
}

export function toCamel(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(toCamel)
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [camelize(k), toCamel(v)])
    )
  }
  return value
}
