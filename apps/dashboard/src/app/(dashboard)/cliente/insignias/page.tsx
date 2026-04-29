'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/lib/auth/store'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { Award, Lock } from 'lucide-react'

interface Badge { id: string; name: string; description: string; icon: string; earned: boolean; earnedAt?: string }

const BADGE_EMOJIS: Record<string, string> = {
  'Explorador del Nevado': '🏔️',
  'Amigo del Café': '☕',
  'Guardián del Bosque': '🌿',
  'Viajero Experto': '🧭',
  'Avistador': '🦅',
  'Noctámbulo Natural': '🌙',
  'Jinete de Palmas': '🌴',
  'Ballenas del Pacífico': '🐋',
}

export default function InsigniasPage() {
  const { user } = useAuthStore()

  const { data: badges = [], isLoading } = useQuery({
    queryKey: ['badges', user?.id],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Badge[] }>(`/users/${user?.id}/badges`)
      return res.data.data
    },
    enabled: !!user?.id,
  })

  const earned = badges.filter((b) => b.earned)
  const pending = badges.filter((b) => !b.earned)

  return (
    <DashboardLayout requiredRole="cliente">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis insignias</h1>
          <p className="text-gray-500 text-sm">{earned.length} de {badges.length} desbloqueadas</p>
        </div>

        {/* Progreso */}
        <div className="card bg-gradient-to-r from-brand-blue to-brand-blue-400 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-blue-200 text-sm">Tu nivel actual</p>
              <p className="text-2xl font-bold mt-1">
                {earned.length < 2 ? 'Explorador' : earned.length < 4 ? 'Aventurero' : 'Naturalista Experto'}
              </p>
            </div>
            <Award className="w-12 h-12 text-brand-green" />
          </div>
          <div className="h-2 bg-white/20 rounded-full">
            <div
              className="h-full bg-brand-green rounded-full transition-all"
              style={{ width: `${badges.length > 0 ? (earned.length / badges.length) * 100 : 0}%` }}
            />
          </div>
          <p className="text-blue-200 text-xs mt-2">{earned.length}/{badges.length} insignias · {badges.length - earned.length} por descubrir</p>
        </div>

        {isLoading && <PageLoader />}

        {/* Ganadas */}
        {earned.length > 0 && (
          <div>
            <h2 className="font-semibold text-gray-900 mb-3">Desbloqueadas</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {earned.map((b) => (
                <div key={b.id} className="card text-center hover:shadow-card-lg transition-all border-2 border-brand-green">
                  <p className="text-4xl mb-2">{BADGE_EMOJIS[b.name] ?? '🏆'}</p>
                  <p className="font-semibold text-gray-900 text-sm">{b.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{b.description}</p>
                  {b.earnedAt && (
                    <p className="text-xs text-brand-green mt-2 font-medium">
                      ✓ {new Date(b.earnedAt).toLocaleDateString('es-CO')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pendientes */}
        {pending.length > 0 && (
          <div>
            <h2 className="font-semibold text-gray-900 mb-3">Por desbloquear</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {pending.map((b) => (
                <div key={b.id} className="card text-center opacity-50 border-2 border-dashed border-gray-200">
                  <div className="relative inline-block mb-2">
                    <p className="text-4xl grayscale">{BADGE_EMOJIS[b.name] ?? '🏆'}</p>
                    <Lock className="w-4 h-4 text-gray-400 absolute -bottom-1 -right-1" />
                  </div>
                  <p className="font-semibold text-gray-500 text-sm">{b.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{b.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sin datos — mostrar placeholders */}
        {!isLoading && badges.length === 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Object.entries(BADGE_EMOJIS).map(([name, emoji]) => (
              <div key={name} className="card text-center opacity-40 border-2 border-dashed border-gray-200">
                <p className="text-4xl mb-2 grayscale">{emoji}</p>
                <p className="font-semibold text-gray-500 text-sm">{name}</p>
                <Lock className="w-4 h-4 text-gray-400 mx-auto mt-2" />
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
