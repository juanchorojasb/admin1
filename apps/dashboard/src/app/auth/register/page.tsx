'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Leaf } from 'lucide-react'
import { authApi } from '@/lib/api/endpoints'

const registerSchema = z.object({
  firstName: z.string().min(2, 'Nombre muy corto').max(100),
  lastName: z.string().min(2, 'Apellido muy corto').max(100),
  email: z.string().email('Correo inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe tener al menos un número'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [showPass, setShowPass] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterForm) => {
    try {
      await authApi.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      })
      toast.success('Cuenta creada. Ya puedes iniciar sesión.')
      router.push('/auth/login')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'No se pudo crear la cuenta'
      toast.error(msg)
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
            Únete a nuestra
            <span className="block text-brand-green">comunidad</span>
          </h1>
          <p className="text-blue-200 text-lg">
            Reserva tours de naturaleza, acumula insignias y explora los parques nacionales de Colombia.
          </p>
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
            <h2 className="text-2xl font-bold text-gray-900">Crear cuenta</h2>
            <p className="mt-1 text-gray-500">Regístrate para reservar tours</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre</label>
                <input
                  {...register('firstName')}
                  type="text"
                  placeholder="Juan"
                  className="input"
                  autoComplete="given-name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="label">Apellido</label>
                <input
                  {...register('lastName')}
                  type="text"
                  placeholder="Pérez"
                  className="input"
                  autoComplete="family-name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>

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
                  placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número"
                  className="input pr-10"
                  autoComplete="new-password"
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

            <div>
              <label className="label">Confirmar contraseña</label>
              <input
                {...register('confirmPassword')}
                type={showPass ? 'text' : 'password'}
                placeholder="Repite tu contraseña"
                className="input"
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3 text-base"
            >
              {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <div className="text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="text-brand-blue font-medium hover:underline">
              Iniciar sesión
            </Link>
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
