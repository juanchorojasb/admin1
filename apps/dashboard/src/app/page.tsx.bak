'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth/store'
import { getDashboardPath, formatCOP } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { toursApi } from '@/lib/api/endpoints'
import { useSiteConfig } from '@/hooks/useSiteConfig'
import type { Tour } from '@/types'
import Link from 'next/link'
import { MapPin, Clock, Users, ChevronRight, Leaf, Mountain, Star, Phone, Mail, Instagram, Facebook } from 'lucide-react'

const DIFFICULTY_LABEL: Record<string, string> = { facil: 'Fácil', moderado: 'Moderado', dificil: 'Difícil' }
const DIFFICULTY_COLOR: Record<string, string> = { facil: 'bg-green-100 text-green-700', moderado: 'bg-yellow-100 text-yellow-700', dificil: 'bg-red-100 text-red-700' }
const TYPE_LABEL: Record<string, string> = { pasadia: 'Pasadía', '1n2d': '1N/2D', '2n3d': '2N/3D', multidia: 'Multidía' }

// Defaults para cuando la config aún no carga
const D = {
  hero: {
    badge: 'Ecoturismo en PNN Los Nevados · Colombia',
    title1: 'Descubre la naturaleza',
    title2: 'más salvaje de Colombia',
    subtitle: 'Volcanes nevados, selvas vírgenes, valles de palmas de cera y ballenas en el Pacífico. Experiencias ecoturísticas únicas con guías expertos.',
    btn1: 'Ver tours', btn2: 'Contáctanos',
    stats: [
      { icon: '🌿', label: '+9 destinos ecológicos' },
      { icon: '🦅', label: '+350 especies de aves' },
      { icon: '⭐', label: 'Guías certificados' },
    ],
  },
  parques: [
    { icon: '🏔️', name: 'PNN Los Nevados', desc: 'Volcanes y páramo', color: 'from-blue-500 to-blue-700' },
    { icon: '🌿', name: 'Selva de Florencia', desc: 'Bosque Andes-Amazonía', color: 'from-green-500 to-green-700' },
    { icon: '🌴', name: 'Valle del Cocora', desc: 'Palmas de cera', color: 'from-teal-500 to-teal-700' },
    { icon: '🐋', name: 'Bahía Solano', desc: 'Ballenas del Pacífico', color: 'from-cyan-500 to-cyan-700' },
  ],
  nosotros: {
    label: 'QUIÉNES SOMOS',
    title: 'Ecoturismo responsable en Colombia',
    text1: 'Somos una agencia especializada en experiencias ecoturísticas en el Eje Cafetero y PNN Los Nevados. Nuestro enfoque combina aventura, educación ambiental y responsabilidad con las comunidades locales.',
    text2: 'Trabajamos con guías certificados, aliados locales verificados y nos comprometemos con la conservación de los ecosistemas que visitamos.',
    stats: [{ value: '9+', label: 'Destinos' }, { value: '500+', label: 'Viajeros' }, { value: '5★', label: 'Calificación' }],
    features: [
      { icon: '🦅', title: 'Avistamiento de aves', desc: 'Más de 350 especies registradas' },
      { icon: '🌿', title: 'Conservación', desc: 'Turismo de bajo impacto' },
      { icon: '🏔️', title: 'Alta montaña', desc: 'Guías certificados en altitud' },
      { icon: '👥', title: 'Comunidades', desc: 'Apoyo a familias locales' },
    ],
  },
  cta: { title: '¿Listo para la aventura?', subtitle: 'Reserva en línea con pago seguro. Depósito del 30% para confirmar tu cupo.', whatsapp: '573000000000' },
  contacto: { phone: '+57 300 000 0000', phoneHref: '573000000000', email: 'info@avesynaturaleza.travel', instagram: '@avesynaturaleza', whatsapp: '573000000000' },
  footer: { copyright: '© 2024 Aves y Naturaleza · Ecoturismo responsable en Colombia' },
}

function g<T>(config: Record<string, unknown> | undefined, key: string, fallback: T): T {
  return (config?.[key] as T) ?? fallback
}

function tourPrice(t: Tour): number {
  return Number((t as unknown as Record<string, unknown>).base_price ?? t.basePrice ?? 0)
}

