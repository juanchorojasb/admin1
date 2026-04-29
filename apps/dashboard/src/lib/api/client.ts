import axios from 'axios'
import { useAuthStore } from '@/lib/auth/store'

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
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const { tokens } = useAuthStore.getState()
        const { data } = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
          refreshToken: tokens?.refreshToken,
        })
        useAuthStore.getState().setAuth(data.data.user, data.data.tokens)
        original.headers.Authorization = `Bearer ${data.data.tokens.accessToken}`
        return apiClient(original)
      } catch {
        useAuthStore.getState().clearAuth()
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)
