import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { UserRole, ReservationStatus, PaymentStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  cliente: 'Cliente',
  freelance: 'Revendedor',
  aliado: 'Aliado',
}

export const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-brand-blue-100 text-brand-blue-700',
  cliente: 'bg-green-100 text-green-700',
  freelance: 'bg-purple-100 text-purple-700',
  aliado: 'bg-orange-100 text-orange-700',
}

export const STATUS_LABELS: Record<ReservationStatus, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  pagada: 'Pagada',
  cancelada: 'Cancelada',
  completada: 'Completada',
}

export const STATUS_COLORS: Record<ReservationStatus, string> = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  confirmada: 'bg-blue-100 text-blue-700',
  pagada: 'bg-green-100 text-green-700',
  cancelada: 'bg-red-100 text-red-700',
  completada: 'bg-gray-100 text-gray-700',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pendiente: 'Sin pago',
  parcial: 'Anticipo pagado',
  completo: 'Pago completo',
  reembolsado: 'Reembolsado',
}

export function getDashboardPath(role: UserRole): string {
  const paths: Record<UserRole, string> = {
    admin: '/admin',
    cliente: '/cliente',
    freelance: '/freelance',
    aliado: '/aliado',
  }
  return paths[role]
}

export function generateReservationNumber(): string {
  const prefix = 'AVN'
  const year = new Date().getFullYear().toString().slice(-2)
  const random = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `${prefix}${year}-${random}`
}
