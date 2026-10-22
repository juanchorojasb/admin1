'use client'

import Link from 'next/link'
import { CloudOff } from 'lucide-react'

export default function ErrorExperiencia({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="bg-gray-50 py-24">
      <div className="max-w-xl mx-auto px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center mx-auto mb-6">
          <CloudOff className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">No pudimos cargar esta experiencia</h1>
        <p className="text-gray-600 mt-3">Es un problema temporal. Intenta de nuevo en unos segundos.</p>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <button type="button" onClick={reset} className="btn-primary px-6 py-3">Intentar de nuevo</button>
          <Link href="/experiencias" className="btn-outline px-6 py-3">Ver experiencias</Link>
        </div>
      </div>
    </section>
  )
}
