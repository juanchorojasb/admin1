'use client'

import { useSiteConfig } from '@/hooks/useSiteConfig'
import { MessageCircle } from 'lucide-react'

interface Producto { name: string; description: string; image: string; price: string }
interface SouvenirsData {
  title: string
  subtitle: string
  productos: Producto[]
  features: { icon: string; text: string }[]
  whatsapp: string
}

const D: SouvenirsData = {
  title: 'Lleva contigo un recuerdo de la naturaleza',
  subtitle: 'Productos personalizados con diseños únicos inspirados en Colombia',
  productos: [
    { name: 'Pocillos con fotos del Nevado', description: 'Cerámica de alta calidad con imágenes del PNN Los Nevados.', image: '', price: 'Desde $35.000' },
    { name: 'Camisetas', description: 'Algodón premium con diseños exclusivos de naturaleza colombiana.', image: '', price: 'Desde $55.000' },
    { name: 'Gorras', description: 'Bordadas con el logo de Aves y Naturaleza.', image: '', price: 'Desde $40.000' },
    { name: 'Sacos', description: 'Sudaderas térmicas ideales para montaña.', image: '', price: 'Desde $95.000' },
    { name: 'Artesanías', description: 'Hechas por artesanos locales del Eje Cafetero.', image: '', price: 'Desde $25.000' },
  ],
  features: [
    { icon: '🎨', text: 'Diseños únicos' },
    { icon: '✨', text: 'Personalización' },
    { icon: '❤️', text: 'Hecho con pasión' },
    { icon: '🌿', text: 'Inspirado en la naturaleza' },
  ],
  whatsapp: 'https://wa.me/573206451470?text=Hola,%20quiero%20personalizar%20un%20souvenir',
}

export default function SouvenirsPage() {
  const { data: siteConfig } = useSiteConfig()
  const data = (siteConfig?.souvenirs as SouvenirsData) ?? D

  return (
    <>
      <section className="bg-gradient-to-br from-brand-green to-brand-blue text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{data.title}</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">{data.subtitle}</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">Nuestros productos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.productos.map((p, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all">
                <div className="h-48 bg-gradient-to-br from-amber-100 to-orange-100 relative">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-amber-300 text-6xl">🎁</div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{p.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{p.description}</p>
                  <p className="font-bold text-brand-blue">{p.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Personaliza tu producto</h2>
          <p className="text-gray-600 mb-8">Elige tu diseño o envíanos tu foto favorita de naturaleza. Trabajamos con fotos, frases y logos personalizados.</p>
          <a href={data.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-brand-green text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-brand-green-600 transition-all shadow-lg">
            <MessageCircle className="w-5 h-5" /> Personalizar ahora
          </a>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">¿Por qué nuestros souvenirs?</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {data.features.map((f, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl mb-3">{f.icon}</div>
                <p className="font-semibold text-gray-900">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">¿Cómo comprar?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-brand-blue text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">1</div>
              <p className="font-semibold text-gray-900 mb-1">Elige el producto</p>
              <p className="text-sm text-gray-600">Selecciona lo que más te guste.</p>
            </div>
            <div className="text-center">
              <div className="bg-brand-blue text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">2</div>
              <p className="font-semibold text-gray-900 mb-1">Personalízalo</p>
              <p className="text-sm text-gray-600">Envíanos tu diseño o foto.</p>
            </div>
            <div className="text-center">
              <div className="bg-brand-blue text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">3</div>
              <p className="font-semibold text-gray-900 mb-1">Recíbelo en casa</p>
              <p className="text-sm text-gray-600">Envío nacional.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
