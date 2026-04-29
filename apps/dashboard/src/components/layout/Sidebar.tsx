'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/auth/store'
import { ROLE_LABELS } from '@/lib/utils'
import {
  LayoutDashboard, CalendarDays, Users, Map, Settings,
  LogOut, Leaf, TrendingUp, Package, Truck, ShoppingBag,
  Award, DollarSign, Share2, BookOpen, UserCheck,
  Building2, Star, Bell,
} from 'lucide-react'
import type { UserRole } from '@/types'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  admin: [
    { label: 'Resumen', href: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Reservas', href: '/admin/reservas', icon: <CalendarDays className="w-4 h-4" /> },
    { label: 'Tours', href: '/admin/tours', icon: <Map className="w-4 h-4" /> },
    { label: 'Clientes', href: '/admin/clientes', icon: <Users className="w-4 h-4" /> },
    { label: 'Revendedores', href: '/admin/freelancers', icon: <Share2 className="w-4 h-4" /> },
    { label: 'Aliados', href: '/admin/aliados', icon: <Building2 className="w-4 h-4" /> },
    { label: 'Comisiones', href: '/admin/comisiones', icon: <DollarSign className="w-4 h-4" /> },
    { label: 'Blog', href: '/admin/blog', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Souvenirs', href: '/admin/souvenirs', icon: <ShoppingBag className="w-4 h-4" /> },
    { label: 'Reportes', href: '/admin/reportes', icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Configuración', href: '/admin/configuracion', icon: <Settings className="w-4 h-4" /> },
  ],
  cliente: [
    { label: 'Inicio', href: '/cliente', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Mis reservas', href: '/cliente/reservas', icon: <CalendarDays className="w-4 h-4" /> },
    { label: 'Explorar tours', href: '/cliente/tours', icon: <Map className="w-4 h-4" /> },
    { label: 'Mis parques', href: '/cliente/parques', icon: <Leaf className="w-4 h-4" /> },
    { label: 'Insignias', href: '/cliente/insignias', icon: <Award className="w-4 h-4" /> },
    { label: 'Mis documentos', href: '/cliente/documentos', icon: <Package className="w-4 h-4" /> },
    { label: 'Perfil', href: '/cliente/perfil', icon: <UserCheck className="w-4 h-4" /> },
  ],
  freelance: [
    { label: 'Resumen', href: '/freelance', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Mis ventas', href: '/freelance/ventas', icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Comisiones', href: '/freelance/comisiones', icon: <DollarSign className="w-4 h-4" /> },
    { label: 'Mis clientes', href: '/freelance/clientes', icon: <Users className="w-4 h-4" /> },
    { label: 'Kit de ventas', href: '/freelance/kit', icon: <Share2 className="w-4 h-4" /> },
    { label: 'Tours', href: '/freelance/tours', icon: <Map className="w-4 h-4" /> },
    { label: 'Perfil', href: '/freelance/perfil', icon: <UserCheck className="w-4 h-4" /> },
  ],
  aliado: [
    { label: 'Inicio', href: '/aliado', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Mis servicios', href: '/aliado/servicios', icon: <Building2 className="w-4 h-4" /> },
    { label: 'Reservas asignadas', href: '/aliado/reservas', icon: <CalendarDays className="w-4 h-4" /> },
    { label: 'Disponibilidad', href: '/aliado/disponibilidad', icon: <Star className="w-4 h-4" /> },
    { label: 'Mis ingresos', href: '/aliado/ingresos', icon: <DollarSign className="w-4 h-4" /> },
    { label: 'Notificaciones', href: '/aliado/notificaciones', icon: <Bell className="w-4 h-4" /> },
    { label: 'Perfil', href: '/aliado/perfil', icon: <UserCheck className="w-4 h-4" /> },
  ],
}

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-brand-blue text-white',
  cliente: 'bg-brand-green text-white',
  freelance: 'bg-purple-600 text-white',
  aliado: 'bg-orange-500 text-white',
}

export function Sidebar() {
  const pathname = usePathname()
  const { user, clearAuth } = useAuthStore()

  if (!user) return null

  const navItems = NAV_ITEMS[user.role]

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-30">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className={cn('p-1.5 rounded-lg', ROLE_COLORS[user.role])}>
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">Aves y Naturaleza</p>
            <p className="text-xs text-gray-400">{ROLE_LABELS[user.role]}</p>
          </div>
        </div>
      </div>

      {/* Perfil de usuario */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold', ROLE_COLORS[user.role])}>
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5 scrollbar-hide">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('sidebar-link', isActive && 'active')}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge != null && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Cerrar sesión */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={clearAuth}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
