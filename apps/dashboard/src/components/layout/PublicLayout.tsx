'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Leaf, Instagram, Facebook } from 'lucide-react'
import { useAuthStore } from '@/lib/auth/store'
import { getDashboardPath } from '@/lib/utils'

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsLoggedIn(isAuthenticated && !!user)
  }, [isAuthenticated, user])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-brand-green" />
            <span className="font-bold text-gray-900 text-lg">Aves y Naturaleza</span>
          </Link>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <button onClick={() => router.push(getDashboardPath(user!.role))} className="btn-primary text-sm">
                Mi cuenta
              </button>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-brand-blue">Ingresar</Link>
                <Link href="/auth/register" className="btn-primary text-sm">Crear cuenta</Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="flex-1 pt-16">
        {children}
      </main>
      <footer className="bg-gray-900 text-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-brand-green" />
              <span className="font-bold">Aves y Naturaleza</span>
            </div>
            <p className="text-gray-400 text-sm">© 2024 Aves y Naturaleza · Ecoturismo responsable en Colombia</p>
            <div className="flex items-center gap-4 text-gray-400">
              <a href="https://instagram.com/avesynaturaleza" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
