'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { authApi } from '@/lib/api/endpoints'
import { useAuthStore } from '@/lib/auth/store'
import { getDashboardPath } from '@/lib/utils'

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const router = useRouter()

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (res) => {
      const { user, tokens } = res.data.data
      setAuth(user, tokens)
      toast.success(`Bienvenido, ${user.firstName}`)
      router.push(getDashboardPath(user.role))
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Credenciales incorrectas')
    },
  })
}

export function useLogout() {
  const { tokens, clearAuth } = useAuthStore()
  const router = useRouter()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: () => authApi.logout(tokens?.refreshToken ?? ''),
    onSettled: () => {
      clearAuth()
      qc.clear()
      router.replace('/auth/login')
    },
  })
}

export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const updateUser = useAuthStore((s) => s.updateUser)

  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await authApi.me()
      updateUser(res.data.data)
      return res.data.data
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })
}
