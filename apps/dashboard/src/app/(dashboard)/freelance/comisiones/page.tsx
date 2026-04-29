'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useFreelanceSummary } from '@/hooks/useComisiones'
import { useComisiones } from '@/hooks/useComisiones'
import { DataTable } from '@/components/ui/DataTable'
import { formatCOP, formatDate } from '@/lib/utils'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { useState } from 'react'

interface CommissionRow {
  id: string
  reservation_number: string
  tour_name: string
  client_first_name: string
  client_last_name: string
  commission_rate: number
  total_amount: string
  commission_amount: string
  commission_paid: boolean
  created_at: string
}

export default function FreelanceComisionesPage() {
  const [page, setPage] = useState(1)
  const { data: summary, isLoading: summaryLoading } = useFreelanceSummary()
  const { data, isLoading } = useComisiones({ page, limit: 20 })

  const rows = (data?.data ?? []) as CommissionRow[]

  const columns = [
    { key: 'reservation_number', header: 'Reserva', render: (r: CommissionRow) => <span className="font-mono text-xs text-gray-400">{r.reservation_number}</span> },
    { key: 'tour_name', header: 'Tour', render: (r: CommissionRow) => <span className="text-sm">{r.tour_name}</span> },
    {
      key: 'client', header: 'Cliente',
      render: (r: CommissionRow) => <span className="text-sm">{r.client_first_name} {r.client_last_name}</span>,
    },
    {
      key: 'total_amount', header: 'Venta',
      render: (r: CommissionRow) => <span className="text-sm">{formatCOP(parseFloat(r.total_amount))}</span>,
    },
    {
      key: 'commission_amount', header: 'Comisión',
      render: (r: CommissionRow) => <span className="font-bold text-purple-600">{formatCOP(parseFloat(r.commission_amount))}</span>,
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

  if (summaryLoading) return <DashboardLayout requiredRole="freelance"><PageLoader /></DashboardLayout>

  const s = summary?.summary

  return (
    <DashboardLayout requiredRole="freelance">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis comisiones</h1>
          <p className="text-gray-500 text-sm">Detalle de ganancias por ventas</p>
        </div>

        {/* Tarjetas resumen */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total ganado', value: formatCOP(parseFloat(s?.total_earned ?? '0')), icon: <TrendingUp className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50' },
            { label: 'Pendiente por cobrar', value: formatCOP(parseFloat(s?.pending ?? '0')), icon: <Clock className="w-5 h-5 text-yellow-600" />, bg: 'bg-yellow-50' },
            { label: 'Ya cobrado', value: formatCOP(parseFloat(s?.paid ?? '0')), icon: <CheckCircle className="w-5 h-5 text-green-600" />, bg: 'bg-green-50' },
            { label: 'Este mes', value: formatCOP(parseFloat(s?.this_month ?? '0')), icon: <DollarSign className="w-5 h-5 text-brand-blue" />, bg: 'bg-brand-blue-50' },
          ].map((card) => (
            <div key={card.label} className="card-sm">
              <div className={`p-2 rounded-xl ${card.bg} w-fit mb-2`}>{card.icon}</div>
              <p className="text-xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Tabla */}
        <div className="card">
          <DataTable
            columns={columns as Parameters<typeof DataTable>[0]['columns']}
            data={rows as unknown as Record<string, unknown>[]}
            total={data?.total}
            page={page}
            limit={20}
            isLoading={isLoading}
            onPageChange={setPage}
            emptyMessage="Sin comisiones registradas"
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
