'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { wompiApi } from '@/lib/api/endpoints'

interface WompiPaymentData {
  reservationId: string
  amount: number
  email: string
  fullName: string
  phone: string
  reference: string
}

export function useWompiPayment() {
  return useMutation({
    mutationFn: (data: WompiPaymentData) =>
      wompiApi.createTransaction(data.reservationId, {
        amount: data.amount,
        email: data.email,
        fullName: data.fullName,
        phone: data.phone,
        reference: data.reference,
      }),
    onError: () => toast.error('Error al iniciar el pago con Wompi'),
  })
}

export function useWompiTransaction(transactionId: string) {
  return useQuery({
    queryKey: ['wompi-transaction', transactionId],
    queryFn: async () => {
      const res = await wompiApi.getTransaction(transactionId)
      return res.data.data
    },
    enabled: !!transactionId,
    refetchInterval: (data) => {
      if (!data) return 3000
      const status = (data as { status: string }).status
      return ['APPROVED', 'DECLINED', 'ERROR', 'VOIDED'].includes(status) ? false : 3000
    },
  })
}
