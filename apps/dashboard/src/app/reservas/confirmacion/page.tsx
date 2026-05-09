'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, Clock, UserPlus } from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/auth/store'
import { RESERVAS_KEY } from '@/hooks/useReservas'
import Link from 'next/link'

function ConfirmacionContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const qc = useQueryClient()
  const { isAuthenticated } = useAuthStore()
  const reference = searchParams.get('ref') ?? ''

  const { data, isLoading } = useQuery({
    queryKey: ['wompi-ref', reference],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { status: string; amount: number; reservationNumber?: string } }>(
        `/payments/wompi/reference/${reference}`
      )
      return res.data.data
    },
    enabled: !!reference,
    refetchInterval: (data) => {
      if (!data) return 2000
      const status = (data as { status: string }).status
      return ['APPROVED', 'DECLINED', 'ERROR'].includes(status) ? false : 2000
    },
  })

  useEffect(() => {
    if (data?.status === 'APPROVED') {
      qc.invalidateQueries({ queryKey: [RESERVAS_KEY] })
    }
  }, [data?.status, qc])

  const status = data?.status
  const amountPaid = data?.amount ? data.amount / 100 : 0

  return (
    <div className="max-w-md mx-auto px-4 text-center py-20 space-y-6">
      {isLoading || !status ? (
        <>
          <PageLoader />
          <p className="text-gray-500">Verificando tu pago...</p>
        </>
      ) : status === 'APPROVED' ? (
        <>
          <div className="w-20 h-20 bg-brand-green-50 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-brand-green" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">¡Pago exitoso!</h1>
            <p className="text-gray-500 mt-2">
              Tu reserva ha sido confirmada. Recibirás un correo con todos los detalles.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-5 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Referencia</span>
              <span className="font-mono font-medium text-gray-900">{reference}</span>
            </div>
            {amountPaid > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Monto pagado</span>
                <span className="font-semibold text-brand-green">
                  {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amountPaid)}
                </span>
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <button onClick={() => router.push('/cliente/reservas')} className="btn-primary w-full">
              Ver mis reservas
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-brand-blue-50 border border-brand-blue/20 rounded-2xl p-5 text-left">
                <div className="flex items-start gap-3">
                  <UserPlus className="w-5 h-5 text-brand-blue mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Crea una cuenta gratis</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Accede al historial de tus reservas, recibe notificaciones y acumula puntos de fidelidad.
                    </p>
                  </div>
                </div>
                <Link
                  href={`/auth/register?ref=${reference}`}
                  className="btn-primary w-full mt-4 block text-center"
                >
                  Crear cuenta
                </Link>
              </div>
              <button onClick={() => router.push('/')} className="btn-ghost w-full">
                Volver al inicio
              </button>
            </div>
          )}
        </>
      ) : ['DECLINED', 'ERROR', 'VOIDED'].includes(status ?? '') ? (
        <>
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Pago rechazado</h1>
          <p className="text-gray-500">No pudimos procesar tu pago. Puedes intentarlo de nuevo.</p>
          <button onClick={() => router.back()} className="btn-primary">Intentar de nuevo</button>
        </>
      ) : (
        <>
          <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-10 h-10 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Procesando...</h1>
          <p className="text-gray-500">Tu pago está siendo verificado. Espera un momento.</p>
        </>
      )}
    </div>
  )
}

export default function ConfirmacionPage() {
  return (
    <PublicLayout>
      <Suspense fallback={<PageLoader />}>
        <ConfirmacionContent />
      </Suspense>
    </PublicLayout>
  )
}
