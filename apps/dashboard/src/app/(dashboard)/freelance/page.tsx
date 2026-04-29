'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { formatCOP, formatDate, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'
import {
  DollarSign, Users, TrendingUp, Share2, Copy,
  CheckCircle, Clock, ArrowUpRight, MessageCircle,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { useState } from 'react'
import toast from 'react-hot-toast'

const monthlySales = [
  { mes: 'Feb', ventas: 3, comision: 105000 },
  { mes: 'Mar', ventas: 5, comision: 178500 },
  { mes: 'Abr', ventas: 4, comision: 152000 },
  { mes: 'May', ventas: 7, comision: 259000 },
  { mes: 'Jun', ventas: 6, comision: 222000 },
  { mes: 'Jul', ventas: 9, comision: 342000 },
]

const recentSales = [
  { id: 'AVN24-K9XF2', cliente: 'Juan Martínez', tour: 'Nevado del Ruiz', fecha: '2024-07-08', monto: 350000, comision: 35000, status: 'pagada' as const },
  { id: 'AVN24-M3TK8', cliente: 'Sofía López', tour: 'Cocora y Salento', fecha: '2024-07-05', monto: 380000, comision: 38000, status: 'confirmada' as const },
  { id: 'AVN24-P7RW1', cliente: 'Diego Herrera', tour: 'Ruta del Café', fecha: '2024-07-02', monto: 340000, comision: 34000, status: 'pendiente' as const },
  { id: 'AVN24-X2BN5', cliente: 'Valentina Cruz', tour: 'Norcasia Pasadía', fecha: '2024-06-28', monto: 280000, comision: 28000, status: 'pagada' as const },
]

const kitTours = [
  { name: 'Nevado del Ruiz', price: 350000, img: '🏔️', commission: '10%' },
  { name: 'Cocora y Salento', price: 380000, img: '🌿', commission: '10%' },
  { name: 'Avistamiento Aves', price: 330000, img: '🦅', commission: '10%' },
  { name: 'Ruta del Café', price: 340000, img: '☕', commission: '10%' },
]

const REFERRAL_CODE = 'ANDREAF-AVN'
const REFERRAL_LINK = `https://avesynaturaleza.travel?ref=${REFERRAL_CODE}`

export default function FreelanceDashboard() {
  const [copied, setCopied] = useState(false)

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
            <p className="text-gray-500 text-sm mt-1">Revendedor · Julio 2024</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-purple-50 px-3 py-2 rounded-lg">
            <span className="w-2 h-2 bg-purple-500 rounded-full" />
            Comisión activa: <span className="font-bold text-purple-600">10%</span>
          </div>
        </div>

        {/* Link de referido */}
        <div className="card bg-gradient-to-r from-purple-600 to-purple-800 text-white border-0">
          <p className="text-purple-200 text-sm mb-1">Tu enlace de ventas personalizado</p>
          <div className="flex items-center gap-3 mt-2">
            <code className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-sm font-mono truncate">
              {REFERRAL_LINK}
            </code>
            <button
              onClick={copyLink}
              className="flex items-center gap-2 bg-white text-purple-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors"
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
            <a
              href={`https://wa.me/?text=🌿 Conoce las mejores experiencias ecológicas de Colombia con Aves y Naturaleza. Reserva aquí: ${REFERRAL_LINK}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-400 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </div>
          <p className="text-purple-300 text-xs mt-2">
            Código: <strong className="text-white">{REFERRAL_CODE}</strong> · Comparte y gana comisiones por cada venta
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Comisión del mes',
              value: formatCOP(342000),
              change: '+54%',
              icon: <DollarSign className="w-5 h-5 text-purple-600" />,
              bg: 'bg-purple-50',
            },
            {
              label: 'Ventas del mes',
              value: '9',
              change: '+3',
              icon: <TrendingUp className="w-5 h-5 text-brand-green" />,
              bg: 'bg-brand-green-50',
            },
            {
              label: 'Total acumulado',
              value: formatCOP(1258500),
              change: '+27%',
              icon: <Share2 className="w-5 h-5 text-brand-blue" />,
              bg: 'bg-brand-blue-50',
            },
            {
              label: 'Clientes referidos',
              value: '34',
              change: '+9',
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

        {/* Comisiones pendientes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card border border-yellow-200 bg-yellow-50">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">Pendiente de pago</span>
            </div>
            <p className="text-2xl font-bold text-yellow-700">{formatCOP(73000)}</p>
            <p className="text-xs text-yellow-600 mt-1">3 ventas sin liquidar</p>
          </div>
          <div className="card border border-green-200 bg-green-50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Ya pagado</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{formatCOP(916500)}</p>
            <p className="text-xs text-green-600 mt-1">Transferencias recibidas</p>
          </div>
          <div className="card flex flex-col justify-between">
            <p className="text-sm text-gray-500">Próxima liquidación</p>
            <p className="text-lg font-bold text-gray-900 mt-1">15 de agosto</p>
            <button className="btn-outline mt-3 text-sm py-2">Solicitar liquidación</button>
          </div>
        </div>

        {/* Gráfica y ventas recientes */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="card xl:col-span-2">
            <h2 className="font-semibold text-gray-900 mb-4">Comisiones por mes</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => [formatCOP(v), 'Comisión']} />
                <Bar dataKey="comision" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card xl:col-span-3">
            <h2 className="font-semibold text-gray-900 mb-4">Ventas recientes</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="table-header">Cliente</th>
                    <th className="table-header">Tour</th>
                    <th className="table-header">Comisión</th>
                    <th className="table-header">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((s) => (
                    <tr key={s.id} className="table-row">
                      <td className="table-cell">
                        <p className="font-medium">{s.cliente}</p>
                        <p className="text-xs text-gray-400">{formatDate(s.fecha)}</p>
                      </td>
                      <td className="table-cell text-gray-500 text-xs">{s.tour}</td>
                      <td className="table-cell font-semibold text-purple-600">{formatCOP(s.comision)}</td>
                      <td className="table-cell">
                        <span className={`badge ${STATUS_COLORS[s.status]}`}>
                          {STATUS_LABELS[s.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Kit de ventas */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Kit de ventas</h2>
            <p className="text-xs text-gray-400">Comparte directamente por WhatsApp</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {kitTours.map((tour) => (
              <div key={tour.name} className="p-4 bg-gray-50 rounded-xl hover:shadow-card-lg transition-shadow">
                <p className="text-3xl mb-2">{tour.img}</p>
                <p className="font-medium text-gray-900 text-sm leading-tight">{tour.name}</p>
                <p className="text-brand-blue font-bold mt-1">{formatCOP(tour.price)}</p>
                <p className="text-xs text-gray-400">Comisión: {tour.commission}</p>
                <button
                  onClick={() => {
                    const msg = `🌿 *${tour.name}* desde ${formatCOP(tour.price)}\n\nVive una experiencia única en la naturaleza colombiana con Aves y Naturaleza 🇨🇴\n\n📲 Reserva aquí: ${REFERRAL_LINK}`
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
