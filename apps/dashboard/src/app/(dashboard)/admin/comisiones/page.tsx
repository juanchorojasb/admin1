'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DataTable } from '@/components/ui/DataTable'
import { ConfirmModal } from '@/components/ui/Modal'
import { useComisiones, useMarkCommissionsPaid } from '@/hooks/useComisiones'
import { formatCOP, formatDate } from '@/lib/utils'
import { CheckCircle, DollarSign } from 'lucide-react'

interface CommissionRow {
  id: string
  reservation_number: string
  tour_name: string
  client_first_name: string
  client_last_name: string
  freelance_first_name: string
  freelance_last_name: string
  commission_rate: number
  total_amount: string
  commission_amount: string
  commission_paid: boolean
  created_at: string
}

export default function AdminComisionesPage() {
  const [page, setPage] = useState(1)
  const [paidFilter, setPaidFilter] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [confirmModal, setConfirmModal] = useState(false)

  const { data, isLoading } = useComisiones({ page, limit: 20, ...(paidFilter !== '' ? { paid: paidFilter } : {}) })
  const markPaid = useMarkCommissionsPaid()

  const rows = (data?.data ?? []) as CommissionRow[]

  const totalPending = rows
    .filter((r) => !r.commission_paid && selected.includes(r.id))
    .reduce((s, r) => s + parseFloat(r.commission_amount), 0)

  const toggleAll = () => {
    const unpaid = rows.filter((r) => !r.commission_paid).map((r) => r.id)
    setSelected(selected.length === unpaid.length ? [] : unpaid)
  }

  const columns = [
    {
      key: 'select', header: '',
      render: (r: CommissionRow) => !r.commission_paid ? (
        <input
          type="checkbox"
          checked={selected.includes(r.id)}
          onChange={(e) => setSelected(e.target.checked ? [...selected, r.id] : selected.filter((i) => i !== r.id))}
          className="rounded"
        />
      ) : <CheckCircle className="w-4 h-4 text-green-500" />,
    },
    { key: 'reservation_number', header: 'Reserva', render: (r: CommissionRow) => <span className="font-mono text-xs text-gray-400">{r.reservation_number}</span> },
    { key: 'tour_name', header: 'Tour', render: (r: CommissionRow) => <span className="text-sm">{r.tour_name}</span> },
    {
      key: 'freelance', header: 'Revendedor',
      render: (r: CommissionRow) => (
        <span className="text-sm">{r.freelance_first_name} {r.freelance_last_name}</span>
      ),
    },
    {
      key: 'total_amount', header: 'Venta',
      render: (r: CommissionRow) => <span className="text-sm">{formatCOP(parseFloat(r.total_amount))}</span>,
    },
    {
      key: 'commission_amount', header: 'Comisión',
      render: (r: CommissionRow) => (
        <span className="font-bold text-purple-600">{formatCOP(parseFloat(r.commission_amount))}</span>
      ),
    },
    { key: 'commission_rate', header: 'Tasa', render: (r: CommissionRow) => <span className="text-sm text-gray-500">{r.commission_rate}%</span> },
    { key: 'created_at', header: 'Fecha', render: (r: CommissionRow) => <span className="text-sm text-gray-400">{formatDate(r.created_at)}</span> },
    {
      key: 'commission_paid', header: 'Estado',
      render: (r: CommissionRow) => (
        <span className={`badge text-xs ${r.commission_paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {r.commission_paid ? 'Pagada' : 'Pendiente'}
        </span>
      ),
    },
  ]

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Comisiones</h1>
            <p className="text-gray-500 text-sm">{data?.total ?? 0} registros</p>
          </div>
          {selected.length > 0 && (
            <button
              onClick={() => setConfirmModal(true)}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <DollarSign className="w-4 h-4" />
              Liquidar {selected.length} seleccionadas · {formatCOP(totalPending)}
            </button>
          )}
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <input type="checkbox" onChange={toggleAll} checked={selected.length > 0} className="rounded" />
            <span className="text-sm text-gray-500">Seleccionar pendientes</span>
            <select
              value={paidFilter}
              onChange={(e) => setPaidFilter(e.target.value)}
              className="input py-1.5 text-sm w-44 ml-auto"
            >
              <option value="">Todas</option>
              <option value="false">Solo pendientes</option>
              <option value="true">Solo pagadas</option>
            </select>
          </div>
          <DataTable
            columns={columns as Parameters<typeof DataTable>[0]['columns']}
            data={rows as unknown as Record<string, unknown>[]}
            total={data?.total}
            page={page}
            limit={20}
            isLoading={isLoading}
            onPageChange={setPage}
            emptyMessage="Sin comisiones"
          />
        </div>

        <ConfirmModal
          open={confirmModal}
          onClose={() => setConfirmModal(false)}
          onConfirm={() => markPaid.mutate(selected.map((id) => id)).then(() => setSelected([]))}
          title="Confirmar liquidación"
          message={`¿Marcar ${selected.length} comisiones como pagadas? Total: ${formatCOP(totalPending)}`}
          confirmLabel="Confirmar liquidación"
        />
      </div>
    </DashboardLayout>
  )
}
