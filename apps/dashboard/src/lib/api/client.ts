import axios from 'axios'
import { useAuthStore } from '@/lib/auth/store'
import { rutaLogin } from '@/lib/navegacion'
import { toCamel } from './camel'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

apiClient.interceptors.request.use((config) => {
  const tokens = useAuthStore.getState().tokens
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    response.data = toCamel(response.data)
    return response
  },
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const { tokens } = useAuthStore.getState()
      // Sin sesión no hay nada que renovar: las páginas protegidas ya redirigen al login (DashboardLayout)
      if (!tokens?.refreshToken) return Promise.reject(error)
      try {
        const { data } = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
          refreshToken: tokens.refreshToken,
        })
        useAuthStore.getState().setAuth(data.data.user, data.data.tokens)
        original.headers.Authorization = `Bearer ${data.data.tokens.accessToken}`
        return apiClient(original)
      } catch {
        useAuthStore.getState().clearAuth()
        // Sesión vencida: al volver a entrar se regresa a esta misma página
        if (!window.location.pathname.startsWith('/auth/')) {
          window.location.href = rutaLogin(window.location.pathname + window.location.search)
        }
      }
    }
    return Promise.reject(error)
  }
)
