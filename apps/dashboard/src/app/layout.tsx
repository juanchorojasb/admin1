import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { BRAND } from '@/lib/brand'

export const metadata: Metadata = {
  // Base para las URLs absolutas de Open Graph (imágenes de la vista previa al compartir)
  metadataBase: new URL(BRAND.url),
  title: 'Aves y Naturaleza | Panel',
  description: BRAND.description,
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-sans">
        <Providers>{children}</Providers>
        <ChatWidget />
      </body>
    </html>
  )
}
