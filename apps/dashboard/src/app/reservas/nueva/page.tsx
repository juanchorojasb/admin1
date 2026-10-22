'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { WompiButton } from '@/components/ui/WompiButton'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { useTour, useTourAvailability } from '@/hooks/useTours'
import { useCreateReservation } from '@/hooks/useReservas'
import { useWompiPayment } from '@/hooks/useWompi'
import { useAuthStore } from '@/lib/auth/store'
import { aNumero, fechaCalendario } from '@/lib/experiencias'
import { formatCOP } from '@/lib/utils'
import { CalendarDays, Users, MapPin, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react'

const schema = z.object({
  numAdults: z.number().int().min(1, 'Mínimo 1 adulto'),
  numChildren: z.number().int().min(0).default(0),
  departureCity: z.string().min(2, 'Selecciona ciudad de salida'),
  contactName: z.string().min(3, 'Nombre requerido'),
  contactPhone: z.string().regex(/^[0-9]{10}$/, '10 dígitos sin espacios'),
  contactEmail: z.string().email('Correo inválido'),
  specialRequests: z.string().max(300).optional(),
  paymentType: z.enum(['deposit', 'full']),
  freelanceCode: z.string().optional(),
})

type FormData = z.infer<typeof schema>
type Step = 'form' | 'payment' | 'success'

function NuevaReservaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const tourId = searchParams.get('tour') ?? searchParams.get('tourId') ?? ''
  const availId = searchParams.get('avail') ?? undefined

  const { data: tour, isLoading: tourLoading } = useTour(tourId)
  const createReservation = useCreateReservation()
  const wompiPayment = useWompiPayment()

  const [step, setStep] = useState<Step>('form')
  const [createdReservation, setCreatedReservation] = useState<{
    id: string; reservationNumber: string; totalAmount: number; depositAmount: number
  } | null>(null)
  const [wompiConfig, setWompiConfig] = useState<object | null>(null)

  // Fecha elegida en la página de la experiencia (?avail=)
  const { data: fechas, isLoading: cargandoFechas } = useTourAvailability(availId ? (tour?.id ?? '') : '')
  const selectedAvail = availId ? (fechas ?? []).find((f) => f.id === availId) ?? null : null
  const fechaNoDisponible = Boolean(availId) && fechas !== undefined && selectedAvail === null
  // Mientras llega la fecha no se muestra el formulario: así el precio y la ciudad no cambian en pantalla
  const esperandoFecha = Boolean(availId) && cargandoFechas

  // Sin ciudades de salida (experiencias en el lugar), el punto de encuentro es el destino
  const ciudadesTour = (tour?.departureCities ?? []).filter(Boolean)
  const ciudades = Array.from(new Set([...ciudadesTour, selectedAvail?.departureCity ?? ''].filter(Boolean)))
  const opcionesCiudad = ciudades.length > 0 ? ciudades : tour ? [tour.destination] : []

  const { register, handleSubmit, watch, setValue, getValues, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      numAdults: 1, numChildren: 0, paymentType: 'deposit',
      contactName: user ? `${user.firstName} ${user.lastName}` : '',
      contactEmail: user?.email ?? '',
      contactPhone: user?.phone ?? '',
    },
  })

  // Preseleccionar la ciudad de la fecha elegida, o la única opción disponible
  const ciudadPreferida = esperandoFecha
    ? ''
    : selectedAvail?.departureCity || (opcionesCiudad.length === 1 ? opcionesCiudad[0] : '')
  const opcionesClave = opcionesCiudad.join('|')
  useEffect(() => {
    if (!ciudadPreferida) return
    const actual = getValues('departureCity')
    if (!actual || !opcionesClave.split('|').includes(actual)) setValue('departureCity', ciudadPreferida)
  }, [ciudadPreferida, opcionesClave, getValues, setValue])

  const numAdults = watch('numAdults') || 1
  const numChildren = watch('numChildren') || 0
  const paymentType = watch('paymentType')
  // Mismo cálculo que el API (reservas.service): precio de la fecha si tiene uno propio
  const unitPrice = aNumero(selectedAvail?.priceOverride) ?? aNumero(tour?.basePrice) ?? 0
  const childPrice = aNumero(tour?.priceChild) ?? unitPrice * 0.7
  const total = numAdults * unitPrice + numChildren * childPrice
  const deposit = Math.ceil(total * 0.3)
  const payAmount = paymentType === 'full' ? total : deposit

  const onSubmit = async (data: FormData) => {
    try {
      const res = await createReservation.mutateAsync({
        tourId: tour?.id ?? tourId, availabilityId: selectedAvail?.id,
        numAdults: data.numAdults, numChildren: data.numChildren,
        departureCity: data.departureCity, contactName: data.contactName,
        contactPhone: data.contactPhone, contactEmail: data.contactEmail,
        specialRequests: data.specialRequests, freelanceCode: data.freelanceCode,
      })
      const reservation = res.data.data as typeof createdReservation
      setCreatedReservation(reservation)
      const reference = `${reservation!.reservationNumber}-${data.paymentType === 'full' ? 'FULL' : 'DEP'}`
      const wompiRes = await wompiPayment.mutateAsync({
        reservationId: reservation!.id, amount: payAmount,
        email: data.contactEmail, fullName: data.contactName,
        phone: data.contactPhone, reference,
      })
      setWompiConfig(wompiRes.data.data)
      setStep('payment')
    } catch { /* Error manejado por el hook */ }
  }

  if (tourLoading || esperandoFecha) return <PageLoader />
  if (!tour) return <p className="text-center py-20 text-gray-400">Tour no encontrado</p>

  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="w-20 h-20 bg-brand-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-brand-green" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">¡Reserva confirmada!</h1>
        <p className="text-gray-500 mt-2">Tu reserva <strong>{createdReservation?.reservationNumber}</strong> ha sido procesada.</p>
        <div className="mt-6 flex gap-3 justify-center">
          <button onClick={() => router.push('/cliente/reservas')} className="btn-primary">Ver mis reservas</button>
          <button onClick={() => router.push('/')} className="btn-ghost">Inicio</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/experiencias" className="hover:text-gray-600">Experiencias</Link><ChevronRight className="w-4 h-4" />
        <Link href={`/experiencias/${tour.slug}`} className="text-gray-900 font-medium hover:text-brand-blue">{tour.name}</Link><ChevronRight className="w-4 h-4" />
        <span className="text-brand-blue">Reservar</span>
      </div>
      {fechaNoDisponible && (
        <div className="flex items-start gap-2 p-4 bg-yellow-50 rounded-xl text-sm text-yellow-800">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            La fecha que elegiste ya no está disponible.{' '}
            <Link href={`/experiencias/${tour.slug}`} className="font-semibold underline">Elige otra fecha</Link>
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-3 space-y-4">
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Datos de contacto</h2>
            <form id="reservation-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Adultos</label>
                  <input {...register('numAdults', { valueAsNumber: true })} type="number" min="1" className="input" />
                  {errors.numAdults && <p className="text-xs text-red-500 mt-1">{errors.numAdults.message}</p>}
                </div>
                <div>
                  <label className="label">Niños</label>
                  <input {...register('numChildren', { valueAsNumber: true })} type="number" min="0" className="input" />
                </div>
              </div>
              <div>
                <label className="label">{ciudades.length > 0 ? 'Ciudad de salida' : 'Punto de encuentro'}</label>
                <select {...register('departureCity')} className="input">
                  <option value="">Selecciona...</option>
                  {opcionesCiudad.map((city) => <option key={city} value={city}>{city}</option>)}
                </select>
                {errors.departureCity && <p className="text-xs text-red-500 mt-1">{errors.departureCity.message}</p>}
              </div>
              <div>
                <label className="label">Nombre completo</label>
                <input {...register('contactName')} className="input" placeholder="Juan Pérez" />
                {errors.contactName && <p className="text-xs text-red-500 mt-1">{errors.contactName.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Teléfono</label>
                  <input {...register('contactPhone')} className="input" placeholder="3001234567" />
                  {errors.contactPhone && <p className="text-xs text-red-500 mt-1">{errors.contactPhone.message}</p>}
                </div>
                <div>
                  <label className="label">Correo</label>
                  <input {...register('contactEmail')} type="email" className="input" placeholder="tu@correo.com" />
                  {errors.contactEmail && <p className="text-xs text-red-500 mt-1">{errors.contactEmail.message}</p>}
                </div>
              </div>
              <div>
                <label className="label">Solicitudes especiales</label>
                <textarea {...register('specialRequests')} className="input" rows={2} />
              </div>
              <div>
                <label className="label">Código de revendedor (opcional)</label>
                <input {...register('freelanceCode')} className="input" placeholder="Ej: ANDREAF-AVN" />
              </div>
            </form>
          </div>
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-3">¿Cómo quieres pagar?</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'deposit', label: 'Anticipo 30%', desc: `${formatCOP(deposit)} ahora`, badge: 'Recomendado' },
                { value: 'full', label: 'Pago completo', desc: `${formatCOP(total)} ahora`, badge: '' },
              ].map((opt) => (
                <label key={opt.value} className={`relative flex flex-col gap-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentType === opt.value ? 'border-brand-blue bg-brand-blue-50' : 'border-gray-200'}`}>
                  <input {...register('paymentType')} type="radio" value={opt.value} className="sr-only" />
                  {opt.badge && <span className="absolute top-2 right-2 text-xs bg-brand-green text-white px-1.5 py-0.5 rounded-full">{opt.badge}</span>}
                  <span className="font-semibold text-gray-900 text-sm">{opt.label}</span>
                  <span className="text-xs text-gray-500">{opt.desc}</span>
                </label>
              ))}
            </div>
            <div className="mt-3 flex items-start gap-2 p-3 bg-yellow-50 rounded-lg text-xs text-yellow-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              El saldo restante debe pagarse 24 horas antes del tour.
            </div>
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="card sticky top-6">
            <h2 className="font-semibold text-gray-900 mb-3">Resumen</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 pb-3 border-b border-gray-100">
                <MapPin className="w-4 h-4 text-brand-blue mt-0.5 shrink-0" />
                <div><p className="font-medium">{tour.name}</p><p className="text-gray-400 text-xs">{tour.destination}</p></div>
              </div>
              {selectedAvail && (
                <div className="flex items-center gap-2 text-gray-500">
                  <CalendarDays className="w-4 h-4" />
                  <span className="inline-block first-letter:uppercase">{fechaCalendario(selectedAvail.date, { weekday: 'long', month: 'long', year: 'numeric' })}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-500">
                <Users className="w-4 h-4" />{numAdults} adulto{numAdults > 1 ? 's' : ''}{numChildren > 0 && ` · ${numChildren} niño${numChildren > 1 ? 's' : ''}`}
              </div>
              <div className="pt-3 border-t border-gray-100 space-y-1.5">
                <div className="flex justify-between text-gray-500"><span>{numAdults} × adulto</span><span>{formatCOP(numAdults * unitPrice)}</span></div>
                {numChildren > 0 && <div className="flex justify-between text-gray-500"><span>{numChildren} × niño</span><span>{formatCOP(numChildren * childPrice)}</span></div>}
                <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-100"><span>Total</span><span>{formatCOP(total)}</span></div>
                {paymentType === 'deposit' && <div className="flex justify-between text-brand-blue font-semibold"><span>Pagas ahora (30%)</span><span>{formatCOP(deposit)}</span></div>}
              </div>
            </div>
            {step === 'form' ? (
              <button type="submit" form="reservation-form" disabled={isSubmitting || fechaNoDisponible} className="btn-primary w-full mt-4 py-3">
                {isSubmitting ? 'Creando reserva...' : 'Continuar al pago'}
              </button>
            ) : (
              wompiConfig && (
                <div className="mt-4">
                  <p className="text-xs text-gray-400 text-center mb-3">Pago seguro procesado por Wompi</p>
                  <WompiButton
                    config={wompiConfig as Parameters<typeof WompiButton>[0]['config']}
                    label={`Pagar ${formatCOP(payAmount)}`}
                    onSuccess={() => setStep('success')}
                    onError={() => toast.error('Pago rechazado. Intenta de nuevo.')}
                  />
                </div>
              )
            )}
            <p className="text-xs text-center text-gray-400 mt-3">🔒 Pago seguro · SSL · Wompi Colombia</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NuevaReservaPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<PageLoader />}>
        <NuevaReservaContent />
      </Suspense>
    </DashboardLayout>
  )
}
