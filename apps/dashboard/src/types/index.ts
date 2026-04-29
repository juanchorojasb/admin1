export type UserRole = 'admin' | 'cliente' | 'freelance' | 'aliado'
export type TourType = 'pasadia' | '1n2d' | '2n3d' | 'multidia'
export type ReservationStatus = 'pendiente' | 'confirmada' | 'pagada' | 'cancelada' | 'completada'
export type PaymentStatus = 'pendiente' | 'parcial' | 'completo' | 'reembolsado'
export type AliadoType = 'ecohotel' | 'transporte' | 'restaurante' | 'otro'

export interface User {
  id: string
  email: string
  role: UserRole
  firstName: string
  lastName: string
  phone?: string
  documentId?: string
  avatarUrl?: string
  isActive: boolean
  emailVerified: boolean
  referralCode?: string
  referredBy?: string
  createdAt: string
  updatedAt: string
}

export interface FreelanceProfile {
  id: string
  userId: string
  commissionRate: number
  bankName?: string
  bankAccount?: string
  bankAccountType?: string
  totalEarned: number
  totalPaid: number
}

export interface AliadoProfile {
  id: string
  userId: string
  businessName: string
  aliadoType: AliadoType
  description?: string
  address?: string
  city?: string
  nit?: string
  rating: number
  isVerified: boolean
}

export interface TourIncludes {
  transport: boolean
  breakfast: boolean
  lunch: boolean
  snacks: boolean
  insurance: boolean
  guide: boolean
  parkEntrance: boolean
  activity?: string
  souvenir: boolean
  accommodation: boolean
  notes?: string
}

export interface Tour {
  id: string
  slug: string
  name: string
  internalName?: string
  tourType: TourType
  destination: string
  description?: string
  itinerary?: object
  includes?: TourIncludes
  excludes?: string[]
  recommendations?: string[]
  restrictions?: string[]
  whatToBring?: string[]
  basePrice: number
  priceChild?: number
  departureCities?: string[]
  durationDays: number
  minPersons: number
  maxPersons: number
  difficulty: string
  coverImage?: string
  gallery?: string[]
  isActive: boolean
  isFeatured: boolean
  createdAt: string
}

export interface TourAvailability {
  id: string
  tourId: string
  date: string
  departureCity: string
  totalSpots: number
  availableSpots: number
  priceOverride?: number
  isActive: boolean
}

export interface Reservation {
  id: string
  reservationNumber: string
  userId: string
  tourId: string
  availabilityId?: string
  freelanceId?: string
  status: ReservationStatus
  paymentStatus: PaymentStatus
  numAdults: number
  numChildren: number
  departureCity: string
  totalAmount: number
  depositAmount?: number
  depositPaidAt?: string
  balanceAmount?: number
  balancePaidAt?: string
  commissionAmount: number
  commissionPaid: boolean
  contactName: string
  contactPhone: string
  contactEmail: string
  specialRequests?: string
  internalNotes?: string
  tour?: Tour
  user?: User
  freelance?: User
  createdAt: string
  updatedAt: string
}

export interface Badge {
  id: string
  name: string
  description?: string
  icon?: string
  conditionType: string
  conditionValue: number
}

export interface UserBadge {
  userId: string
  badgeId: string
  earnedAt: string
  badge?: Badge
}

export interface DashboardStats {
  totalReservations: number
  confirmedReservations: number
  totalRevenue: number
  monthRevenue: number
  totalClients: number
  newClientsMonth: number
  conversionRate: number
  topTours: { tourName: string; count: number; revenue: number }[]
  revenueByMonth: { month: string; revenue: number }[]
  reservationsByStatus: { status: string; count: number }[]
}

export interface FreelanceDashboardStats {
  totalSales: number
  monthlySales: number
  totalCommission: number
  pendingCommission: number
  paidCommission: number
  totalClients: number
  topTour: string
  recentSales: Reservation[]
}

export interface AliadoDashboardStats {
  upcomingServices: number
  completedServices: number
  monthRevenue: number
  totalRevenue: number
  nextService?: Reservation
  recentReservations: Reservation[]
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
