'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import { useQuery } from '@tanstack/react-query'
import { RESERVAS_KEY } from '@/hooks/useReservas'

export default function ConfirmacionPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const qc = useQueryClient()
  const reference = searchParams.get('ref') ?? ''

  const { data, isLoading } = useQuery({
    queryKey: ['wompi-ref', reference],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { status: string; amount: number } }>(
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

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto text-center py-20 space-y-6">
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
            <h1 className="text-2xl font-bold text-gray-900">¡Pago exitoso!</h1>
            <p className="text-gray-500">
              Tu reserva ha sido confirmada. Recibirás un correo con todos los detalles.
            </p>
            <p className="text-xs text-gray-400 font-mono">Ref: {reference}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => router.push('/cliente/reservas')} className="btn-primary">
                Ver mis reservas
              </button>
            </div>
          </>
        ) : ['DECLINED', 'ERROR', 'VOIDED'].includes(status ?? '') ? (
          <>
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Pago rechazado</h1>
            <p className="text-gray-500">
              No pudimos procesar tu pago. Puedes intentarlo de nuevo.
            </p>
            <button onClick={() => router.back()} className="btn-primary">
              Intentar de nuevo
            </button>
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
    </DashboardLayout>
  )
}
