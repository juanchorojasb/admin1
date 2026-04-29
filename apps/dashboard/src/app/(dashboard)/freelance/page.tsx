'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { StatCard } from '@/components/ui/StatCard'
import { useAuthStore } from '@/lib/auth/store'
import { useFreelanceSummary } from '@/hooks/useComisiones'
import { useReservas } from '@/hooks/useReservas'
import { useTours } from '@/hooks/useTours'
import { formatCOP, formatDate, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'
import {
  DollarSign, TrendingUp, Users, Share2,
  Copy, CheckCircle, Clock, MessageCircle, ArrowUpRight,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import toast from 'react-hot-toast'
import type { Reservation } from '@/types'

export default function FreelanceDashboard() {
  const { user } = useAuthStore()
  const [copied, setCopied] = useState(false)

  const { data: summaryData, isLoading } = useFreelanceSummary()
  const { data: ventas } = useReservas({ limit: 5 })
  const { data: toursData } = useTours({ active: true, limit: 4 })

  const summary = summaryData?.summary
  const monthly = summaryData?.monthly ?? []
  const recent = summaryData?.recent ?? []

  const REFERRAL_LINK = user?.referralCode
    ? `https://avesynaturaleza.travel?ref=${user.referralCode}`
    : ''

  const copyLink = () => {
    navigator.clipboard.writeText(REFERRAL_LINK)
    setCopied(true)
    toast.success('Enlace copiado')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <DashboardLayout requiredRole="freelance">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mi panel de ventas</h1>
            <p className="text-gray-500 text-sm mt-1">
              Hola, {user?.firstName} · Revendedor
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm bg-purple-50 px-3 py-2 rounded-lg">
            <span className="w-2 h-2 bg-purple-500 rounded-full" />
            <span className="text-gray-500">Comisión activa:</span>
            <span className="font-bold text-purple-600">10%</span>
          </div>
        </div>

        {/* Link de referido */}
        <div className="card bg-gradient-to-r from-purple-600 to-purple-800 text-white border-0">
          <p className="text-purple-200 text-sm mb-2">Tu enlace de ventas personalizado</p>
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-sm font-mono truncate">
              {REFERRAL_LINK || 'Cargando...'}
            </code>
            <button
              onClick={copyLink}
              className="flex items-center gap-2 bg-white text-purple-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors"
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`🌿 Descubre las mejores experiencias ecológicas de Colombia con Aves y Naturaleza. Reserva aquí: ${REFERRAL_LINK}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-400"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
          </div>
          <p className="text-purple-300 text-xs mt-2">
            Código: <strong className="text-white">{user?.referralCode ?? '—'}</strong>
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Comisión del mes"
            value={summary ? formatCOP(parseFloat(summary.this_month)) : '—'}
            trend="up"
            icon={<DollarSign className="w-5 h-5 text-purple-600" />}
            iconBg="bg-purple-50"
            loading={isLoading}
          />
          <StatCard
            title="Ventas del mes"
            value={summary?.monthly_sales ?? '—'}
            trend="up"
            icon={<TrendingUp className="w-5 h-5 text-brand-green" />}
            iconBg="bg-brand-green-50"
            loading={isLoading}
          />
          <StatCard
            title="Total acumulado"
            value={summary ? formatCOP(parseFloat(summary.total_earned)) : '—'}
            trend="up"
            icon={<Share2 className="w-5 h-5 text-brand-blue" />}
            iconBg="bg-brand-blue-50"
            loading={isLoading}
          />
          <StatCard
            title="Clientes referidos"
            value={summary?.unique_clients ?? '—'}
            trend="neutral"
            icon={<Users className="w-5 h-5 text-orange-500" />}
            iconBg="bg-orange-50"
            loading={isLoading}
          />
        </div>

        {/* Estado de comisiones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card border border-yellow-200 bg-yellow-50">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">Pendiente de pago</span>
            </div>
            {isLoading ? <div className="h-8 bg-yellow-200 rounded animate-pulse" /> : (
              <p className="text-2xl font-bold text-yellow-700">
                {summary ? formatCOP(parseFloat(summary.pending)) : '—'}
              </p>
            )}
          </div>
          <div className="card border border-green-200 bg-green-50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Ya pagado</span>
            </div>
            {isLoading ? <div className="h-8 bg-green-200 rounded animate-pulse" /> : (
              <p className="text-2xl font-bold text-green-700">
                {summary ? formatCOP(parseFloat(summary.paid)) : '—'}
              </p>
            )}
          </div>
          <div className="card flex flex-col justify-between">
            <p className="text-sm text-gray-500">Total de ventas</p>
            {isLoading ? <div className="h-8 bg-gray-100 rounded animate-pulse mt-1" /> : (
              <p className="text-2xl font-bold text-gray-900 mt-1">{summary?.total_sales ?? '—'}</p>
            )}
            <a href="/freelance/comisiones" className="btn-outline mt-3 text-sm py-2 text-center">
              Ver detalle
            </a>
          </div>
        </div>

        {/* Gráfica + ventas recientes */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="card xl:col-span-2">
            <h2 className="font-semibold text-gray-900 mb-4">Comisiones por mes</h2>
            {isLoading ? <PageLoader /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => [formatCOP(v), 'Comisión']} />
                  <Bar dataKey="commission" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card xl:col-span-3">
            <h2 className="font-semibold text-gray-900 mb-4">Ventas recientes</h2>
            {isLoading ? <PageLoader /> : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="table-header">Tour</th>
                      <th className="table-header">Fecha</th>
                      <th className="table-header">Comisión</th>
                      <th className="table-header">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((s) => (
                      <tr key={s.reservation_number} className="table-row">
                        <td className="table-cell font-medium text-sm">{s.tour_name}</td>
                        <td className="table-cell text-gray-500 text-xs">{formatDate(s.created_at)}</td>
                        <td className="table-cell font-semibold text-purple-600">
                          {formatCOP(parseFloat(s.commission_amount))}
                        </td>
                        <td className="table-cell">
                          <span className={`badge text-xs ${s.commission_paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {s.commission_paid ? 'Pagada' : 'Pendiente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {recent.length === 0 && (
                      <tr><td colSpan={4} className="text-center py-6 text-gray-400 text-sm">Sin ventas aún</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Kit de ventas con datos reales de tours */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Kit de ventas</h2>
            <p className="text-xs text-gray-400">Comparte directamente por WhatsApp</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(toursData?.data ?? []).map((tour) => (
              <div key={tour.id} className="p-4 bg-gray-50 rounded-xl hover:shadow-card-lg transition-shadow">
                <p className="text-3xl mb-2">🌿</p>
                <p className="font-medium text-gray-900 text-sm leading-tight">{tour.name}</p>
                <p className="text-brand-blue font-bold mt-1">{formatCOP(tour.basePrice)}</p>
                <p className="text-xs text-gray-400">Comisión: 10%</p>
                <button
                  onClick={() => {
                    const msg = `🌿 *${tour.name}* desde ${formatCOP(tour.basePrice)}\n\nVive una experiencia única en la naturaleza colombiana con Aves y Naturaleza 🇨🇴\n\n📲 Reserva aquí: ${REFERRAL_LINK}`
                    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
                  }}
                  className="mt-3 w-full flex items-center justify-center gap-1 text-xs bg-green-500 text-white py-1.5 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="w-3 h-3" /> Compartir
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
