import { cn } from '@/lib/utils'
import { STATUS_COLORS, STATUS_LABELS, ROLE_COLORS, ROLE_LABELS } from '@/lib/utils'
import type { ReservationStatus, UserRole } from '@/types'

export function StatusBadge({ status }: { status: ReservationStatus }) {
  return (
    <span className={cn('badge', STATUS_COLORS[status])}>
      {STATUS_LABELS[status]}
    </span>
  )
}

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className={cn('badge', ROLE_COLORS[role])}>
      {ROLE_LABELS[role]}
    </span>
  )
}

export function PaymentBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pendiente: 'bg-gray-100 text-gray-600',
    parcial: 'bg-yellow-100 text-yellow-700',
    completo: 'bg-green-100 text-green-700',
    reembolsado: 'bg-red-100 text-red-600',
  }
  const labels: Record<string, string> = {
    pendiente: 'Sin pago', parcial: 'Anticipo', completo: 'Pagado', reembolsado: 'Reembolso',
  }
  return (
    <span className={cn('badge', map[status] ?? 'bg-gray-100 text-gray-600')}>
      {labels[status] ?? status}
    </span>
  )
}
