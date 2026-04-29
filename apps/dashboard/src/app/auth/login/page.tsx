'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Leaf } from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import { useAuthStore } from '@/lib/auth/store'
import { getDashboardPath } from '@/lib/utils'
import type { User, AuthTokens } from '@/types'

const loginSchema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [showPass, setShowPass] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await apiClient.post<{ data: { user: User; tokens: AuthTokens } }>(
        '/auth/login',
        data
      )
      setAuth(res.data.data.user, res.data.data.tokens)
      toast.success(`Bienvenido, ${res.data.data.user.firstName}`)
      router.push(getDashboardPath(res.data.data.user.role))
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Credenciales incorrectas'
      toast.error(message)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-brand-blue p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-brand-green blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-brand-light blur-3xl" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <Leaf className="w-8 h-8 text-brand-green" />
            <span className="text-xl font-bold">Aves y Naturaleza</span>
          </div>
          <p className="text-brand-light text-sm">Agencia de viajes</p>
        </div>
        <div className="relative space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Panel de gestión
            <span className="block text-brand-green">ecológico</span>
          </h1>
          <p className="text-blue-200 text-lg">
            Administra tours, reservas y clientes desde un solo lugar.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4">
            {[
              { label: 'Tours activos', value: '9+' },
              { label: 'Parques naturales', value: '5' },
              { label: 'Clientes felices', value: '500+' },
              { label: 'Destinos', value: '8' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-4">
                <p className="text-2xl font-bold text-brand-green">{stat.value}</p>
                <p className="text-sm text-blue-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-blue-300 text-sm">
          © 2024 Aves y Naturaleza · avesynaturaleza.travel
        </p>
      </div>

      {/* Panel derecho - formulario */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Leaf className="w-6 h-6 text-brand-blue" />
            <span className="font-bold text-brand-blue">Aves y Naturaleza</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">Iniciar sesión</h2>
            <p className="mt-1 text-gray-500">Accede a tu panel personalizado</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Correo electrónico</label>
              <input
                {...register('email')}
                type="email"
                placeholder="tu@correo.com"
                className="input"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3 text-base"
            >
              {isSubmitting ? 'Iniciando sesión...' : 'Entrar al panel'}
            </button>
          </form>

          <div className="text-center text-sm text-gray-500">
            ¿Necesitas acceso?{' '}
            <a href="https://wa.me/573206451470" className="text-brand-blue font-medium hover:underline">
              Contacta al administrador
            </a>
          </div>

          <div className="pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              WhatsApp: 320 645 1470 · turismoavesynaturaleza@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
