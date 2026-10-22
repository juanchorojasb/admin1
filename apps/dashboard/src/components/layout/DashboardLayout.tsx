'use client'

import { useAuthStore } from '@/lib/auth/store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { getDashboardPath } from '@/lib/utils'
import { rutaLogin } from '@/lib/navegacion'
import { useHidratado } from '@/hooks/useHidratado'
import type { UserRole } from '@/types'

interface DashboardLayoutProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

export function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  const { user, isAuthenticated } = useAuthStore()
  // Al recargar la página, el primer render todavía no ve la sesión guardada:
  // decidir ahí mandaba al login a quien sí había iniciado sesión.
  const hidratado = useHidratado()
  const router = useRouter()
  const rolPermitido = !requiredRole || user?.role === requiredRole || user?.role === 'admin'

  useEffect(() => {
    if (!hidratado) return
    if (!isAuthenticated || !user) {
      // Después de iniciar sesión se vuelve a la página que se intentaba abrir
      router.replace(rutaLogin(window.location.pathname + window.location.search))
      return
    }
    if (!rolPermitido) router.replace(getDashboardPath(user.role))
  }, [hidratado, isAuthenticated, user, rolPermitido, router])

  if (!hidratado || !isAuthenticated || !user || !rolPermitido) return null

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
