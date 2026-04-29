'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/lib/auth/store'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { MapPin, Calendar, CheckCircle } from 'lucide-react'

interface Park { park_name: string; visited_at: string; tour_id: string }

const PARKS_COL = [
  'PNN Los Nevados',
  'PNN Tatamá',
  'PNN Selva de Florencia',
  'Santuario de Fauna y Flora Otún Quimbaya',
  'PNN Cordillera de los Picachos',
  'PNN Serranía de los Yariguíes',
  'Santuario de Fauna y Flora Isla de la Corota',
]

const PARK_EMOJI: Record<string, string> = {
  'PNN Los Nevados': '🏔️',
  'PNN Tatamá': '🦅',
  'PNN Selva de Florencia': '🌿',
  'Santuario de Fauna y Flora Otún Quimbaya': '🐦',
  'PNN Cordillera de los Picachos': '⛰️',
  'PNN Serranía de los Yariguíes': '🌄',
  'Santuario de Fauna y Flora Isla de la Corota': '🦋',
}

export default function ClienteParquesPage() {
  const { user } = useAuthStore()

  const { data: visited = [], isLoading } = useQuery({
    queryKey: ['parks', user?.id],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Park[] }>(`/users/${user?.id}/parks`)
      return res.data.data
    },
    enabled: !!user?.id,
  })

  const visitedNames = new Set(visited.map((p) => p.park_name))
  const visitedCount = visitedNames.size

  return (
    <DashboardLayout requiredRole="cliente">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis parques visitados</h1>
          <p className="text-gray-500 text-sm">{visitedCount} de {PARKS_COL.length} parques explorados</p>
        </div>

        {/* Barra de progreso */}
        <div className="card bg-gradient-to-r from-brand-green to-green-500 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-green-100 text-sm">Tu huella ecológica</p>
              <p className="text-2xl font-bold mt-1">{visitedCount} parque{visitedCount !== 1 ? 's' : ''} explorado{visitedCount !== 1 ? 's' : ''}</p>
            </div>
            <MapPin className="w-12 h-12 text-white/40" />
          </div>
          <div className="h-2 bg-white/20 rounded-full">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${PARKS_COL.length > 0 ? (visitedCount / PARKS_COL.length) * 100 : 0}%` }}
            />
          </div>
          <p className="text-green-100 text-xs mt-2">{PARKS_COL.length - visitedCount} parques por descubrir</p>
        </div>

        {isLoading && <PageLoader />}

        {/* Grid de parques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PARKS_COL.map((park) => {
            const visit = visited.find((p) => p.park_name === park)
            const isVisited = visitedNames.has(park)
            return (
              <div
                key={park}
                className={`card transition-all ${isVisited ? 'border-2 border-brand-green' : 'opacity-60 border-2 border-dashed border-gray-200'}`}
              >
                <div className="flex items-start gap-3">
                  <span className={`text-4xl ${isVisited ? '' : 'grayscale'}`}>{PARK_EMOJI[park] ?? '🌿'}</span>
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${isVisited ? 'text-gray-900' : 'text-gray-400'}`}>{park}</p>
                    {isVisited && visit?.visited_at && (
                      <p className="text-xs text-brand-green mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(visit.visited_at).toLocaleDateString('es-CO')}
                      </p>
                    )}
                    {!isVisited && (
                      <p className="text-xs text-gray-400 mt-1">Aún no visitado</p>
                    )}
                  </div>
                  {isVisited && <CheckCircle className="w-5 h-5 text-brand-green shrink-0" />}
                </div>
              </div>
            )
          })}
        </div>

        {/* Lista detallada de visitas */}
        {visited.length > 0 && (
          <div>
            <h2 className="font-semibold text-gray-900 mb-3">Historial de visitas</h2>
            <div className="card divide-y divide-gray-50">
              {visited.map((p, i) => (
                <div key={i} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{PARK_EMOJI[p.park_name] ?? '🌿'}</span>
                    <p className="font-medium text-sm text-gray-900">{p.park_name}</p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {p.visited_at ? new Date(p.visited_at).toLocaleDateString('es-CO') : '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
