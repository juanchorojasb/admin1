export type UserRole = 'admin' | 'cliente' | 'freelance' | 'aliado'
export type TourType = 'pasadia' | '1n2d' | '2n3d' | 'multidia'
export type ReservationStatus = 'pendiente' | 'confirmada' | 'pagada' | 'cancelada' | 'completada'
export type PaymentStatus = 'pendiente' | 'parcial' | 'completo' | 'reembolsado'
export type AliadoType = 'ecohotel' | 'transporte' | 'restaurante' | 'otro'

export interface User {
  id: string
  email: string
  password_hash: string
  role: UserRole
  first_name: string
  last_name: string
  phone?: string
  document_id?: string
  avatar_url?: string
  is_active: boolean
  email_verified: boolean
  referral_code?: string
  referred_by?: string
  created_at: Date
  updated_at: Date
}

export interface FreelanceProfile {
  id: string
  user_id: string
  commission_rate: number
  bank_name?: string
  bank_account?: string
  bank_account_type?: string
  total_earned: number
  total_paid: number
}

export interface AliadoProfile {
  id: string
  user_id: string
  business_name: string
  aliado_type: AliadoType
  description?: string
  address?: string
  city?: string
  nit?: string
  rating: number
  is_verified: boolean
}

export interface Tour {
  id: string
  slug: string
  name: string
  internal_name?: string
  tour_type: TourType
  destination: string
  description?: string
  itinerary?: object
  includes?: object
  excludes?: string[]
  recommendations?: string[]
  restrictions?: string[]
  what_to_bring?: string[]
  base_price: number
  price_child?: number
  departure_cities?: string[]
  duration_days: number
  min_persons: number
  max_persons: number
  difficulty: string
  cover_image?: string
  gallery?: string[]
  is_active: boolean
  is_featured: boolean
  created_at: Date
  updated_at: Date
}

export interface TourAvailability {
  id: string
  tour_id: string
  date: string
  departure_city: string
  total_spots: number
  available_spots: number
  price_override?: number
  is_active: boolean
}

export interface Reservation {
  id: string
  reservation_number: string
  user_id?: string
  tour_id: string
  availability_id?: string
  freelance_id?: string
  status: ReservationStatus
  payment_status: PaymentStatus
  num_adults: number
  num_children: number
  departure_city: string
  total_amount: number
  deposit_amount?: number
  deposit_paid_at?: Date
  balance_amount?: number
  balance_paid_at?: Date
  commission_amount: number
  commission_paid: boolean
  contact_name: string
  contact_phone: string
  contact_email: string
  special_requests?: string
  internal_notes?: string
  created_at: Date
  updated_at: Date
}

export interface JwtPayload {
  userId: string
  role: UserRole
  email: string
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}
