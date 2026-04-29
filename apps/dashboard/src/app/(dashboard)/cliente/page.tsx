'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { formatCOP, formatDate } from '@/lib/utils'
import { CalendarDays, MapPin, Award, Clock, ChevronRight, Leaf, Star } from 'lucide-react'

const upcomingReservations = [
  {
    id: 'AVN24-K9XF2',
    tour: 'Nevado del Ruiz desde Manizales',
    date: '2024-07-12',
    departureCity: 'Manizales',
    persons: 2,
    amount: 700000,
    status: 'pagada',
    daysLeft: 5,
  },
]

const pastReservations = [
  {
    id: 'AVN24-M3TK8',
    tour: 'Cocora y Salento',
    date: '2024-06-15',
    persons: 3,
    amount: 1140000,
    status: 'completada',
    reviewed: false,
  },
  {
    id: 'AVN24-X2BN5',
    tour: 'Ruta del Café',
    date: '2024-05-20',
    persons: 2,
    amount: 680000,
    status: 'completada',
    reviewed: true,
  },
]

const badges = [
  { name: 'Explorador del Nevado', icon: '🏔️', earned: true, desc: 'Visitaste el PNN Los Nevados' },
  { name: 'Amigo del Café', icon: '☕', earned: true, desc: 'Realizaste la Ruta del Café' },
  { name: 'Guardián del Bosque', icon: '🌿', earned: false, desc: 'Visita 3 parques naturales' },
  { name: 'Viajero Experto', icon: '🧭', earned: false, desc: 'Completa 5 tours' },
  { name: 'Avistador', icon: '🦅', earned: false, desc: 'Haz un tour de avistamiento' },
]

const parksVisited = [
  { name: 'PNN Los Nevados', date: '2024-07-12', region: 'Eje Cafetero' },
  { name: 'Valle del Cocora', date: '2024-06-15', region: 'Quindío' },
]

export default function ClienteDashboard() {
  return (
    <DashboardLayout requiredRole="cliente">
      <div className="space-y-6">
        {/* Bienvenida */}
        <div className="bg-gradient-to-r from-brand-blue to-brand-blue-400 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-200 text-sm">Bienvenido de nuevo</p>
              <h1 className="text-2xl font-bold mt-1">María García 👋</h1>
              <p className="text-blue-200 text-sm mt-1">
                Tienes <span className="text-white font-semibold">1 tour próximo</span> · 2 insignias ganadas
              </p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">Niv. 2</p>
              <p className="text-xs text-blue-200">Explorador</p>
            </div>
          </div>
          <div className="mt-4 bg-white/10 rounded-xl p-3">
            <div className="flex justify-between text-xs text-blue-200 mb-1">
              <span>Progreso al nivel 3</span>
              <span>2/5 tours</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full">
              <div className="h-full bg-brand-green rounded-full w-2/5" />
            </div>
          </div>
        </div>

        {/* Próxima reserva */}
        {upcomingReservations.length > 0 && (
          <div className="card border-l-4 border-brand-green">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-brand-green font-semibold uppercase tracking-wide mb-2">
                  ¡Tu próxima aventura!
                </p>
                <h2 className="text-lg font-bold text-gray-900">{upcomingReservations[0].tour}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-4 h-4" />
                    {formatDate(upcomingReservations[0].date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {upcomingReservations[0].departureCity}
                  </span>
                  <span>{upcomingReservations[0].persons} personas</span>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-brand-green text-white rounded-xl px-4 py-2 text-center">
                  <p className="text-2xl font-bold">{upcomingReservations[0].daysLeft}</p>
                  <p className="text-xs">días</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button className="btn-primary text-sm py-2">Ver detalles</button>
              <button className="btn-outline text-sm py-2">Descargar voucher</button>
            </div>
          </div>
        )}

        {/* Stats rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Tours realizados', value: '2', icon: <Leaf className="w-5 h-5 text-brand-green" />, bg: 'bg-brand-green-50' },
            { label: 'Parques visitados', value: '2', icon: <MapPin className="w-5 h-5 text-brand-blue" />, bg: 'bg-brand-blue-50' },
            { label: 'Insignias', value: '2/5', icon: <Award className="w-5 h-5 text-yellow-500" />, bg: 'bg-yellow-50' },
            { label: 'Próximo tour', value: '5 días', icon: <Clock className="w-5 h-5 text-purple-500" />, bg: 'bg-purple-50' },
          ].map((stat) => (
            <div key={stat.label} className="card-sm flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>{stat.icon}</div>
              <div>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Insignias */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Mis insignias</h2>
              <a href="/cliente/insignias" className="text-xs text-brand-blue hover:underline flex items-center gap-1">
                Ver todas <ChevronRight className="w-3 h-3" />
              </a>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {badges.slice(0, 5).map((badge) => (
                <div
                  key={badge.name}
                  className={`text-center p-3 rounded-xl border-2 transition-all ${
                    badge.earned
                      ? 'border-brand-green bg-brand-green-50'
                      : 'border-dashed border-gray-200 bg-gray-50 opacity-50'
                  }`}
                >
                  <p className="text-2xl mb-1">{badge.icon}</p>
                  <p className="text-xs font-medium text-gray-700 leading-tight">{badge.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Parques visitados */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Parques visitados</h2>
              <MapPin className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-3">
              {parksVisited.map((park) => (
                <div key={park.name} className="flex items-center gap-3 p-3 bg-brand-green-50 rounded-xl">
                  <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center">
                    <Leaf className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{park.name}</p>
                    <p className="text-xs text-gray-500">{park.region} · {formatDate(park.date)}</p>
                  </div>
                  <span className="text-xs bg-brand-green text-white px-2 py-0.5 rounded-full">✓</span>
                </div>
              ))}
              <div className="p-3 border-2 border-dashed border-gray-200 rounded-xl text-center text-gray-400 text-sm">
                + 3 parques por descubrir
              </div>
            </div>
          </div>
        </div>

        {/* Historial */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Historial de viajes</h2>
            <a href="/cliente/reservas" className="text-xs text-brand-blue hover:underline">Ver todo</a>
          </div>
          <div className="space-y-3">
            {pastReservations.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">{r.tour}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(r.date)} · {r.persons} personas</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-gray-900">{formatCOP(r.amount)}</p>
                  {!r.reviewed && (
                    <button className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg hover:bg-yellow-100">
                      <Star className="w-3 h-3" /> Calificar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