export default function LandingPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsLoggedIn(isAuthenticated && !!user)
  }, [isAuthenticated, user])

  const { data: siteConfig } = useSiteConfig()

  const { data: toursData } = useQuery({
    queryKey: ['tours-landing'],
    queryFn: async () => {
      const res = await toursApi.list({ featured: true, limit: 6 })
      return res.data
    },
  })

  const tours = (toursData?.data ?? []) as Tour[]

  const hero = g(siteConfig, 'hero', D.hero) as typeof D.hero
  const parques = g(siteConfig, 'parques', D.parques) as typeof D.parques
  const nosotros = g(siteConfig, 'nosotros', D.nosotros) as typeof D.nosotros
  const cta = g(siteConfig, 'cta', D.cta) as typeof D.cta
  const contacto = g(siteConfig, 'contacto', D.contacto) as typeof D.contacto
  const footer = g(siteConfig, 'footer', D.footer) as typeof D.footer

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-brand-green" />
            <span className="font-bold text-gray-900 text-lg">Aves y Naturaleza</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#tours" className="hover:text-brand-blue transition-colors">Tours</a>
            <a href="#parques" className="hover:text-brand-blue transition-colors">Parques</a>
            <a href="#nosotros" className="hover:text-brand-blue transition-colors">Nosotros</a>
            <a href="#contacto" className="hover:text-brand-blue transition-colors">Contacto</a>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <button onClick={() => router.push(getDashboardPath(user!.role))} className="btn-primary text-sm">
                Mi cuenta
              </button>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-brand-blue">Ingresar</Link>
                <Link href="/auth/login" className="btn-primary text-sm">Reservar</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 min-h-screen bg-brand-blue flex items-center relative overflow-hidden">
        <video
          src="/hero-1.mp4"
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
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
              <a href="#tours" className="bg-brand-green text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-brand-green-600 transition-all shadow-lg hover:shadow-xl">
                {hero.btn1}
              </a>
              <a href="#contacto" className="bg-white/20 backdrop-blur-sm text-white border border-white/30 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/30 transition-all">
                {hero.btn2}
              </a>
            </div>
            <div className="flex items-center gap-8 mt-10 text-blue-100 text-sm">
              {hero.stats.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tours destacados */}
      <section id="tours" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-brand-green font-semibold text-sm mb-2">NUESTRAS EXPERIENCIAS</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Tours Ecoturísticos</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Cada tour está diseñado para conectarte con la naturaleza colombiana de manera responsable y enriquecedora.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((t) => (
              <div key={t.id} className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-100">
                <div className="h-48 bg-gradient-to-br from-brand-blue to-brand-blue-400 relative overflow-hidden">
                  {t.coverImage ? (
                    <img src={t.coverImage} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Mountain className="w-16 h-16 text-white/30" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-brand-blue text-xs px-2.5 py-1 rounded-full font-semibold">
                    {TYPE_LABEL[t.tourType] ?? t.tourType}
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`badge text-xs ${DIFFICULTY_COLOR[t.difficulty] ?? 'bg-gray-100 text-gray-600'}`}>
                      {DIFFICULTY_LABEL[t.difficulty] ?? t.difficulty}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-brand-blue transition-colors">{t.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{t.destination}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{t.durationDays}d</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{t.minPersons}–{t.maxPersons}</span>
                  </div>
                  {t.description && <p className="text-xs text-gray-400 mb-4 line-clamp-2">{t.description}</p>}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Desde</p>
                      <p className="text-xl font-bold text-gray-900">{formatCOP(tourPrice(t))}</p>
                    </div>
                    <Link href="/auth/login" className="bg-brand-green text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-green-600 transition-colors flex items-center gap-1">
                      Reservar <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {tours.length === 0 && <div className="text-center py-12 text-gray-400">Cargando tours...</div>}
        </div>
      </section>

      {/* Parques */}
      <section id="parques" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-brand-green font-semibold text-sm mb-2">DESTINOS NATURALES</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Parques Nacionales</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Operamos en algunos de los ecosistemas más biodiversos del mundo.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {parques.map((p) => (
              <div key={p.name} className={`bg-gradient-to-br ${p.color} rounded-2xl p-6 text-white text-center hover:scale-105 transition-transform cursor-pointer`}>
                <p className="text-5xl mb-3">{p.icon}</p>
                <p className="font-bold text-sm mb-1">{p.name}</p>
                <p className="text-xs text-white/70">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nosotros */}
      <section id="nosotros" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-brand-green font-semibold text-sm mb-2">{nosotros.label}</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">{nosotros.title}</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">{nosotros.text1}</p>
              <p className="text-gray-600 mb-6 leading-relaxed">{nosotros.text2}</p>
              <div className="grid grid-cols-3 gap-4">
                {nosotros.stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-3xl font-bold text-brand-blue">{s.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {nosotros.features.map((item) => (
                <div key={item.title} className="bg-gray-50 rounded-2xl p-5 hover:bg-brand-blue-50 transition-colors">
                  <p className="text-3xl mb-3">{item.icon}</p>
                  <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-brand-blue to-brand-blue-400">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{cta.title}</h2>
          <p className="text-blue-200 text-lg mb-8">{cta.subtitle}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/login" className="bg-brand-green text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-brand-green-600 transition-all shadow-lg">
              Crear cuenta gratis
            </Link>
            <a
              href={`https://wa.me/${cta.whatsapp}?text=Hola!%20Quiero%20información%20sobre%20los%20tours`}
              target="_blank" rel="noopener noreferrer"
              className="bg-white text-brand-blue px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-lg"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Contáctanos</h2>
            <p className="text-gray-500">Estamos para ayudarte a planear tu aventura perfecta</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Phone className="w-6 h-6 text-brand-blue" />, title: 'Teléfono / WhatsApp', value: contacto.phone, href: `https://wa.me/${contacto.phoneHref}` },
              { icon: <Mail className="w-6 h-6 text-brand-green" />, title: 'Correo electrónico', value: contacto.email, href: `mailto:${contacto.email}` },
              { icon: <Instagram className="w-6 h-6 text-purple-600" />, title: 'Instagram', value: contacto.instagram, href: `https://instagram.com/${contacto.instagram.replace('@', '')}` },
            ].map((c) => (
              <a key={c.title} href={c.href} target="_blank" rel="noopener noreferrer"
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all text-center group">
                <div className="flex justify-center mb-3">{c.icon}</div>
                <p className="text-sm text-gray-400 mb-1">{c.title}</p>
                <p className="font-semibold text-gray-900 group-hover:text-brand-blue transition-colors">{c.value}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-brand-green" />
              <span className="font-bold">Aves y Naturaleza</span>
            </div>
            <p className="text-gray-400 text-sm">{footer.copyright}</p>
            <div className="flex items-center gap-4 text-gray-400">
              <a href={`https://instagram.com/${contacto.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
