'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { usersApi } from '@/lib/api/endpoints'

export const USERS_KEY = 'users'

export function useUsers(params?: Record<string, string | number>) {
  return useQuery({
    queryKey: [USERS_KEY, params],
    queryFn: async () => {
      const res = await usersApi.list(params)
      return res.data
    },
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: [USERS_KEY, id],
    queryFn: async () => {
      const res = await usersApi.getOne(id)
      return res.data.data
    },
    enabled: !!id,
  })
}

export function useUserStats() {
  return useQuery({
    queryKey: [USERS_KEY, 'stats'],
    queryFn: async () => {
      const res = await usersApi.stats()
      return res.data.data
    },
    staleTime: 2 * 60 * 1000,
  })
}

export function useToggleUserStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersApi.toggleStatus(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [USERS_KEY] })
      toast.success('Estado de usuario actualizado')
    },
    onError: () => toast.error('Error al actualizar el usuario'),
  })
}
