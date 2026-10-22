import type { Metadata } from 'next'
import type { ComponentType } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, Backpack, BedDouble, Bus, Check, ChevronRight, Clock, Coffee, Cookie, Gift,
  Lightbulb, MapPin, ShieldCheck, Sparkles, Ticket, TriangleAlert, UserRound, Users,
  UtensilsCrossed, X,
} from 'lucide-react'
import { obtenerExperiencia } from '@/lib/api/servidor'
import { BRAND } from '@/lib/brand'
import {
  DIFICULTAD_COLOR, DIFICULTAD_ETIQUETA, INCLUYE_ETIQUETA, TIPO_ETIQUETA,
  aNumero, duracionTexto, grupoTexto, incluyeDesde, itinerarioDesde, listaDesde,
  precioNinoVisible, resumen, type Incluye,
} from '@/lib/experiencias'
import { TarjetaReserva } from '@/components/experiencias/TarjetaReserva'
import { GaleriaExperiencia } from '@/components/experiencias/GaleriaExperiencia'
import type { Tour } from '@/types'

interface Props {
  params: { slug: string }
}

const ICONO_INCLUYE: Record<Incluye['claves'][number], ComponentType<{ className?: string }>> = {
  transport: Bus,
  breakfast: Coffee,
  lunch: UtensilsCrossed,
  snacks: Cookie,
  insurance: ShieldCheck,
  guide: UserRound,
  parkEntrance: Ticket,
  souvenir: Gift,
  accommodation: BedDouble,
}

function slugDesde(valor: string): string {
  try {
    return decodeURIComponent(valor)
  } catch {
    return valor
  }
}

/** Solo las experiencias activas son públicas. */
async function experienciaPublica(slug: string): Promise<Tour | null> {
  const tour = await obtenerExperiencia(slugDesde(slug))
  return tour?.isActive ? tour : null
}

function urlAbsoluta(ruta: string | undefined): string | undefined {
  if (!ruta) return undefined
  try {
    return new URL(ruta, BRAND.url).toString()
  } catch {
    return undefined
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tour = await experienciaPublica(params.slug).catch(() => null)
  if (!tour) return { title: `Experiencia no encontrada | ${BRAND.name}` }

  const titulo = tour.seoTitle?.trim() || `${tour.name} | ${BRAND.name}`
  const descripcion = tour.seoDescription?.trim() || resumen(tour.description) || BRAND.description
  const imagen = tour.coverImage || BRAND.logo
  const url = `/experiencias/${tour.slug}`

  // Open Graph: título, texto e imagen de la vista previa al compartir el enlace (WhatsApp, Facebook)
  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      siteName: BRAND.name,
      locale: 'es_CO',
      title: titulo,
      description: descripcion,
      images: [{ url: imagen, alt: tour.name }],
    },
    twitter: {
      card: tour.coverImage ? 'summary_large_image' : 'summary',
      title: titulo,
      description: descripcion,
      images: [imagen],
    },
  }
}

function Bloque({
  titulo,
  icono: Icono,
  children,
}: {
  titulo: string
  icono?: ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-gray-900 mb-5">
        {Icono && <Icono className="w-5 h-5 text-brand-green" />}
        {titulo}
      </h2>
      {children}
    </section>
  )
}

