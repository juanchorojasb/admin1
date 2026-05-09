'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface WompiConfig {
  publicKey: string
  currency: 'COP'
  amountInCents: number
  reference: string
  signature: { integrity: string }
  customerData: {
    email: string
    fullName: string
    phoneNumber: string
    phoneNumberPrefix: string
  }
  redirectUrl: string
}

interface WompiButtonProps {
  config: WompiConfig
  onSuccess?: () => void
  onError?: () => void
  label?: string
  disabled?: boolean
}

declare global {
  interface Window {
    WidgetCheckout?: new (config: WompiConfig) => { open: (cb: (result: { transaction: { id: string; status: string } }) => void) => void }
  }
}

const WOMPI_SCRIPT = process.env.NODE_ENV === 'production'
  ? 'https://checkout.wompi.co/widget.js'
  : 'https://checkout.wompi.co/widget.js'

export function WompiButton({ config, onSuccess, onError, label = 'Pagar con Wompi', disabled }: WompiButtonProps) {
  const [loaded, setLoaded] = useState(false)
  const [paying, setPaying] = useState(false)
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  useEffect(() => {
    if (document.querySelector(`script[src="${WOMPI_SCRIPT}"]`)) {
      setLoaded(true)
      return
    }
    const script = document.createElement('script')
    script.src = WOMPI_SCRIPT
    script.async = true
    script.onload = () => setLoaded(true)
    script.onerror = () => console.error('Error cargando Wompi')
    document.body.appendChild(script)
    scriptRef.current = script
    return () => { scriptRef.current?.remove() }
  }, [])

  const handlePay = () => {
    if (!window.WidgetCheckout || !loaded) return
    setPaying(true)
    const checkout = new window.WidgetCheckout(config)
    checkout.open((result) => {
      setPaying(false)
      const { transaction } = result
      if (transaction.status === 'APPROVED') {
        onSuccess?.()
      } else {
        onError?.()
      }
    })
  }

  return (
    <button
      onClick={handlePay}
      disabled={disabled || !loaded || paying}
      className="w-full flex items-center justify-center gap-3 bg-[#00C7B7] hover:bg-[#00b3a4] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-xl transition-colors text-base"
    >
      {paying ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Procesando pago...
        </>
      ) : (
        <>
          <svg viewBox="0 0 60 20" className="h-5 fill-white" aria-label="Wompi">
            <text x="0" y="16" fontFamily="Arial" fontWeight="bold" fontSize="16">Wompi</text>
          </svg>
          {label}
        </>
      )}
    </button>
  )
}
