'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/Badge'
import { useReservas } from '@/hooks/useReservas'
import { formatCOP, formatDate } from '@/lib/utils'
import { Modal } from '@/components/ui/Modal'
import { CalendarDays, MapPin, Users, Phone } from 'lucide-react'
import type { Reservation } from '@/types'

type ReservaRow = Reservation & { tour_name?: string; tour_destination?: string }

export default function AliadoReservasPage() {
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<ReservaRow | null>(null)
  const { data, isLoading } = useReservas({ page, limit: 20 })
  const rows = (data?.data ?? []) as ReservaRow[]

  const columns = [
    {
      key: 'number', header: 'Reserva',
      render: (r: ReservaRow) => <span className="font-mono text-xs text-gray-400">{r.reservationNumber}</span>,
    },
    {
      key: 'tour', header: 'Tour',
      render: (r: ReservaRow) => <span className="text-sm font-medium">{r.tour_name ?? 'Tour'}</span>,
    },
    {
      key: 'destination', header: 'Destino',
      render: (r: ReservaRow) => (
        <span className="text-sm text-gray-500 flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {r.tour_destination ?? r.departureCity}
        </span>
      ),
    },
    {
      key: 'pax', header: 'Pax',
      render: (r: ReservaRow) => (
        <span className="text-sm text-gray-500 flex items-center gap-1">
          <Users className="w-3 h-3" /> {r.numAdults + r.numChildren}
        </span>
      ),
    },
    {
      key: 'total', header: 'Total',
      render: (r: ReservaRow) => <span className="font-bold text-gray-900">{formatCOP(r.totalAmount)}</span>,
    },
    {
      key: 'status', header: 'Estado',
      render: (r: ReservaRow) => <StatusBadge status={r.status} />,
    },
    {
      key: 'date', header: 'Fecha',
      render: (r: ReservaRow) => <span className="text-sm text-gray-400">{formatDate(r.createdAt)}</span>,
    },
    {
      key: 'actions', header: '',
      render: (r: ReservaRow) => (
        <button onClick={() => setSelected(r)} className="text-xs text-brand-blue hover:underline">Ver</button>
      ),
    },
  ]

  return (
    <DashboardLayout requiredRole="aliado">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservas asignadas</h1>
          <p className="text-gray-500 text-sm">{data?.total ?? 0} reservas en total</p>
        </div>

        {/* Resumen rápido */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Confirmadas', count: rows.filter(r => r.status === 'confirmada').length, color: 'text-brand-blue' },
            { label: 'Completadas', count: rows.filter(r => r.status === 'completada').length, color: 'text-green-600' },
            { label: 'Canceladas', count: rows.filter(r => r.status === 'cancelada').length, color: 'text-red-500' },
          ].map((s) => (
            <div key={s.label} className="card-sm text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="card">
          <DataTable
            columns={columns as Parameters<typeof DataTable>[0]['columns']}
            data={rows as unknown as Record<string, unknown>[]}
            total={data?.total}
            page={page}
            limit={20}
            isLoading={isLoading}
            onPageChange={setPage}
            emptyMessage="Sin reservas asignadas"
          />
        </div>

        <Modal open={!!selected} onClose={() => setSelected(null)} title={`Reserva ${selected?.reservationNumber}`} size="md">
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Tour</p>
                  <p className="font-semibold text-sm">{selected.tour_name ?? 'Tour'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Destino</p>
                  <p className="font-semibold text-sm">{selected.tour_destination ?? selected.departureCity}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4 text-brand-blue" />
                  <span>{selected.numAdults} adulto{selected.numAdults !== 1 ? 's' : ''}{selected.numChildren > 0 ? ` · ${selected.numChildren} niño${selected.numChildren !== 1 ? 's' : ''}` : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 text-brand-blue" />
                  <span>{selected.contactName} · {selected.contactPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <CalendarDays className="w-4 h-4 text-brand-blue" />
                  <span>{formatDate(selected.createdAt)}</span>
                </div>
              </div>

              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-gray-400 text-sm">Total reserva</span>
                <span className="text-xl font-bold text-gray-900">{formatCOP(selected.totalAmount)}</span>
              </div>

              <StatusBadge status={selected.status} />
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  )
}
