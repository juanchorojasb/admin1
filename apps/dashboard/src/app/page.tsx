'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth/store'
import { getDashboardPath } from '@/lib/utils'
import { Leaf } from 'lucide-react'

export default function Home() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(getDashboardPath(user.role))
    } else {
      router.replace('/auth/login')
    }
  }, [isAuthenticated, user, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-blue">
      <div className="flex flex-col items-center gap-3 text-white">
        <Leaf className="w-10 h-10 text-brand-green animate-pulse" />
        <p className="text-lg font-medium">Aves y Naturaleza</p>
        <p className="text-blue-300 text-sm">Cargando...</p>
      </div>
    </div>
  )
}
