'use client'

import { useSiteConfig } from '@/hooks/useSiteConfig'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BlogArticle { title: string; excerpt: string; image: string; link: string }
interface BlogData {
  title: string
  subtitle: string
  articles: BlogArticle[]
}

const D: BlogData = {
  title: 'Inspírate y planea tu próxima aventura',
  subtitle: 'Guías, tips y destinos para viajar por Colombia',
  articles: [
    { title: 'Qué llevar al Nevado del Ruiz', excerpt: 'Lista completa de equipo y ropa esencial para tu visita al volcán.', image: '', link: '/experiencias' },
    { title: 'Clima en el Nevado del Ruiz', excerpt: 'Cuándo es la mejor época para visitar y qué condiciones esperar.', image: '', link: '/experiencias' },
    { title: 'Mejor época para visitar Cocora', excerpt: 'Descubre cuándo el Valle del Cocora luce su mejor cara.', image: '', link: '/experiencias' },
    { title: 'Qué hacer en Norcasia', excerpt: 'Guía completa del paraíso escondido de Caldas.', image: '', link: '/experiencias' },
    { title: 'Guía para ver ballenas en Colombia', excerpt: 'Todo lo que necesitas saber sobre la temporada de ballenas.', image: '', link: '/experiencias' },
    { title: 'Mejores destinos de naturaleza en Colombia', excerpt: 'Top 10 de lugares imperdibles para amantes de la naturaleza.', image: '', link: '/experiencias' },
  ],
}

export default function BlogPage() {
  const { data: siteConfig } = useSiteConfig()
  const data = (siteConfig?.blog as BlogData) ?? D

  return (
    <>
      <section className="bg-gradient-to-br from-emerald-600 to-brand-blue text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{data.title}</h1>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto">{data.subtitle}</p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.articles.map((a, i) => (
              <Link key={i} href={a.link} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all">
                <div className="h-44 bg-gradient-to-br from-emerald-400 to-teal-500 relative">
                  {a.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.image} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/40 text-5xl">📖</div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-blue transition-colors">{a.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{a.excerpt}</p>
                  <span className="text-brand-green text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Leer más <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-brand-blue text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">¿Te gustó? Vive la experiencia</h2>
          <p className="text-blue-100 mb-8">Planea tu próxima aventura con nosotros y descubre Colombia desde adentro.</p>
          <Link href="/experiencias" className="inline-flex items-center gap-2 bg-brand-green text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-brand-green-600 transition-all shadow-lg">
            Ver experiencias <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  )
}
