'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DataTable } from '@/components/ui/DataTable'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { StatusBadge, PaymentBadge } from '@/components/ui/Badge'
import { useReservas, useUpdateReservation, useRegisterPayment, useCancelReservation } from '@/hooks/useReservas'
import { formatCOP, formatDate, formatDateTime } from '@/lib/utils'
import { Eye, DollarSign, XCircle, Plus } from 'lucide-react'
import type { Reservation } from '@/types'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'

const paymentSchema = z.object({
  amount: z.number().min(1),
  paymentMethod: z.enum(['efectivo', 'transferencia', 'nequi', 'daviplata', 'tarjeta', 'pse']),
  type: z.enum(['deposit', 'balance', 'full']),
})
type PaymentForm = z.infer<typeof paymentSchema>

export default function AdminReservasPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [paymentModal, setPaymentModal] = useState(false)
  const [cancelModal, setCancelModal] = useState(false)

  const { data, isLoading } = useReservas({ page, limit: 15, ...(statusFilter ? { status: statusFilter } : {}) })
  const updateReservation = useUpdateReservation()
  const registerPayment = useRegisterPayment()
  const cancelReservation = useCancelReservation()

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { paymentMethod: 'transferencia', type: 'deposit' },
  })

  const onPayment = async (form: PaymentForm) => {
    if (!selectedReservation) return
    await registerPayment.mutateAsync({ id: selectedReservation.id, data: form })
    setPaymentModal(false)
    reset()
  }

  const columns = [
    {
      key: 'reservationNumber',
      header: 'ID',
      render: (r: Reservation) => (
        <span className="font-mono text-xs text-gray-500">{r.reservationNumber}</span>
      ),
    },
    {
      key: 'contactName',
      header: 'Cliente',
      render: (r: Reservation) => (
        <div>
          <p className="font-medium text-sm">{r.contactName}</p>
          <p className="text-xs text-gray-400">{r.contactPhone}</p>
        </div>
      ),
    },
    {
      key: 'tour',
      header: 'Tour',
      render: (r: Reservation & { tour_name?: string }) => (
        <span className="text-sm">{r.tour_name ?? r.tourId?.slice(0, 8)}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Fecha',
      render: (r: Reservation) => (
        <span className="text-sm text-gray-500">{formatDate(r.createdAt)}</span>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Total',
      render: (r: Reservation) => (
        <span className="font-semibold text-sm">{formatCOP(r.totalAmount)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (r: Reservation) => <StatusBadge status={r.status} />,
    },
    {
      key: 'paymentStatus',
      header: 'Pago',
      render: (r: Reservation) => <PaymentBadge status={r.paymentStatus} />,
    },
    {
      key: 'actions',
      header: '',
      render: (r: Reservation) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSelectedReservation(r)}
            className="p-1.5 hover:bg-gray-100 rounded-lg"
            title="Ver detalle"
          >
            <Eye className="w-4 h-4 text-gray-500" />
          </button>
          {r.paymentStatus !== 'completo' && (
            <button
              onClick={() => { setSelectedReservation(r); setPaymentModal(true) }}
              className="p-1.5 hover:bg-green-50 rounded-lg"
              title="Registrar pago"
            >
              <DollarSign className="w-4 h-4 text-green-600" />
            </button>
          )}
          {!['cancelada', 'completada'].includes(r.status) && (
            <button
              onClick={() => { setSelectedReservation(r); setCancelModal(true) }}
              className="p-1.5 hover:bg-red-50 rounded-lg"
              title="Cancelar"
            >
              <XCircle className="w-4 h-4 text-red-400" />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
            <p className="text-gray-500 text-sm mt-1">{data?.total ?? 0} reservas en total</p>
          </div>
          <Link href="/reservas/nueva" className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Nueva reserva
          </Link>
        </div>

        <div className="card">
          <DataTable
            columns={columns as Parameters<typeof DataTable>[0]['columns']}
            data={(data?.data ?? []) as Record<string, unknown>[]}
            total={data?.total}
            page={page}
            limit={15}
            isLoading={isLoading}
            onPageChange={setPage}
            onSearch={setSearch}
            searchPlaceholder="Buscar por cliente o ID..."
            emptyMessage="Sin reservas aún"
            filters={
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input py-1.5 text-sm w-40"
              >
                <option value="">Todos los estados</option>
                {['pendiente', 'confirmada', 'pagada', 'cancelada', 'completada'].map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            }
          />
        </div>

        {/* Modal: detalle de reserva */}
        <Modal
          open={!!selectedReservation && !paymentModal && !cancelModal}
          onClose={() => setSelectedReservation(null)}
          title={`Reserva ${selectedReservation?.reservationNumber}`}
          size="lg"
        >
          {selectedReservation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Cliente', value: selectedReservation.contactName },
                  { label: 'Teléfono', value: selectedReservation.contactPhone },
                  { label: 'Correo', value: selectedReservation.contactEmail },
                  { label: 'Adultos', value: selectedReservation.numAdults },
                  { label: 'Niños', value: selectedReservation.numChildren },
                  { label: 'Ciudad salida', value: selectedReservation.departureCity },
                  { label: 'Total', value: formatCOP(selectedReservation.totalAmount) },
                  { label: 'Anticipo (30%)', value: formatCOP(selectedReservation.depositAmount ?? 0) },
                  { label: 'Saldo', value: formatCOP(selectedReservation.balanceAmount ?? 0) },
                  { label: 'Creada', value: formatDateTime(selectedReservation.createdAt) },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="font-medium text-gray-900">{item.value}</p>
                  </div>
                ))}
              </div>
              {selectedReservation.specialRequests && (
                <div className="p-3 bg-yellow-50 rounded-lg text-sm">
                  <p className="font-medium text-yellow-700">Solicitudes especiales:</p>
                  <p className="text-yellow-600">{selectedReservation.specialRequests}</p>
                </div>
              )}
              <div className="flex gap-2">
                <StatusBadge status={selectedReservation.status} />
                <PaymentBadge status={selectedReservation.paymentStatus} />
              </div>

              {/* Cambiar estado */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Cambiar estado</p>
                <div className="flex gap-2 flex-wrap">
                  {['confirmada', 'pagada', 'completada'].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateReservation.mutate({ id: selectedReservation.id, data: { status: s } })}
                      className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-brand-blue hover:text-white rounded-lg transition-colors font-medium"
                    >
                      → {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notas internas */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Notas internas</p>
                <textarea
                  defaultValue={selectedReservation.internalNotes ?? ''}
                  onBlur={(e) => {
                    if (e.target.value !== selectedReservation.internalNotes) {
                      updateReservation.mutate({ id: selectedReservation.id, data: { internalNotes: e.target.value } })
                    }
                  }}
                  className="input text-sm"
                  rows={2}
                  placeholder="Notas visibles solo para el equipo..."
                />
              </div>
            </div>
          )}
        </Modal>

        {/* Modal: registrar pago */}
        <Modal open={paymentModal} onClose={() => setPaymentModal(false)} title="Registrar pago" size="sm">
          <form onSubmit={handleSubmit(onPayment)} className="space-y-4">
            <div>
              <label className="label">Monto (COP)</label>
              <input {...register('amount', { valueAsNumber: true })} type="number" className="input" placeholder="350000" />
            </div>
            <div>
              <label className="label">Método de pago</label>
              <select {...register('paymentMethod')} className="input">
                {['efectivo', 'transferencia', 'nequi', 'daviplata', 'tarjeta', 'pse'].map((m) => (
                  <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Tipo de pago</label>
              <select {...register('type')} className="input">
                <option value="deposit">Anticipo (30%)</option>
                <option value="balance">Saldo restante</option>
                <option value="full">Pago completo</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setPaymentModal(false)} className="btn-ghost">Cancelar</button>
              <button type="submit" disabled={isSubmitting} className="btn-secondary">
                Registrar pago
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal: confirmar cancelación */}
        <ConfirmModal
          open={cancelModal}
          onClose={() => setCancelModal(false)}
          onConfirm={() => selectedReservation && cancelReservation.mutate(selectedReservation.id)}
          title="Cancelar reserva"
          message={`¿Seguro que deseas cancelar la reserva ${selectedReservation?.reservationNumber}? Esta acción restaurará los cupos disponibles.`}
          confirmLabel="Cancelar reserva"
          danger
        />
      </div>
    </DashboardLayout>
  )
}
