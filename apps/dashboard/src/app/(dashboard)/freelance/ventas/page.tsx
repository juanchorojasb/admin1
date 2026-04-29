'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge, PaymentBadge } from '@/components/ui/Badge'
import { useReservas } from '@/hooks/useReservas'
import { formatCOP, formatDate } from '@/lib/utils'
import { Eye } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import type { Reservation } from '@/types'

type SaleRow = Reservation & { tour_name?: string; tour_destination?: string }

export default function FreelanceVentasPage() {
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<SaleRow | null>(null)

  const { data, isLoading } = useReservas({ page, limit: 20 })
  const rows = (data?.data ?? []) as SaleRow[]

  const columns = [
    {
      key: 'number', header: 'Reserva',
      render: (r: SaleRow) => <span className="font-mono text-xs text-gray-400">{r.reservationNumber}</span>,
    },
    {
      key: 'tour', header: 'Tour',
      render: (r: SaleRow) => <span className="text-sm font-medium">{r.tour_name ?? 'Tour'}</span>,
    },
    {
      key: 'client', header: 'Cliente',
      render: (r: SaleRow) => <span className="text-sm">{r.contactName}</span>,
    },
    {
      key: 'total', header: 'Total',
      render: (r: SaleRow) => <span className="font-bold text-gray-900">{formatCOP(r.totalAmount)}</span>,
    },
    {
      key: 'status', header: 'Estado',
      render: (r: SaleRow) => <StatusBadge status={r.status} />,
    },
    {
      key: 'payment', header: 'Pago',
      render: (r: SaleRow) => <PaymentBadge status={r.paymentStatus} />,
    },
    {
      key: 'date', header: 'Fecha',
      render: (r: SaleRow) => <span className="text-sm text-gray-400">{formatDate(r.createdAt)}</span>,
    },
    {
      key: 'actions', header: '',
      render: (r: SaleRow) => (
        <button onClick={() => setSelected(r)} className="p-1.5 hover:bg-gray-100 rounded-lg">
          <Eye className="w-4 h-4 text-gray-400" />
        </button>
      ),
    },
  ]

  return (
    <DashboardLayout requiredRole="freelance">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis ventas</h1>
          <p className="text-gray-500 text-sm">{data?.total ?? 0} reservas generadas</p>
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
            emptyMessage="Aún no tienes ventas registradas"
          />
        </div>

        <Modal open={!!selected} onClose={() => setSelected(null)} title={`Reserva ${selected?.reservationNumber}`} size="md">
          {selected && (
            <div className="space-y-3 text-sm">
              {[
                { l: 'Tour', v: selected.tour_name ?? 'Tour' },
                { l: 'Destino', v: selected.tour_destination ?? selected.departureCity },
                { l: 'Cliente', v: selected.contactName },
                { l: 'Teléfono', v: selected.contactPhone },
                { l: 'Adultos', v: selected.numAdults },
                { l: 'Niños', v: selected.numChildren },
                { l: 'Total', v: formatCOP(selected.totalAmount) },
                { l: 'Anticipo', v: selected.depositAmount ? formatCOP(selected.depositAmount) : 'Pendiente' },
                { l: 'Saldo', v: selected.balanceAmount ? formatCOP(selected.balanceAmount) : '—' },
                { l: 'Fecha', v: formatDate(selected.createdAt) },
              ].map((item) => (
                <div key={item.l} className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-400">{item.l}</span>
                  <span className="font-medium">{String(item.v)}</span>
                </div>
              ))}
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  )
}
