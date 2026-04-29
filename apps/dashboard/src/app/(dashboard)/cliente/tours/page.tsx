'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useTours } from '@/hooks/useTours'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { formatCOP } from '@/lib/utils'
import { MapPin, Clock, Users, Star, ChevronRight, Search } from 'lucide-react'
import Link from 'next/link'
import type { Tour } from '@/types'

const DIFFICULTY_LABEL: Record<string, string> = { facil: 'Fácil', moderado: 'Moderado', dificil: 'Difícil' }
const DIFFICULTY_COLOR: Record<string, string> = { facil: 'bg-green-100 text-green-700', moderado: 'bg-yellow-100 text-yellow-700', dificil: 'bg-red-100 text-red-700' }
const TYPE_LABEL: Record<string, string> = { pasadia: 'Pasadía', '1n2d': '1 noche / 2 días', '2n3d': '2 noches / 3 días', multidia: 'Multidía' }

export default function ClienteToursPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading } = useTours({ page, limit: 12, ...(search ? { search } : {}) })

  const tours = (data?.data ?? []) as Tour[]

  return (
    <DashboardLayout requiredRole="cliente">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catálogo de tours</h1>
          <p className="text-gray-500 text-sm">Descubre nuestras experiencias ecoturísticas</p>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            className="input pl-9 w-full sm:w-80"
            placeholder="Buscar destino, nombre..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        {isLoading && <PageLoader />}

        {!isLoading && tours.length === 0 && (
          <div className="card text-center py-16">
            <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500">No encontramos tours con esos criterios</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tours.map((t) => (
            <div key={t.id} className="card p-0 overflow-hidden hover:shadow-card-lg transition-all group">
              {/* Imagen */}
              <div className="h-44 bg-gradient-to-br from-brand-blue to-brand-blue-400 relative overflow-hidden">
                {t.coverImage ? (
                  <img src={t.coverImage} alt={t.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl opacity-30">🌿</span>
                  </div>
                )}
                {t.isFeatured && (
                  <div className="absolute top-3 left-3 bg-brand-green text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    <Star className="w-3 h-3" /> Destacado
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`badge text-xs ${DIFFICULTY_COLOR[t.difficulty] ?? 'bg-gray-100 text-gray-600'}`}>
                    {DIFFICULTY_LABEL[t.difficulty] ?? t.difficulty}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-xs text-brand-blue font-medium mb-1">{TYPE_LABEL[t.tourType] ?? t.tourType}</p>
                <h3 className="font-semibold text-gray-900 leading-tight mb-2 group-hover:text-brand-blue transition-colors">
                  {t.name}
                </h3>

                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{t.destination}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{t.durationDays}d</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{t.minPersons}–{t.maxPersons}</span>
                </div>

                {t.description && (
                  <p className="text-xs text-gray-400 mb-3 line-clamp-2">{t.description}</p>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Desde</p>
                    <p className="text-lg font-bold text-gray-900">{formatCOP(t.basePrice)}</p>
                  </div>
                  <Link
                    href={`/reservas/nueva?tourId=${t.id}`}
                    className="btn-primary text-sm flex items-center gap-1"
                  >
                    Reservar <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {(data?.totalPages ?? 1) > 1 && (
          <div className="flex justify-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-ghost text-sm">← Anterior</button>
            <span className="text-sm text-gray-500 self-center">Página {page} de {data?.totalPages}</span>
            <button disabled={page >= (data?.totalPages ?? 1)} onClick={() => setPage(p => p + 1)} className="btn-ghost text-sm">Siguiente →</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
