'use client'

import { useAuthStore } from '@/lib/auth/store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { getDashboardPath } from '@/lib/utils'
import { rutaLogin } from '@/lib/navegacion'
import type { UserRole } from '@/types'

interface DashboardLayoutProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

export function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Después de iniciar sesión se vuelve a la página que se intentaba abrir
      router.replace(rutaLogin(window.location.pathname + window.location.search))
      return
    }
    if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
      router.replace(getDashboardPath(user.role))
    }
  }, [isAuthenticated, user, requiredRole, router])

  if (!isAuthenticated || !user) return null

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
