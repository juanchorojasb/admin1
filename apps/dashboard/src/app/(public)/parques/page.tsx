'use client'

import { useSiteConfig } from '@/hooks/useSiteConfig'
import { Check, ShoppingCart } from 'lucide-react'

interface ParqueItem { name: string; description: string; image: string; buyUrl: string }
interface ParquesData {
  title: string
  subtitle: string
  parques: ParqueItem[]
  beneficios: string[]
  faqs: { question: string; answer: string }[]
}

const D: ParquesData = {
  title: 'Disfruta los mejores parques temáticos de Colombia',
  subtitle: 'Compra tus entradas fácil, rápido y seguro',
  parques: [
    {
      name: 'Parque del Café',
      description: 'El parque temático más importante del Eje Cafetero. Atracciones, cultura cafetera, espectáculos y mucho más en Quindío.',
      image: '',
      buyUrl: 'https://wa.me/573206451470?text=Quiero%20comprar%20entradas%20para%20el%20Parque%20del%20Café',
    },
    {
      name: 'Panaca',
      description: 'El parque agropecuario más grande del mundo. Vive la experiencia del campo con animales, shows y diversión familiar en Quimbaya, Quindío.',
      image: '',
      buyUrl: 'https://wa.me/573206451470?text=Quiero%20comprar%20entradas%20para%20Panaca',
    },
  ],
  beneficios: [
    'Compra segura con respaldo',
    'Ingreso al parque sin filas',
    'Soporte personalizado por WhatsApp',
    'Mejores precios garantizados',
  ],
  faqs: [
    { question: '¿Cómo recibo mi entrada?', answer: 'La recibirás por correo electrónico o WhatsApp inmediatamente después de tu pago.' },
    { question: '¿Puedo cambiar la fecha?', answer: 'Sí, según las políticas de cada parque. Contáctanos para gestionarlo.' },
    { question: '¿Hay descuentos para grupos?', answer: 'Sí, para grupos de más de 10 personas tenemos tarifas especiales.' },
  ],
}

export default function ParquesPage() {
  const { data: siteConfig } = useSiteConfig()
  const data = (siteConfig?.parquesTematicos as ParquesData) ?? D

  return (
    <>
      <section className="bg-gradient-to-br from-brand-blue to-brand-green text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{data.title}</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">{data.subtitle}</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">Parques disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.parques.map((p, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all">
                <div className="h-56 bg-gradient-to-br from-brand-green to-brand-blue relative">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/40 text-7xl">🎢</div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-2xl text-gray-900 mb-3">{p.name}</h3>
                  <p className="text-gray-600 mb-5 leading-relaxed">{p.description}</p>
                  <a href={p.buyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-brand-green text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-green-600 transition-all">
                    <ShoppingCart className="w-4 h-4" /> Comprar entradas
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">¿Por qué comprar con nosotros?</h2>
            <ul className="space-y-3">
              {data.beneficios.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="bg-brand-green/10 text-brand-green rounded-full p-1 mt-0.5"><Check className="w-4 h-4" /></span>
                  <span className="text-gray-700">{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">¿Cómo funciona?</h2>
            <ol className="space-y-4">
              <li className="flex gap-4">
                <span className="bg-brand-blue text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</span>
                <div><p className="font-semibold text-gray-900">Elige el parque</p><p className="text-sm text-gray-600">Selecciona el parque que quieras visitar.</p></div>
              </li>
              <li className="flex gap-4">
                <span className="bg-brand-blue text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</span>
                <div><p className="font-semibold text-gray-900">Compra online</p><p className="text-sm text-gray-600">Realiza el pago de forma segura.</p></div>
              </li>
              <li className="flex gap-4">
                <span className="bg-brand-blue text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">3</span>
                <div><p className="font-semibold text-gray-900">Recibe tus entradas</p><p className="text-sm text-gray-600">Te llegan por correo o WhatsApp.</p></div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">Preguntas frecuentes</h2>
          <div className="space-y-4">
            {data.faqs.map((f, i) => (
              <details key={i} className="group bg-gray-50 rounded-xl p-5 cursor-pointer">
                <summary className="font-semibold text-gray-900 flex items-center justify-between">
                  {f.question}
                  <span className="text-brand-green text-xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-gray-600 mt-3">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
