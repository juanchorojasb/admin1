'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatCard } from '@/components/ui/StatCard'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { useReservasStats, useReservas } from '@/hooks/useReservas'
import { useUserStats } from '@/hooks/useUsers'
import { formatCOP, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { DollarSign, CalendarDays, Users, Map, TrendingUp, Share2 } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import type { DashboardStats } from '@/types'

const STATUS_PIE_COLORS: Record<string, string> = {
  pagada: '#7DC242',
  confirmada: '#1A5FA8',
  pendiente: '#F59E0B',
  cancelada: '#EF4444',
  completada: '#6B7280',
}

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useReservasStats()
  const { data: userStats, isLoading: usersLoading } = useUserStats()
  const { data: recentReservas, isLoading: reservasLoading } = useReservas({ limit: 5, page: 1 })

  const typedStats = stats as DashboardStats | undefined

  if (statsError) {
    return (
      <DashboardLayout requiredRole="admin">
        <ErrorState message="Error al cargar el panel" onRetry={() => refetchStats()} />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de administración</h1>
            <p className="text-gray-500 text-sm mt-1">
              {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <a href="/admin/reservas/nueva" className="btn-primary flex items-center gap-2 text-sm">
            <CalendarDays className="w-4 h-4" /> Nueva reserva
          </a>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Ingresos del mes"
            value={typedStats ? formatCOP(typedStats.monthRevenue ?? 0) : '—'}
            change={typedStats ? '+22% vs mes anterior' : undefined}
            trend="up"
            icon={<DollarSign className="w-5 h-5 text-brand-green" />}
            iconBg="bg-brand-green-50"
            loading={statsLoading}
          />
          <StatCard
            title="Reservas activas"
            value={typedStats?.confirmedReservations ?? '—'}
            change={typedStats ? `${typedStats.totalReservations} en total` : undefined}
            trend="up"
            icon={<CalendarDays className="w-5 h-5 text-brand-blue" />}
            iconBg="bg-brand-blue-50"
            loading={statsLoading}
          />
          <StatCard
            title="Clientes registrados"
            value={userStats?.total ?? '—'}
            change={userStats ? `+${userStats.newThisMonth} este mes` : undefined}
            trend="up"
            icon={<Users className="w-5 h-5 text-purple-600" />}
            iconBg="bg-purple-50"
            loading={usersLoading}
          />
          <StatCard
            title="Tasa de conversión"
            value={typedStats ? `${typedStats.conversionRate ?? 0}%` : '—'}
            trend="neutral"
            icon={<Map className="w-5 h-5 text-orange-500" />}
            iconBg="bg-orange-50"
            loading={statsLoading}
          />
        </div>

        {/* Gráficas */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="card xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Ingresos por mes</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">COP</span>
            </div>
            {statsLoading ? (
              <PageLoader />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={typedStats?.revenueByMonth ?? []}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1A5FA8" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#1A5FA8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(v: number) => [formatCOP(v), 'Ingresos']} />
                  <Area type="monotone" dataKey="revenue" stroke="#1A5FA8" strokeWidth={2} fill="url(#colorIngresos)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Estado de reservas</h2>
            {statsLoading ? (
              <PageLoader />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={typedStats?.reservationsByStatus ?? []}
                    cx="50%" cy="45%"
                    innerRadius={55} outerRadius={80}
                    paddingAngle={3} dataKey="count"
                    nameKey="status"
                  >
                    {(typedStats?.reservationsByStatus ?? []).map((entry, i) => (
                      <Cell key={i} fill={STATUS_PIE_COLORS[entry.status] ?? '#ccc'} />
                    ))}
                  </Pie>
                  <Legend formatter={(v) => STATUS_LABELS[v as keyof typeof STATUS_LABELS] ?? v} />
                  <Tooltip formatter={(v, n) => [v, STATUS_LABELS[n as keyof typeof STATUS_LABELS] ?? n]} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Tablas */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Top tours */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Tours más vendidos</h2>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            {statsLoading ? <PageLoader /> : (
              <div className="space-y-3">
                {(typedStats?.topTours ?? []).map((tour, i) => (
                  <div key={tour.tourName} className="flex items-center gap-3">
                    <span className="w-6 text-center text-sm font-bold text-gray-400">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{tour.tourName}</p>
                      <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-blue rounded-full"
                          style={{ width: `${((tour.count / (typedStats?.topTours?.[0]?.count ?? 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold text-gray-900">{tour.count} ventas</p>
                      <p className="text-gray-400 text-xs">{formatCOP(tour.revenue)}</p>
                    </div>
                  </div>
                ))}
                {(typedStats?.topTours ?? []).length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-6">Sin datos aún</p>
                )}
              </div>
            )}
          </div>

          {/* Reservas recientes */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Reservas recientes</h2>
              <a href="/admin/reservas" className="text-xs text-brand-blue hover:underline">Ver todas</a>
            </div>
            {reservasLoading ? <PageLoader /> : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="table-header">ID</th>
                      <th className="table-header">Cliente</th>
                      <th className="table-header">Monto</th>
                      <th className="table-header">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(recentReservas?.data ?? []).map((r) => (
                      <tr key={r.id} className="table-row">
                        <td className="table-cell font-mono text-xs text-gray-400">{r.reservationNumber}</td>
                        <td className="table-cell">
                          <p className="font-medium">{r.contactName}</p>
                          <p className="text-xs text-gray-400">{formatDate(r.createdAt)}</p>
                        </td>
                        <td className="table-cell font-semibold">{formatCOP(r.totalAmount)}</td>
                        <td className="table-cell">
                          <span className={`badge ${STATUS_COLORS[r.status]}`}>
                            {STATUS_LABELS[r.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(recentReservas?.data ?? []).length === 0 && (
                      <tr><td colSpan={4} className="text-center py-6 text-gray-400 text-sm">Sin reservas aún</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Pipeline CRM */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Pipeline CRM</h2>
            <Share2 className="w-4 h-4 text-gray-400" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Pendientes', key: 'pendiente', color: 'bg-yellow-100 text-yellow-700', bar: 'bg-yellow-400' },
              { label: 'Confirmadas', key: 'confirmada', color: 'bg-blue-100 text-blue-700', bar: 'bg-brand-blue' },
              { label: 'Pagadas', key: 'pagada', color: 'bg-green-100 text-green-700', bar: 'bg-brand-green' },
              { label: 'Completadas', key: 'completada', color: 'bg-gray-100 text-gray-700', bar: 'bg-gray-400' },
            ].map((stage) => {
              const count = typedStats?.reservationsByStatus?.find((s) => s.status === stage.key)?.count ?? 0
              const max = typedStats?.totalReservations || 1
              return (
                <div key={stage.key} className="text-center p-4 bg-gray-50 rounded-xl">
                  <span className={`badge ${stage.color} text-xs mb-2`}>{stage.label}</span>
                  <p className="text-3xl font-bold text-gray-900 my-2">
                    {statsLoading ? '—' : count}
                  </p>
                  <div className="h-1.5 bg-gray-200 rounded-full">
                    <div className={`h-full rounded-full ${stage.bar}`} style={{ width: `${(count / max) * 100}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
