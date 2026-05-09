import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { ChatWidget } from '@/components/chat/ChatWidget'

export const metadata: Metadata = {
  title: 'Aves y Naturaleza | Panel',
  description: 'Agencia de viajes ecológicos en Colombia',
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
