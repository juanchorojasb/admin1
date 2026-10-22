import Link from 'next/link'
import { Leaf } from 'lucide-react'

export default function ExperienciaNoEncontrada() {
  return (
    <section className="bg-gray-50 py-24">
      <div className="max-w-xl mx-auto px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center mx-auto mb-6">
          <Leaf className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">No encontramos esta experiencia</h1>
        <p className="text-gray-600 mt-3">Puede que ya no esté disponible o que el enlace tenga un error.</p>
        <Link href="/experiencias" className="btn-primary inline-flex mt-8 px-6 py-3">
          Ver todas las experiencias
        </Link>
      </div>
    </section>
  )
}
