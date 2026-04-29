'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatusBadge, PaymentBadge } from '@/components/ui/Badge'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { useReservas, useCancelReservation } from '@/hooks/useReservas'
import { formatCOP, formatDate } from '@/lib/utils'
import { CalendarDays, MapPin, Users, XCircle, Eye, Plus } from 'lucide-react'
import Link from 'next/link'
import type { Reservation } from '@/types'

export default function ClienteReservasPage() {
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Reservation | null>(null)
  const [cancelId, setCancelId] = useState<string | null>(null)
  const { data, isLoading } = useReservas({ page, limit: 10 })
  const cancelReservation = useCancelReservation()

  const reservas = (data?.data ?? []) as (Reservation & { tour_name?: string; tour_destination?: string })[]

  if (isLoading) return <DashboardLayout><PageLoader /></DashboardLayout>

  return (
    <DashboardLayout requiredRole="cliente">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis reservas</h1>
            <p className="text-gray-500 text-sm">{data?.total ?? 0} reservas en total</p>
          </div>
          <Link href="/reservas/nueva" className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Nueva reserva
          </Link>
        </div>

        {reservas.length === 0 ? (
          <div className="card text-center py-16">
            <CalendarDays className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Aún no tienes reservas</p>
            <p className="text-gray-400 text-sm mt-1">¡Explora nuestros tours y vive una aventura!</p>
            <Link href="/cliente/tours" className="btn-primary mt-4 inline-flex">Ver tours</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reservas.map((r) => (
              <div key={r.id} className={`card hover:shadow-card-lg transition-shadow border-l-4 ${
                r.status === 'pagada' ? 'border-brand-green' :
                r.status === 'confirmada' ? 'border-brand-blue' :
                r.status === 'cancelada' ? 'border-red-300' : 'border-yellow-300'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{r.tour_name ?? 'Tour'}</h3>
                      <StatusBadge status={r.status} />
                      <PaymentBadge status={r.paymentStatus} />
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {r.tour_destination ?? r.departureCity}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {r.numAdults} adulto{r.numAdults > 1 ? 's' : ''}
                        {r.numChildren > 0 && ` · ${r.numChildren} niño${r.numChildren > 1 ? 's' : ''}`}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {formatDate(r.createdAt)}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-gray-300 mt-1">{r.reservationNumber}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-bold text-gray-900">{formatCOP(r.totalAmount)}</p>
                    {r.paymentStatus === 'parcial' && r.balanceAmount && (
                      <p className="text-xs text-yellow-600">Saldo: {formatCOP(r.balanceAmount)}</p>
                    )}
                    <div className="flex items-center gap-1 mt-2">
                      <button onClick={() => setSelected(r)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                        <Eye className="w-4 h-4 text-gray-400" />
                      </button>
                      {!['cancelada', 'completada'].includes(r.status) && (
                        <button onClick={() => setCancelId(r.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                          <XCircle className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación simple */}
        {(data?.totalPages ?? 1) > 1 && (
          <div className="flex justify-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-ghost text-sm">← Anterior</button>
            <button disabled={page >= (data?.totalPages ?? 1)} onClick={() => setPage(p => p + 1)} className="btn-ghost text-sm">Siguiente →</button>
          </div>
        )}

        {/* Modal detalle */}
        <Modal open={!!selected} onClose={() => setSelected(null)} title={`Reserva ${selected?.reservationNumber}`} size="md">
          {selected && (
            <div className="space-y-3 text-sm">
              {[
                { l: 'Tour', v: (selected as { tour_name?: string }).tour_name ?? 'Tour' },
                { l: 'Destino', v: (selected as { tour_destination?: string }).tour_destination ?? selected.departureCity },
                { l: 'Adultos', v: selected.numAdults },
                { l: 'Niños', v: selected.numChildren },
                { l: 'Ciudad salida', v: selected.departureCity },
                { l: 'Nombre contacto', v: selected.contactName },
                { l: 'Teléfono', v: selected.contactPhone },
                { l: 'Total', v: formatCOP(selected.totalAmount) },
                { l: 'Anticipo pagado', v: selected.depositPaidAt ? `${formatCOP(selected.depositAmount ?? 0)} · ${formatDate(selected.depositPaidAt)}` : 'No pagado' },
                { l: 'Saldo restante', v: selected.balancePaidAt ? `Pagado` : formatCOP(selected.balanceAmount ?? 0) },
              ].map((item) => (
                <div key={item.l} className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-400">{item.l}</span>
                  <span className="font-medium">{String(item.v)}</span>
                </div>
              ))}
            </div>
          )}
        </Modal>

        <ConfirmModal
          open={!!cancelId}
          onClose={() => setCancelId(null)}
          onConfirm={() => cancelId && cancelReservation.mutate(cancelId)}
          title="Cancelar reserva"
          message="¿Seguro que quieres cancelar esta reserva? Consulta nuestra política de cancelación."
          confirmLabel="Cancelar reserva"
          danger
        />
      </div>
    </DashboardLayout>
  )
}
