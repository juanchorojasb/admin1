'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useState } from 'react'
import { toursApi } from '@/lib/api/endpoints'
import { formatCOP } from '@/lib/utils'
import { MapPin, Clock, Users, ChevronRight, Search } from 'lucide-react'
import type { Tour } from '@/types'

const DIFFICULTY_LABEL: Record<string, string> = { facil: 'Fácil', moderado: 'Moderado', dificil: 'Difícil' }
const DIFFICULTY_COLOR: Record<string, string> = { facil: 'bg-green-100 text-green-700', moderado: 'bg-yellow-100 text-yellow-700', dificil: 'bg-red-100 text-red-700' }
const TYPE_LABEL: Record<string, string> = { pasadia: 'Pasadía', '1n2d': '1N/2D', '2n3d': '2N/3D', multidia: 'Multidía' }

export default function ExperienciasPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')

  const { data: toursData, isLoading } = useQuery({
    queryKey: ['tours-public', typeFilter],
    queryFn: async () => (await toursApi.list({ active: 'true', limit: 100, ...(typeFilter && { type: typeFilter }) })).data,
  })

  const tours = ((toursData?.data ?? []) as Tour[]).filter(t =>
    !search ||
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.destination.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-brand-blue to-brand-green text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Todas nuestras experiencias</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">Tours al Nevado del Ruiz, Cocora, Norcasia, avistamiento de aves y ballenas. Reserva fácil y seguro.</p>
        </div>
      </section>

      {/* Filtros */}
      <section className="sticky top-16 z-40 bg-white border-b border-gray-100 py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o destino..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green"
            />
          </div>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green"
          >
            <option value="">Todos los tipos</option>
            <option value="pasadia">Pasadía</option>
            <option value="1n2d">1 noche / 2 días</option>
            <option value="2n3d">2 noches / 3 días</option>
            <option value="multidia">Multidía</option>
          </select>
        </div>
      </section>

      {/* Tours grid */}
      <section className="py-12 bg-gray-50 min-h-[400px]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <p className="text-center text-gray-500 py-20">Cargando experiencias…</p>
          ) : tours.length === 0 ? (
            <p className="text-center text-gray-500 py-20">No encontramos experiencias con esos filtros.</p>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-6">{tours.length} experiencia{tours.length !== 1 ? 's' : ''}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tours.map((tour) => (
                  <Link key={tour.id} href={`/experiencias/${tour.slug}`} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all">
                    <div className="h-48 bg-gradient-to-br from-brand-blue to-brand-green relative overflow-hidden">
                      {tour.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={tour.coverImage} alt={tour.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white/30 text-6xl">🏔️</div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full">{TYPE_LABEL[tour.tourType]}</span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${DIFFICULTY_COLOR[tour.difficulty]}`}>{DIFFICULTY_LABEL[tour.difficulty]}</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-blue transition-colors">{tour.name}</h3>
                      <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                        <MapPin className="w-4 h-4" /><span className="line-clamp-1">{tour.destination}</span>
                      </div>
                      <div className="flex items-center gap-4 text-gray-500 text-xs mb-4">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {tour.durationDays}d</span>
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> hasta {tour.maxPersons}</span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500">Desde</p>
                          <p className="font-bold text-lg text-brand-blue">{formatCOP(tour.basePrice)}</p>
                        </div>
                        <span className="text-brand-green text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                          Ver más <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}
