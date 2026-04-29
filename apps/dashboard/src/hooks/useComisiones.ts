'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { comisionesApi } from '@/lib/api/endpoints'

export const COMISIONES_KEY = 'comisiones'

export function useComisiones(params?: Record<string, string | number | boolean>) {
  return useQuery({
    queryKey: [COMISIONES_KEY, params],
    queryFn: async () => {
      const res = await comisionesApi.list(params)
      return res.data
    },
  })
}

export function useFreelanceSummary(freelanceId?: string) {
  return useQuery({
    queryKey: [COMISIONES_KEY, 'summary', freelanceId],
    queryFn: async () => {
      const res = await comisionesApi.summary(freelanceId)
      return res.data.data as {
        summary: {
          total_earned: string
          pending: string
          paid: string
          this_month: string
          total_sales: string
          monthly_sales: string
          unique_clients: string
        }
        monthly: { month: string; sales: string; commission: string }[]
        recent: { reservation_number: string; commission_amount: string; commission_paid: boolean; created_at: string; tour_name: string }[]
      }
    },
    staleTime: 60 * 1000,
  })
}

export function useMarkCommissionsPaid() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => comisionesApi.markAsPaid(ids),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: [COMISIONES_KEY] })
      const data = res.data.data as { updated: number; totalPaid: number }
      toast.success(`${data.updated} comisiones liquidadas · $${data.totalPaid.toLocaleString('es-CO')}`)
    },
    onError: () => toast.error('Error al liquidar comisiones'),
  })
}
