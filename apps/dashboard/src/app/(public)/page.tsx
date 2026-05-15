'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { toursApi } from '@/lib/api/endpoints'
import { useSiteConfig } from '@/hooks/useSiteConfig'
import { formatCOP } from '@/lib/utils'
import { MapPin, Clock, Users, ChevronRight, Star } from 'lucide-react'
import type { Tour } from '@/types'

const DIFFICULTY_LABEL: Record<string, string> = { facil: 'Fácil', moderado: 'Moderado', dificil: 'Difícil' }
const DIFFICULTY_COLOR: Record<string, string> = { facil: 'bg-green-100 text-green-700', moderado: 'bg-yellow-100 text-yellow-700', dificil: 'bg-red-100 text-red-700' }
const TYPE_LABEL: Record<string, string> = { pasadia: 'Pasadía', '1n2d': '1N/2D', '2n3d': '2N/3D', multidia: 'Multidía' }

const D = {
  hero: {
    badge: 'Ecoturismo en PNN Los Nevados · Colombia',
    title1: 'Descubre la naturaleza',
    title2: 'más salvaje de Colombia',
    subtitle: 'Volcanes nevados, selvas vírgenes, valles de palmas de cera y ballenas en el Pacífico.',
    btn1: 'Ver experiencias', btn2: 'Contáctanos',
    stats: [
      { icon: '🌿', label: '+9 destinos ecológicos' },
      { icon: '🦅', label: '+350 especies de aves' },
      { icon: '⭐', label: 'Guías certificados' },
    ],
  },
  nosotros: {
    label: 'POR QUÉ ELEGIRNOS', title: 'Ecoturismo responsable en Colombia',
    text1: 'Somos una agencia especializada en experiencias ecoturísticas en el Eje Cafetero y PNN Los Nevados.',
    text2: 'Trabajamos con guías certificados, aliados locales verificados y nos comprometemos con la conservación.',
    stats: [{ value: '9+', label: 'Destinos' }, { value: '500+', label: 'Viajeros' }, { value: '5★', label: 'Calificación' }],
    features: [
      { icon: '🌿', title: 'Turismo responsable', desc: 'Impacto positivo en comunidades' },
      { icon: '🧭', title: 'Guías expertos', desc: 'Certificados en alta montaña' },
      { icon: '🔒', title: 'Reserva segura', desc: 'Pagos protegidos con Wompi' },
      { icon: '⭐', title: 'Experiencias personalizadas', desc: 'Adaptadas a tu grupo' },
    ],
  },
}

interface HeroStat { icon: string; label: string }
interface HeroData { badge: string; title1: string; title2: string; subtitle: string; btn1: string; btn2: string; stats: HeroStat[] }
interface NosotrosData {
  label: string; title: string; text1: string; text2: string
  stats: { value: string; label: string }[]
  features: { icon: string; title: string; desc: string }[]
}

export default function HomePage() {
  const { data: siteConfig } = useSiteConfig()
  const hero = (siteConfig?.hero as HeroData) ?? D.hero
  const nosotros = (siteConfig?.nosotros as NosotrosData) ?? D.nosotros

  const { data: toursData } = useQuery({
    queryKey: ['tours-landing'],
    queryFn: async () => (await toursApi.list({ featured: true, limit: 6 })).data,
  })
  const tours = (toursData?.data ?? []) as Tour[]

  return (
    <>
      {/* Hero */}
      <section className="min-h-[80vh] bg-brand-blue flex items-center relative overflow-hidden">
        <video src="/hero-1.mp4" autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent z-10" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full mb-6">
              <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span>{hero.badge}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              {hero.title1}<br />
              <span className="text-brand-green">{hero.title2}</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">{hero.subtitle}</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/experiencias" className="bg-brand-green text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-brand-green-600 transition-all shadow-lg hover:shadow-xl">
                {hero.btn1}
              </Link>
              <a href="https://wa.me/573206451470" target="_blank" rel="noopener noreferrer" className="bg-white/20 backdrop-blur-sm text-white border border-white/30 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/30 transition-all">
                {hero.btn2}
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-6 mt-10 text-blue-100 text-sm">
              {hero.stats.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xl">{s.icon}</span>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Experiencias destacadas */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-brand-green font-semibold text-sm tracking-wider mb-2">EXPERIENCIAS DESTACADAS</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Vive Colombia desde adentro</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Nuestros tours más populares, con todo incluido y guías locales especializados.</p>
          </div>

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

          <div className="text-center mt-10">
            <Link href="/experiencias" className="inline-flex items-center gap-2 text-brand-blue font-semibold hover:gap-3 transition-all">
              Ver todas las experiencias <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Por qué elegirnos */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-brand-green font-semibold text-sm tracking-wider mb-2">{nosotros.label}</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">{nosotros.title}</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">{nosotros.text1}</p>
              <p className="text-gray-600 mb-8 leading-relaxed">{nosotros.text2}</p>
              <div className="grid grid-cols-3 gap-4">
                {nosotros.stats.map((s, i) => (
                  <div key={i} className="text-center">
                    <p className="text-3xl font-bold text-brand-blue mb-1">{s.value}</p>
                    <p className="text-sm text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {nosotros.features.map((f, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100">
                  <div className="text-3xl mb-3">{f.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
