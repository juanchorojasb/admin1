'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { toursApi } from '@/lib/api/endpoints'

export const TOURS_KEY = 'tours'

export function useTours(params?: Record<string, string | number | boolean>) {
  return useQuery({
    queryKey: [TOURS_KEY, params],
    queryFn: async () => {
      const res = await toursApi.list(params)
      return res.data
    },
    staleTime: 2 * 60 * 1000,
  })
}

export function useTour(id: string) {
  return useQuery({
    queryKey: [TOURS_KEY, id],
    queryFn: async () => {
      const res = await toursApi.getOne(id)
      return res.data.data
    },
    enabled: !!id,
  })
}

export function useTourAvailability(tourId: string, from?: string, to?: string) {
  return useQuery({
    queryKey: [TOURS_KEY, tourId, 'availability', from, to],
    queryFn: async () => {
      const res = await toursApi.getAvailability(tourId, from, to)
      return res.data.data
    },
    enabled: !!tourId,
    staleTime: 30 * 1000,
  })
}

export function useToggleTour() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => toursApi.toggle(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TOURS_KEY] })
      toast.success('Tour actualizado')
    },
    onError: () => toast.error('Error al actualizar el tour'),
  })
}

export function useBulkAvailability(tourId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { dates: string[]; departureCity: string; totalSpots: number; priceOverride?: number }) =>
      toursApi.bulkAvailability(tourId, data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: [TOURS_KEY, tourId, 'availability'] })
      toast.success(`${res.data.data.length} fechas creadas`)
    },
    onError: () => toast.error('Error al crear las fechas'),
  })
}
