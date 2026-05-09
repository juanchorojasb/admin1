import { query } from '../../config/db'

export async function getSiteConfig(): Promise<Record<string, unknown>> {
  const rows = await query<{ key: string; value: unknown }>(
    'SELECT key, value FROM site_config ORDER BY key'
  )
  return Object.fromEntries(rows.map((r) => [r.key, r.value]))
}

export async function updateSiteConfig(key: string, value: unknown): Promise<void> {
  await query(
    `INSERT INTO site_config (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
    [key, JSON.stringify(value)]
  )
}
