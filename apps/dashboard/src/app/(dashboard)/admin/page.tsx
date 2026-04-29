'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { formatCOP, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'
import {
  TrendingUp, Users, CalendarDays, DollarSign,
  ArrowUpRight, ArrowDownRight, Map, Share2,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'

const revenueData = [
  { month: 'Ene', ingresos: 2800000 },
  { month: 'Feb', ingresos: 3200000 },
  { month: 'Mar', ingresos: 4100000 },
  { month: 'Abr', ingresos: 3800000 },
  { month: 'May', ingresos: 5200000 },
  { month: 'Jun', ingresos: 6100000 },
  { month: 'Jul', ingresos: 7400000 },
]

const statusData = [
  { name: 'Pagadas', value: 42, color: '#7DC242' },
  { name: 'Confirmadas', value: 18, color: '#1A5FA8' },
  { name: 'Pendientes', value: 11, color: '#F59E0B' },
  { name: 'Canceladas', value: 5, color: '#EF4444' },
]

const topTours = [
  { name: 'Nevado del Ruiz', ventas: 34, ingresos: 11900000 },
  { name: 'Cocora y Salento', ventas: 28, ingresos: 10640000 },
  { name: 'Avistamiento de Aves', ventas: 19, ingresos: 6270000 },
  { name: 'Norcasia Pasadía', ventas: 15, ingresos: 4200000 },
  { name: 'Ruta del Café', ventas: 12, ingresos: 3960000 },
]

const recentReservations = [
  { id: 'AVN24-K9XF2', cliente: 'María García', tour: 'Nevado del Ruiz', fecha: '12 Jul', monto: 350000, status: 'pagada' as const },
  { id: 'AVN24-M3TK8', cliente: 'Carlos Pérez', tour: 'Cocora y Salento', fecha: '14 Jul', monto: 380000, status: 'confirmada' as const },
  { id: 'AVN24-P7RW1', cliente: 'Ana Rodríguez', tour: 'Avistamiento Aves', fecha: '15 Jul', monto: 330000, status: 'pendiente' as const },
  { id: 'AVN24-X2BN5', cliente: 'Luis Torres', tour: 'Norcasia 2D/1N', fecha: '18 Jul', monto: 580000, status: 'pagada' as const },
]

interface StatCardProps {
  title: string
  value: string
  change: string
  positive: boolean
  icon: React.ReactNode
  color: string
}

function StatCard({ title, value, change, positive, icon, color }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${positive ? 'text-green-600' : 'text-red-500'}`}>
          {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change} vs mes anterior
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de administración</h1>
            <p className="text-gray-500 text-sm mt-1">Resumen general · Julio 2024</p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Nueva reserva
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Ingresos del mes"
            value={formatCOP(7400000)}
            change="+22%"
            positive
            icon={<DollarSign className="w-5 h-5 text-brand-green" />}
            color="bg-brand-green-50"
          />
          <StatCard
            title="Reservas activas"
            value="76"
            change="+8"
            positive
            icon={<CalendarDays className="w-5 h-5 text-brand-blue" />}
            color="bg-brand-blue-50"
          />
          <StatCard
            title="Clientes registrados"
            value="243"
            change="+15"
            positive
            icon={<Users className="w-5 h-5 text-purple-600" />}
            color="bg-purple-50"
          />
          <StatCard
            title="Tours activos"
            value="9"
            change="sin cambios"
            positive
            icon={<Map className="w-5 h-5 text-orange-500" />}
            color="bg-orange-50"
          />
        </div>

        {/* Gráficas */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Ingresos por mes */}
          <div className="card xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Ingresos 2024</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">COP</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
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
                <Area
                  type="monotone"
                  dataKey="ingresos"
                  stroke="#1A5FA8"
                  strokeWidth={2}
                  fill="url(#colorIngresos)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Estado de reservas */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Estado de reservas</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend formatter={(value) => <span className="text-xs">{value}</span>} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tablas inferiores */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Tours más vendidos */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Tours más vendidos</h2>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-3">
              {topTours.map((tour, i) => (
                <div key={tour.name} className="flex items-center gap-3">
                  <span className="w-6 text-center text-sm font-bold text-gray-400">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{tour.name}</p>
                    <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-blue rounded-full"
                        style={{ width: `${(tour.ventas / 34) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold text-gray-900">{tour.ventas} ventas</p>
                    <p className="text-gray-400 text-xs">{formatCOP(tour.ingresos)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reservas recientes */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Reservas recientes</h2>
              <a href="/admin/reservas" className="text-xs text-brand-blue hover:underline">Ver todas</a>
            </div>
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
                  {recentReservations.map((r) => (
                    <tr key={r.id} className="table-row">
                      <td className="table-cell font-mono text-xs text-gray-400">{r.id}</td>
                      <td className="table-cell">
                        <p className="font-medium">{r.cliente}</p>
                        <p className="text-xs text-gray-400">{r.tour}</p>
                      </td>
                      <td className="table-cell font-semibold">{formatCOP(r.monto)}</td>
                      <td className="table-cell">
                        <span className={`badge ${STATUS_COLORS[r.status]}`}>
                          {STATUS_LABELS[r.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* CRM Pipeline */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Pipeline CRM</h2>
            <Share2 className="w-4 h-4 text-gray-400" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Leads', count: 24, color: 'bg-gray-100 text-gray-700', bar: 'bg-gray-400' },
              { label: 'Contactados', count: 18, color: 'bg-blue-100 text-blue-700', bar: 'bg-brand-blue' },
              { label: 'Reservados', count: 11, color: 'bg-yellow-100 text-yellow-700', bar: 'bg-yellow-400' },
              { label: 'Completados', count: 42, color: 'bg-green-100 text-green-700', bar: 'bg-brand-green' },
            ].map((stage) => (
              <div key={stage.label} className="text-center p-4 bg-gray-50 rounded-xl">
                <span className={`badge ${stage.color} text-xs mb-2`}>{stage.label}</span>
                <p className="text-3xl font-bold text-gray-900 my-2">{stage.count}</p>
                <div className="h-1.5 bg-gray-200 rounded-full">
                  <div
                    className={`h-full rounded-full ${stage.bar}`}
                    style={{ width: `${(stage.count / 42) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
