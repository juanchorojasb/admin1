'use client'

import { useSiteConfig } from '@/hooks/useSiteConfig'
import { Check, MessageCircle } from 'lucide-react'

interface Vehiculo { name: string; capacity: string; description: string; image: string }
interface TransporteData {
  title: string
  subtitle: string
  vehiculos: Vehiculo[]
  usos: string[]
  beneficios: string[]
  whatsapp: string
}

const D: TransporteData = {
  title: 'Transporte turístico cómodo y seguro en el Eje Cafetero',
  subtitle: 'Vehículos para todos los grupos, con conductores profesionales',
  vehiculos: [
    { name: 'Duster', capacity: 'Hasta 4 pasajeros', description: 'Ideal para grupos pequeños y viajes familiares.', image: '' },
    { name: 'H1', capacity: 'Hasta 10 pasajeros', description: 'Perfecto para grupos medianos y viajes corporativos.', image: '' },
    { name: 'Master', capacity: 'Hasta 15 pasajeros', description: 'La mejor opción para grupos grandes y eventos.', image: '' },
  ],
  usos: [
    'Traslado a aeropuertos',
    'Traslado para tours',
    'Servicios privados',
    'Eventos y grupos',
  ],
  beneficios: [
    'Conductores profesionales',
    'Vehículos cómodos y modernos',
    'Puntualidad garantizada',
    'Atención personalizada',
  ],
  whatsapp: 'https://wa.me/573206451470?text=Hola,%20quiero%20cotizar%20un%20servicio%20de%20transporte',
}

export default function TransportePage() {
  const { data: siteConfig } = useSiteConfig()
  const data = (siteConfig?.transporte as TransporteData) ?? D

  return (
    <>
      <section className="bg-gradient-to-br from-brand-blue to-brand-green text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{data.title}</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">{data.subtitle}</p>
          <a href={data.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-brand-blue px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-lg">
            <MessageCircle className="w-5 h-5" /> Cotizar transporte
          </a>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">Nuestros vehículos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.vehiculos.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all">
                <div className="h-48 bg-gradient-to-br from-gray-700 to-gray-900 relative">
                  {v.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.image} alt={v.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/30 text-6xl">🚐</div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-xl text-gray-900 mb-1">{v.name}</h3>
                  <p className="text-brand-green font-semibold text-sm mb-3">{v.capacity}</p>
                  <p className="text-gray-600 text-sm">{v.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">¿Para qué puedes usar nuestro transporte?</h2>
            <ul className="space-y-3">
              {data.usos.map((u, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="bg-brand-blue/10 text-brand-blue rounded-full p-1 mt-0.5"><Check className="w-4 h-4" /></span>
                  <span className="text-gray-700">{u}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">¿Por qué viajar con nosotros?</h2>
            <ul className="space-y-3">
              {data.beneficios.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="bg-brand-green/10 text-brand-green rounded-full p-1 mt-0.5"><Check className="w-4 h-4" /></span>
                  <span className="text-gray-700">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Solicita tu cotización</h2>
          <p className="text-gray-600 mb-8">Cuéntanos sobre tu viaje y te enviamos una propuesta personalizada por WhatsApp.</p>
          <a href={data.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-brand-green text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-brand-green-600 transition-all shadow-lg">
            <MessageCircle className="w-5 h-5" /> Reserva tu transporte por WhatsApp
          </a>
        </div>
      </section>
    </>
  )
}
