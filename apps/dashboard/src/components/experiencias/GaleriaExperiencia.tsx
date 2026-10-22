'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export function GaleriaExperiencia({ imagenes, nombre }: { imagenes: string[]; nombre: string }) {
  const [abierta, setAbierta] = useState<number | null>(null)
  const total = imagenes.length

  const cerrar = useCallback(() => setAbierta(null), [])
  const mover = useCallback(
    (paso: number) => setAbierta((i) => (i === null ? i : (i + paso + total) % total)),
    [total]
  )

  useEffect(() => {
    if (abierta === null) return
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar()
      if (e.key === 'ArrowRight') mover(1)
      if (e.key === 'ArrowLeft') mover(-1)
    }
    window.addEventListener('keydown', alTeclear)
    const desplazamiento = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', alTeclear)
      document.body.style.overflow = desplazamiento
    }
  }, [abierta, cerrar, mover])

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {imagenes.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => setAbierta(i)}
            aria-label={`Ampliar foto ${i + 1} de ${total}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${nombre}: foto ${i + 1}`}
              loading="lazy"
              className="w-full h-full object-cover text-transparent transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {abierta !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Fotos de ${nombre}`}
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
          onClick={cerrar}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagenes[abierta]}
            alt={`${nombre}: foto ${abierta + 1}`}
            className="max-h-[85vh] max-w-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={cerrar}
            autoFocus
            aria-label="Cerrar"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </button>
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); mover(-1) }}
                aria-label="Foto anterior"
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); mover(1) }}
                aria-label="Foto siguiente"
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/80">
                {abierta + 1} / {total}
              </p>
            </>
          )}
        </div>
      )}
    </>
  )
}
