'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/auth/store'
import { useRouter } from 'next/navigation'
import { getDashboardPath } from '@/lib/utils'
import { useSiteConfig } from '@/hooks/useSiteConfig'
import { Instagram, Facebook, Menu, X } from 'lucide-react'
import { useState } from 'react'

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/experiencias', label: 'Experiencias' },
  { href: '/parques', label: 'Parques temáticos' },
  { href: '/transporte', label: 'Transporte' },
  { href: '/souvenirs', label: 'Souvenirs' },
  { href: '/blog', label: 'Blog' },
]

interface FooterData { copyright: string }
interface ContactoData { phone: string; phoneHref: string; email: string; instagram: string; whatsapp: string }

const D_FOOTER: FooterData = { copyright: '© 2026 Aves y Naturaleza · Ecoturismo responsable en Colombia' }
const D_CONTACTO: ContactoData = {
  phone: '+57 320 645 1470',
  phoneHref: 'tel:+573206451470',
  email: 'turismoavesynaturaleza@gmail.com',
  instagram: '@avesynaturaleza.travel',
  whatsapp: 'https://wa.me/573206451470',
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoggedIn } = useAuthStore()
  const { data: siteConfig } = useSiteConfig()
  const [mobileOpen, setMobileOpen] = useState(false)

  const footer = (siteConfig?.footer as FooterData) ?? D_FOOTER
  const contacto = (siteConfig?.contacto as ContactoData) ?? D_CONTACTO

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Aves y Naturaleza" width={40} height={40} className="object-contain" priority />
            <span className="hidden sm:block font-bold text-gray-900 text-lg">Aves y Naturaleza</span>
          </Link>

          <div className="hidden lg:flex items-center gap-5 text-sm font-medium">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors ${
                  pathname === link.href ? 'text-brand-green font-semibold' : 'text-gray-600 hover:text-brand-blue'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <button onClick={() => router.push(getDashboardPath(user!.role))} className="btn-primary text-sm">
                Mi cuenta
              </button>
            ) : (
              <>
                <Link href="/auth/login" className="hidden md:block text-sm font-medium text-gray-600 hover:text-brand-blue">Ingresar</Link>
                <Link href="/auth/login" className="btn-primary text-sm">Reservar</Link>
              </>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg"
              aria-label="Menú"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    pathname === link.href ? 'bg-brand-green/10 text-brand-green' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Page content */}
      <main className="flex-1 pt-16">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Image src="/logo.png" alt="Aves y Naturaleza" width={36} height={36} className="object-contain" />
                <span className="font-bold">Aves y Naturaleza</span>
              </div>
              <p className="text-gray-400 text-sm">Ecoturismo responsable en Colombia.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Navegación</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {NAV_LINKS.slice(0, 4).map(link => (
                  <li key={link.href}><Link href={link.href} className="hover:text-white transition-colors">{link.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Más</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {NAV_LINKS.slice(4).map(link => (
                  <li key={link.href}><Link href={link.href} className="hover:text-white transition-colors">{link.label}</Link></li>
                ))}
                <li><Link href="/auth/login" className="hover:text-white transition-colors">Ingresar</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Contacto</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href={contacto.phoneHref}>{contacto.phone}</a></li>
                <li><a href={`mailto:${contacto.email}`} className="break-all">{contacto.email}</a></li>
                <li>{contacto.instagram}</li>
              </ul>
              <div className="flex items-center gap-3 mt-3">
                <a href={`https://instagram.com/${contacto.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-gray-400 text-sm">
            {footer.copyright}
          </div>
        </div>
      </footer>
    </div>
  )
}
