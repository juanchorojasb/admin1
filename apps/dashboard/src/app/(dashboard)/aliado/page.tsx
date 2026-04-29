'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { formatCOP, formatDate, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'
import {
  CalendarDays, DollarSign, Users, CheckCircle,
  Clock, Bell, Star, MapPin, ArrowUpRight,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'

const monthlyRevenue = [
  { mes: 'Feb', ingresos: 480000 },
  { mes: 'Mar', ingresos: 720000 },
  { mes: 'Abr', ingresos: 650000 },
  { mes: 'May', ingresos: 980000 },
  { mes: 'Jun', ingresos: 1100000 },
  { mes: 'Jul', ingresos: 1350000 },
]

const upcomingServices = [
  {
    id: 'AVN24-K9XF2',
    tour: 'Nevado del Ruiz',
    date: '2024-07-12',
    persons: 8,
    pickupTime: '5:30 am',
    type: 'transporte',
    route: 'Manizales → PNN Los Nevados',
    status: 'confirmada' as const,
  },
  {
    id: 'AVN24-M3TK8',
    tour: 'Cocora y Salento',
    date: '2024-07-14',
    persons: 12,
    pickupTime: '6:30 am',
    type: 'transporte',
    route: 'Manizales → Salento',
    status: 'confirmada' as const,
  },
  {
    id: 'AVN24-P7RW1',
    tour: 'Norcasia 2D/1N',
    date: '2024-07-18',
    persons: 6,
    checkIn: '2024-07-18',
    checkOut: '2024-07-19',
    type: 'alojamiento',
    status: 'pendiente' as const,
  },
]

const recentServices = [
  { id: 'AVN24-A1BC2', tour: 'Ruta del Café', date: '2024-07-03', persons: 10, amount: 320000, status: 'completada' as const },
  { id: 'AVN24-B2CD3', tour: 'Nevado del Ruiz', date: '2024-06-28', persons: 7, amount: 280000, status: 'completada' as const },
  { id: 'AVN24-C3DE4', tour: 'Avistamiento Aves', date: '2024-06-20', persons: 4, amount: 160000, status: 'completada' as const },
]

const notifications = [
  { id: 1, msg: 'Nueva reserva asignada: Nevado del Ruiz (8 personas) · 12 Jul', time: 'hace 2h', unread: true },
  { id: 2, msg: 'Confirmación de servicio: Cocora y Salento · 14 Jul', time: 'hace 5h', unread: true },
  { id: 3, msg: 'Pago recibido por servicio Ruta del Café · $320.000', time: 'ayer', unread: false },
]

export default function AliadoDashboard() {
  return (
    <DashboardLayout requiredRole="aliado">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Aliado</h1>
            <p className="text-gray-500 text-sm mt-1">Transporte Eco · Julio 2024</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                2
              </span>
            </div>
            <span className="ml-2 flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <CheckCircle className="w-3 h-3" /> Aliado verificado
            </span>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Ingresos del mes',
              value: formatCOP(1350000),
              change: '+23%',
              icon: <DollarSign className="w-5 h-5 text-brand-green" />,
              bg: 'bg-brand-green-50',
            },
            {
              label: 'Servicios próximos',
              value: '3',
              change: '+1 esta semana',
              icon: <CalendarDays className="w-5 h-5 text-brand-blue" />,
              bg: 'bg-brand-blue-50',
            },
            {
              label: 'Servicios completados',
              value: '28',
              change: 'Mes actual: 7',
              icon: <CheckCircle className="w-5 h-5 text-green-600" />,
              bg: 'bg-green-50',
            },
            {
              label: 'Personas atendidas',
              value: '186',
              change: '+42 este mes',
              icon: <Users className="w-5 h-5 text-orange-500" />,
              bg: 'bg-orange-50',
            },
          ].map((kpi) => (
            <div key={kpi.label} className="stat-card">
              <div className={`stat-icon ${kpi.bg}`}>{kpi.icon}</div>
              <div>
                <p className="text-xs text-gray-500">{kpi.label}</p>
                <p className="text-xl font-bold text-gray-900 mt-0.5">{kpi.value}</p>
                <p className="text-xs text-green-600 flex items-center gap-0.5 mt-1">
                  <ArrowUpRight className="w-3 h-3" /> {kpi.change}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Próximos servicios */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Servicios próximos</h2>
            <a href="/aliado/reservas" className="text-xs text-brand-blue hover:underline">Ver todos</a>
          </div>
          <div className="space-y-3">
            {upcomingServices.map((svc) => (
              <div key={svc.id} className={`p-4 rounded-xl border-l-4 ${svc.status === 'confirmada' ? 'border-brand-blue bg-brand-blue-50/50' : 'border-yellow-400 bg-yellow-50/50'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{svc.tour}</p>
                      <span className={`badge text-xs ${STATUS_COLORS[svc.status]}`}>
                        {STATUS_LABELS[svc.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {formatDate(svc.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {svc.persons} personas
                      </span>
                      {svc.pickupTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Salida: {svc.pickupTime}
                        </span>
                      )}
                    </div>
                    {svc.route && (
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {svc.route}
                      </p>
                    )}
                  </div>
                  <span className="text-xs px-2 py-1 bg-white rounded-lg border border-gray-200 capitalize text-gray-600">
                    {svc.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfica + Notificaciones */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="card xl:col-span-3">
            <h2 className="font-semibold text-gray-900 mb-4">Ingresos por mes</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(v: number) => [formatCOP(v), 'Ingresos']} />
                <Bar dataKey="ingresos" fill="#7DC242" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Notificaciones</h2>
              <span className="badge bg-red-100 text-red-600 text-xs">2 nuevas</span>
            </div>
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className={`p-3 rounded-xl text-sm ${n.unread ? 'bg-brand-blue-50 border border-brand-blue-100' : 'bg-gray-50'}`}>
                  <p className={`leading-tight ${n.unread ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                    {n.msg}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Historial y calificación */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Servicios completados</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="table-header">Tour</th>
                    <th className="table-header">Fecha</th>
                    <th className="table-header">Personas</th>
                    <th className="table-header">Pago</th>
                  </tr>
                </thead>
                <tbody>
                  {recentServices.map((s) => (
                    <tr key={s.id} className="table-row">
                      <td className="table-cell font-medium">{s.tour}</td>
                      <td className="table-cell text-gray-500">{formatDate(s.date)}</td>
                      <td className="table-cell">{s.persons}</td>
                      <td className="table-cell font-semibold text-brand-green">{formatCOP(s.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Mi calificación</h2>
            <div className="flex items-center gap-4 p-4 bg-brand-green-50 rounded-xl mb-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-brand-green">4.8</p>
                <div className="flex gap-0.5 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < 5 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                {[
                  { stars: 5, percent: 75 },
                  { stars: 4, percent: 20 },
                  { stars: 3, percent: 5 },
                ].map((r) => (
                  <div key={r.stars} className="flex items-center gap-2 text-xs">
                    <span className="w-8 text-gray-500">{r.stars}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                      <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${r.percent}%` }} />
                    </div>
                    <span className="w-8 text-gray-400">{r.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center">28 servicios evaluados</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
