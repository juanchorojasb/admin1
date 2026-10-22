'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, Mail, MapPin, MessageCircle } from 'lucide-react'
import { useTourAvailability } from '@/hooks/useTours'
import { useSiteConfig } from '@/hooks/useSiteConfig'
import { useAuthStore } from '@/lib/auth/store'
import { contactoDesde, whatsappHref } from '@/lib/brand'
import { aNumero, fechaCalendario, hoyEnColombia } from '@/lib/experiencias'
import { rutaLogin } from '@/lib/navegacion'
import { formatCOP } from '@/lib/utils'

const FECHAS_VISIBLES = 6

export interface ExperienciaReserva {
  id: string
  nombre: string
  precio: number | null
  precioNino: number | null
  salidas: string[]
}

function etiquetaFecha(fecha: string, anioActual: string): string {
  const texto = fechaCalendario(fecha, fecha.slice(0, 4) === anioActual ? undefined : { year: 'numeric' })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export function TarjetaReserva({ experiencia }: { experiencia: ExperienciaReserva }) {
  const router = useRouter()
  const [hoy] = useState(hoyEnColombia)
  const { data: fechasApi, isLoading: cargandoFechas } = useTourAvailability(experiencia.id, hoy)
  const fechas = fechasApi ?? []
  const [fechaId, setFechaId] = useState<string | null>(null)
  const [verTodas, setVerTodas] = useState(false)

  // La sesión vive en localStorage: se lee al montar para no cambiar el HTML del servidor
  const [sesionActiva, setSesionActiva] = useState(false)
  useEffect(() => setSesionActiva(useAuthStore.getState().isAuthenticated), [])

  const { data: siteConfig } = useSiteConfig()
  const contacto = contactoDesde(siteConfig?.contacto)
  const consulta = `Hola, quiero información sobre la experiencia "${experiencia.nombre}".`
  const whatsapp = whatsappHref(contacto.whatsapp, consulta)
  const correo = contacto.email
    ? `mailto:${contacto.email}?subject=${encodeURIComponent(experiencia.nombre)}&body=${encodeURIComponent(consulta)}`
    : null

  // Si todas las fechas salen de la misma ciudad se muestra una vez arriba; si no, en cada fecha
  const ciudadesFechas = Array.from(new Set(fechas.map((f) => f.departureCity).filter(Boolean)))
  const ciudadPorFecha = ciudadesFechas.length > 1
  const salidas = Array.from(new Set([...experiencia.salidas, ...(ciudadPorFecha ? [] : ciudadesFechas)]))

  const seleccionada = fechas.find((f) => f.id === fechaId) ?? null
  const precioFecha = aNumero(seleccionada?.priceOverride)
  const precioAdulto = precioFecha ?? experiencia.precio
  const visibles = verTodas ? fechas : fechas.slice(0, FECHAS_VISIBLES)
  // Si hay fechas publicadas se reserva una de ellas; si no, el equipo acuerda la fecha después
  const debeElegirFecha = fechas.length > 0 && !seleccionada

  const reservar = () => {
    if (debeElegirFecha) return
    const destino = `/reservas/nueva?tour=${experiencia.id}${seleccionada ? `&avail=${seleccionada.id}` : ''}`
    router.push(useAuthStore.getState().isAuthenticated ? destino : rutaLogin(destino))
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-card-lg overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <p className="text-sm text-gray-500">{precioFecha !== null ? 'Precio por adulto en esta fecha' : 'Precio por adulto'}</p>
        {precioAdulto !== null ? (
          <p className="text-3xl font-bold text-gray-900 mt-1">{formatCOP(precioAdulto)}</p>
        ) : (
          <p className="text-lg font-semibold text-gray-900 mt-1">Precio a consultar</p>
        )}
        {experiencia.precioNino !== null && (
          <p className="text-sm text-gray-600 mt-1">Niños: {formatCOP(experiencia.precioNino)}</p>
        )}
        {salidas.length > 0 && (
          <p className="flex items-start gap-2 text-sm text-gray-600 mt-4">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-brand-green" />
            <span>Salida desde {salidas.join(', ')}</span>
          </p>
        )}
      </div>

      <div className="p-6 space-y-5">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
            <CalendarDays className="w-4 h-4 text-brand-green" /> Próximas fechas
          </p>

          {cargandoFechas ? (
            <div className="grid grid-cols-2 gap-2" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />)}
            </div>
          ) : fechas.length === 0 ? (
            <p className="text-sm text-gray-500 leading-relaxed">
              Aún no hay fechas publicadas. Reserva y acordamos la fecha contigo, o escríbenos.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                {visibles.map((f) => {
                  const agotada = f.availableSpots <= 0
                  const activa = f.id === fechaId
                  return (
                    <button
                      key={f.id}
                      type="button"
                      aria-pressed={activa}
                      disabled={agotada}
                      onClick={() => setFechaId(activa ? null : f.id)}
                      className={`text-left rounded-xl border px-3 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        activa ? 'border-brand-blue bg-brand-blue-50 ring-1 ring-brand-blue' : 'border-gray-200 hover:border-brand-blue-300'
                      }`}
                    >
                      <span className="block text-sm font-semibold text-gray-900">{etiquetaFecha(f.date, hoy.slice(0, 4))}</span>
                      <span className="block text-xs text-gray-500">
                        {agotada ? 'Agotado' : `${f.availableSpots} ${f.availableSpots === 1 ? 'cupo' : 'cupos'}`}
                      </span>
                      {ciudadPorFecha && f.departureCity && (
                        <span className="block text-xs text-gray-500 truncate">{f.departureCity}</span>
                      )}
                    </button>
                  )
                })}
              </div>
              {fechas.length > FECHAS_VISIBLES && (
                <button
                  type="button"
                  onClick={() => setVerTodas((v) => !v)}
                  className="mt-2 text-sm font-medium text-brand-blue hover:underline"
                >
                  {verTodas ? 'Ver menos fechas' : `Ver ${fechas.length - FECHAS_VISIBLES} fechas más`}
                </button>
              )}
            </>
          )}
        </div>

        <button type="button" onClick={reservar} disabled={debeElegirFecha} className="btn-primary w-full py-3 text-base">
          {debeElegirFecha ? 'Elige una fecha para reservar' : 'Reservar'}
        </button>
        {!sesionActiva && (
          <p className="text-xs text-center text-gray-500 -mt-2">
            Para completar la reserva te pediremos iniciar sesión o crear una cuenta.
          </p>
        )}

        {(whatsapp || correo) && (
          <a
            href={whatsapp ?? correo ?? undefined}
            target={whatsapp ? '_blank' : undefined}
            rel={whatsapp ? 'noopener noreferrer' : undefined}
            className="btn-outline w-full py-3 flex items-center justify-center gap-2"
          >
            {whatsapp ? <MessageCircle className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
            {whatsapp ? 'Pregúntanos por WhatsApp' : 'Escríbenos'}
          </a>
        )}
      </div>
    </div>
  )
}
