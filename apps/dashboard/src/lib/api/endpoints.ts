import { apiClient } from './client'
import type {
  User, AuthTokens, Tour, TourAvailability,
  Reservation, DashboardStats, FreelanceDashboardStats,
  AliadoDashboardStats, PaginatedResponse, ApiResponse,
  FreelanceProfile, AliadoProfile,
} from '@/types'

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/login', { email, password }),

  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string; referralCode?: string }) =>
    apiClient.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/register', data),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/refresh', { refreshToken }),

  logout: (refreshToken: string) =>
    apiClient.post('/auth/logout', { refreshToken }),

  me: () =>
    apiClient.get<ApiResponse<User>>('/auth/me'),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.put('/auth/change-password', { currentPassword, newPassword }),
}

// ─── Tours ───────────────────────────────────────────────────────────────────

export const toursApi = {
  list: (params?: Record<string, string | number | boolean>) =>
    apiClient.get<PaginatedResponse<Tour>>('/tours', { params }),

  getOne: (id: string) =>
    apiClient.get<ApiResponse<Tour>>(`/tours/${id}`),

  getAvailability: (tourId: string, from?: string, to?: string) =>
    apiClient.get<ApiResponse<TourAvailability[]>>(`/tours/${tourId}/availability`, {
      params: { from, to },
    }),

  create: (data: Partial<Tour>) =>
    apiClient.post<ApiResponse<Tour>>('/tours', data),

  update: (id: string, data: Partial<Tour>) =>
    apiClient.put<ApiResponse<Tour>>(`/tours/${id}`, data),

  toggle: (id: string) =>
    apiClient.patch<ApiResponse<Tour>>(`/tours/${id}/toggle`),

  upsertAvailability: (tourId: string, data: object) =>
    apiClient.put<ApiResponse<TourAvailability>>(`/tours/${tourId}/availability`, data),

  bulkAvailability: (tourId: string, data: { dates: string[]; departureCity: string; totalSpots: number; priceOverride?: number }) =>
    apiClient.post<ApiResponse<TourAvailability[]>>(`/tours/${tourId}/availability/bulk`, data),
}

// ─── Reservas ─────────────────────────────────────────────────────────────────

export interface CreateReservationPayload {
  tourId: string
  availabilityId?: string
  freelanceCode?: string
  numAdults: number
  numChildren: number
  departureCity: string
  contactName: string
  contactPhone: string
  contactEmail: string
  specialRequests?: string
}

export const reservasApi = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get<PaginatedResponse<Reservation>>('/reservas', { params }),

  stats: () =>
    apiClient.get<ApiResponse<DashboardStats | FreelanceDashboardStats | AliadoDashboardStats>>('/reservas/stats'),

  getOne: (id: string) =>
    apiClient.get<ApiResponse<Reservation>>(`/reservas/${id}`),

  create: (data: CreateReservationPayload) =>
    apiClient.post<ApiResponse<Reservation>>('/reservas', data),

  update: (id: string, data: object) =>
    apiClient.put<ApiResponse<Reservation>>(`/reservas/${id}`, data),

  registerPayment: (id: string, data: object) =>
    apiClient.post<ApiResponse<object>>(`/reservas/${id}/payments`, data),

  cancel: (id: string) =>
    apiClient.post<ApiResponse<object>>(`/reservas/${id}/cancel`),
}

// ─── Usuarios ────────────────────────────────────────────────────────────────

export const usersApi = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get<PaginatedResponse<User>>('/users', { params }),

  stats: () =>
    apiClient.get<ApiResponse<{ total: number; byRole: Record<string, number>; newThisMonth: number }>>('/users/stats'),

  getOne: (id: string) =>
    apiClient.get<ApiResponse<User & { freelanceProfile?: FreelanceProfile; aliadoProfile?: AliadoProfile }>>(`/users/${id}`),

  update: (id: string, data: object) =>
    apiClient.put<ApiResponse<User>>(`/users/${id}`, data),

  toggleStatus: (id: string) =>
    apiClient.patch<ApiResponse<User>>(`/users/${id}/status`),

  updateFreelanceProfile: (id: string, data: object) =>
    apiClient.put<ApiResponse<FreelanceProfile>>(`/users/${id}/freelance-profile`, data),

  updateAliadoProfile: (id: string, data: object) =>
    apiClient.put<ApiResponse<AliadoProfile>>(`/users/${id}/aliado-profile`, data),
}

// ─── Comisiones ──────────────────────────────────────────────────────────────

export const comisionesApi = {
  list: (params?: Record<string, string | number | boolean>) =>
    apiClient.get<PaginatedResponse<object>>('/comisiones', { params }),

  summary: (freelanceId?: string) =>
    apiClient.get<ApiResponse<object>>(
      freelanceId ? `/comisiones/summary/${freelanceId}` : '/comisiones/summary'
    ),

  markAsPaid: (reservationIds: string[]) =>
    apiClient.post<ApiResponse<object>>('/comisiones/mark-paid', { reservationIds }),
}

// ─── Aliados ─────────────────────────────────────────────────────────────────

export const aliadosApi = {
  list: (params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<object>>('/aliados', { params }),

  myServices: () =>
    apiClient.get<PaginatedResponse<object>>('/aliados/my-services'),

  stats: () =>
    apiClient.get<ApiResponse<object>>('/aliados/stats'),

  verify: (id: string) =>
    apiClient.patch<ApiResponse<object>>(`/aliados/${id}/verify`),
}

// ─── Wompi ───────────────────────────────────────────────────────────────────

export const wompiApi = {
  createTransaction: (reservationId: string, data: {
    amount: number
    email: string
    fullName: string
    phone: string
    reference: string
  }) =>
    apiClient.post<ApiResponse<{ redirectUrl: string; transactionId: string; signature: string; publicKey: string }>>(
      '/payments/wompi/create', { reservationId, ...data }
    ),

  getTransaction: (transactionId: string) =>
    apiClient.get<ApiResponse<{ status: string; amount: number }>>(`/payments/wompi/transaction/${transactionId}`),
}
