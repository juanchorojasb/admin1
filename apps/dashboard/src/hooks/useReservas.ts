'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { reservasApi, type CreateReservationPayload } from '@/lib/api/endpoints'

export const RESERVAS_KEY = 'reservas'

export function useReservas(params?: Record<string, string | number>) {
  return useQuery({
    queryKey: [RESERVAS_KEY, params],
    queryFn: async () => {
      const res = await reservasApi.list(params)
      return res.data
    },
  })
}

export function useReserva(id: string) {
  return useQuery({
    queryKey: [RESERVAS_KEY, id],
    queryFn: async () => {
      const res = await reservasApi.getOne(id)
      return res.data.data
    },
    enabled: !!id,
  })
}

export function useReservasStats() {
  return useQuery({
    queryKey: [RESERVAS_KEY, 'stats'],
    queryFn: async () => {
      const res = await reservasApi.stats()
      return res.data.data
    },
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}

export function useCreateReservation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateReservationPayload) => reservasApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [RESERVAS_KEY] })
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Error al crear la reserva')
    },
  })
}

export function useUpdateReservation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) =>
      reservasApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [RESERVAS_KEY] })
      qc.invalidateQueries({ queryKey: [RESERVAS_KEY, id] })
      toast.success('Reserva actualizada')
    },
    onError: () => toast.error('Error al actualizar la reserva'),
  })
}

export function useRegisterPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) =>
      reservasApi.registerPayment(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [RESERVAS_KEY, id] })
      qc.invalidateQueries({ queryKey: [RESERVAS_KEY, 'stats'] })
      toast.success('Pago registrado')
    },
    onError: () => toast.error('Error al registrar el pago'),
  })
}

export function useCancelReservation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => reservasApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [RESERVAS_KEY] })
      toast.success('Reserva cancelada')
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Error al cancelar')
    },
  })
}