function ListaSimple({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-gray-700">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-green shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default async function ExperienciaPage({ params }: Props) {
  const tour = await experienciaPublica(params.slug)
  if (!tour) notFound()

  const precio = aNumero(tour.basePrice)
  const itinerario = itinerarioDesde(tour.itinerary)
  const incluye = incluyeDesde(tour.includes)
  const noIncluye = listaDesde(tour.excludes)
  const queLlevar = listaDesde(tour.whatToBring)
  const recomendaciones = listaDesde(tour.recommendations)
  const restricciones = listaDesde(tour.restrictions)
  const galeria = listaDesde(tour.gallery).filter((url) => url !== tour.coverImage)
  const hayIncluye = Boolean(incluye.claves.length > 0 || incluye.actividad || incluye.notas || noIncluye.length > 0)

  // Datos estructurados (schema.org) para buscadores
  const datosEstructurados = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tour.name,
    description: resumen(tour.description, 300) || undefined,
    image: urlAbsoluta(tour.coverImage),
    url: `${BRAND.url}/experiencias/${tour.slug}`,
    provider: { '@type': 'Organization', name: BRAND.name, url: BRAND.url },
    offers:
      precio !== null
        ? { '@type': 'Offer', price: precio, priceCurrency: 'COP', url: `${BRAND.url}/experiencias/${tour.slug}` }
        : undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados).replace(/</g, '\\u003c') }}
      />

      {/* Portada */}
      <section className="relative min-h-[420px] lg:min-h-[500px] flex items-end bg-brand-blue overflow-hidden">
        {tour.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          // text-transparent: si la imagen no carga, el texto alternativo no se dibuja sobre la portada
          <img src={tour.coverImage} alt={tour.name} className="absolute inset-0 w-full h-full object-cover text-transparent" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-blue via-brand-blue-700 to-brand-green-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />

        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
          <nav aria-label="Ruta de navegación" className="flex items-center gap-1.5 text-sm text-white/80 mb-5">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/experiencias" className="hover:text-white transition-colors">Experiencias</Link>
          </nav>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-white/90 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full">
              {TIPO_ETIQUETA[tour.tourType] ?? tour.tourType}
            </span>
            {DIFICULTAD_ETIQUETA[tour.difficulty] && (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${DIFICULTAD_COLOR[tour.difficulty]}`}>
                Dificultad {DIFICULTAD_ETIQUETA[tour.difficulty].toLowerCase()}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-3xl">{tour.name}</h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-5 text-sm text-white/90">
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{tour.destination}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{duracionTexto(tour)}</span>
            <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{grupoTexto(tour)}</span>
          </div>
        </div>
      </section>

      <section className="bg-white py-10 lg:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
          {/* En celular la tarjeta va primero; en escritorio queda fija a la derecha */}
          <aside id="reservar" className="lg:col-start-3 lg:row-start-1 scroll-mt-24">
            <div className="lg:sticky lg:top-24">
              <TarjetaReserva
                experiencia={{
                  id: tour.id,
                  nombre: tour.name,
                  precio,
                  precioNino: precioNinoVisible(tour),
                  salidas: listaDesde(tour.departureCities),
                }}
              />
            </div>
          </aside>

          <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1 space-y-12 min-w-0">
            {tour.description && (
              <Bloque titulo="Sobre la experiencia">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">{tour.description}</div>
              </Bloque>
            )}

            {itinerario.length > 0 && (
              <Bloque titulo="Itinerario" icono={Clock}>
                <ol className="relative border-l-2 border-brand-green/30 ml-2 space-y-6">
                  {itinerario.map((paso, i) => (
                    <li key={i} className="relative pl-6">
                      <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-[3px] border-brand-green" />
                      {paso.hora && <p className="text-sm font-semibold text-brand-blue">{paso.hora}</p>}
                      <p className="text-gray-700 mt-0.5">{paso.actividad}</p>
                    </li>
                  ))}
                </ol>
              </Bloque>
            )}

            {hayIncluye && (
              <Bloque titulo="Qué incluye" icono={Check}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {(incluye.claves.length > 0 || incluye.actividad) && (
                    <ul className="space-y-3">
                      {incluye.claves.map((clave) => {
                        const Icono = ICONO_INCLUYE[clave]
                        return (
                          <li key={clave} className="flex items-center gap-3 text-gray-700">
                            <span className="w-8 h-8 rounded-lg bg-brand-green/10 text-brand-green flex items-center justify-center shrink-0">
                              <Icono className="w-4 h-4" />
                            </span>
                            {INCLUYE_ETIQUETA[clave]}
                          </li>
                        )
                      })}
                      {incluye.actividad && (
                        <li className="flex items-center gap-3 text-gray-700">
                          <span className="w-8 h-8 rounded-lg bg-brand-green/10 text-brand-green flex items-center justify-center shrink-0">
                            <Sparkles className="w-4 h-4" />
                          </span>
                          {incluye.actividad}
                        </li>
                      )}
                    </ul>
                  )}
                  {noIncluye.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-3">No incluye</p>
                      <ul className="space-y-2.5">
                        {noIncluye.map((item, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-gray-600">
                            <X className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {incluye.notas && (
                  <p className="mt-5 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">{incluye.notas}</p>
                )}
              </Bloque>
            )}

            {queLlevar.length > 0 && (
              <Bloque titulo="Qué llevar" icono={Backpack}>
                <ListaSimple items={queLlevar} />
              </Bloque>
            )}

            {recomendaciones.length > 0 && (
              <Bloque titulo="Recomendaciones" icono={Lightbulb}>
                <ListaSimple items={recomendaciones} />
              </Bloque>
            )}

            {restricciones.length > 0 && (
              <Bloque titulo="Ten en cuenta" icono={TriangleAlert}>
                <ListaSimple items={restricciones} />
              </Bloque>
            )}

            {galeria.length > 0 && (
              <Bloque titulo="Galería">
                <GaleriaExperiencia imagenes={galeria} nombre={tour.name} />
              </Bloque>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
              <a href="#reservar" className="lg:hidden btn-primary text-center py-3">Ver fechas y reservar</a>
              <Link href="/experiencias" className="inline-flex items-center gap-2 text-brand-blue font-semibold hover:gap-3 transition-all">
                <ArrowLeft className="w-4 h-4" /> Ver todas las experiencias
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
