'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/lib/auth/store'
import { useMutation, useQuery } from '@tanstack/react-query'
import { usersApi } from '@/lib/api/endpoints'
import { authApi } from '@/lib/api/endpoints'
import { User, Banknote, KeyRound, CheckCircle, Copy, Share2 } from 'lucide-react'
import { useState } from 'react'
import type { User as UserType, FreelanceProfile } from '@/types'
import toast from 'react-hot-toast'

const profileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional(),
})

const bankSchema = z.object({
  bankName: z.string().min(2, 'Ingresa el nombre del banco'),
  bankAccount: z.string().min(5, 'Número de cuenta inválido'),
  bankAccountType: z.enum(['ahorros', 'corriente']),
})

const passSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8),
  confirm: z.string(),
}).refine((d) => d.newPassword === d.confirm, { message: 'Las contraseñas no coinciden', path: ['confirm'] })

type ProfileForm = z.infer<typeof profileSchema>
type BankForm = z.infer<typeof bankSchema>
type PassForm = z.infer<typeof passSchema>

export default function FreelancePerfilPage() {
  const { user, updateUser } = useAuthStore()
  const [passError, setPassError] = useState('')

  const { data: userData } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: async () => {
      const res = await usersApi.getOne(user!.id)
      return res.data.data
    },
    enabled: !!user?.id,
  })

  const fp = userData?.freelanceProfile as FreelanceProfile | undefined

  const { register: rp, handleSubmit: hsp, formState: { errors: ep } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', phone: user?.phone ?? '' },
  })

  const { register: rb, handleSubmit: hsb, formState: { errors: eb } } = useForm<BankForm>({
    resolver: zodResolver(bankSchema),
    values: { bankName: fp?.bankName ?? '', bankAccount: fp?.bankAccount ?? '', bankAccountType: (fp?.bankAccountType as 'ahorros' | 'corriente') ?? 'ahorros' },
  })

  const { register: rpass, handleSubmit: hspass, formState: { errors: epass }, reset: resetPass } = useForm<PassForm>({
    resolver: zodResolver(passSchema),
  })

  const updateProfile = useMutation({
    mutationFn: (data: ProfileForm) => usersApi.update(user!.id, data),
    onSuccess: (res) => { updateUser(res.data.data as UserType); toast.success('Perfil actualizado') },
    onError: () => toast.error('Error al actualizar'),
  })

  const updateBank = useMutation({
    mutationFn: (data: BankForm) => usersApi.updateFreelanceProfile(user!.id, data),
    onSuccess: () => toast.success('Datos bancarios guardados'),
    onError: () => toast.error('Error al guardar'),
  })

  const changePass = useMutation({
    mutationFn: (d: PassForm) => authApi.changePassword(d.currentPassword, d.newPassword),
    onSuccess: () => { toast.success('Contraseña actualizada'); setPassError(''); resetPass() },
    onError: (err: Error) => setPassError(err.message),
  })

  const referralLink = `https://avesynaturaleza.travel/reservas/nueva?ref=${user?.referralCode ?? ''}`

  return (
    <DashboardLayout requiredRole="freelance">
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1>
          <p className="text-gray-500 text-sm">Información personal y datos de pago</p>
        </div>

        {/* Tarjeta revendedor */}
        <div className="card bg-gradient-to-br from-purple-600 to-purple-800 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center font-bold text-2xl">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <p className="font-semibold text-lg">{user?.firstName} {user?.lastName}</p>
              <p className="text-purple-200 text-sm">{user?.email}</p>
            </div>
            {fp?.commissionRate && (
              <div className="ml-auto text-right">
                <p className="text-purple-200 text-xs">Comisión</p>
                <p className="text-3xl font-bold">{fp.commissionRate}%</p>
              </div>
            )}
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-purple-200 text-xs mb-1">Tu enlace de referido</p>
            <div className="flex items-center gap-2">
              <p className="text-white text-xs font-mono truncate flex-1">{referralLink}</p>
              <button onClick={() => { navigator.clipboard.writeText(referralLink); toast.success('Copiado') }} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                <Copy className="w-4 h-4" />
              </button>
              <a href={`https://wa.me/?text=${encodeURIComponent(`¡Reserva tu experiencia ecoturística! ${referralLink}`)}`} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Datos personales */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-purple-600" /> Datos personales
          </h2>
          <form onSubmit={hsp((d) => updateProfile.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input {...rp('firstName')} className="input w-full" />
                {ep.firstName && <p className="text-xs text-red-500 mt-1">{ep.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                <input {...rp('lastName')} className="input w-full" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input {...rp('phone')} className="input w-full" />
            </div>
            <button type="submit" disabled={updateProfile.isPending} className="btn-primary text-sm">
              {updateProfile.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </form>
        </div>

        {/* Datos bancarios */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Banknote className="w-4 h-4 text-purple-600" /> Datos bancarios para pagos
          </h2>
          <form onSubmit={hsb((d) => updateBank.mutate(d))} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
              <input {...rb('bankName')} className="input w-full" placeholder="Ej: Bancolombia" />
              {eb.bankName && <p className="text-xs text-red-500 mt-1">{eb.bankName.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de cuenta</label>
                <input {...rb('bankAccount')} className="input w-full" placeholder="0000000000" />
                {eb.bankAccount && <p className="text-xs text-red-500 mt-1">{eb.bankAccount.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select {...rb('bankAccountType')} className="input w-full">
                  <option value="ahorros">Ahorros</option>
                  <option value="corriente">Corriente</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={updateBank.isPending} className="btn-primary text-sm">
              {updateBank.isPending ? 'Guardando...' : 'Guardar datos bancarios'}
            </button>
          </form>
        </div>

        {/* Cambiar contraseña */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <KeyRound className="w-4 h-4 text-purple-600" /> Cambiar contraseña
          </h2>
          <form onSubmit={hspass((d) => changePass.mutate(d))} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
              <input {...rpass('currentPassword')} type="password" className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
              <input {...rpass('newPassword')} type="password" className="input w-full" />
              {epass.newPassword && <p className="text-xs text-red-500 mt-1">{epass.newPassword.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar</label>
              <input {...rpass('confirm')} type="password" className="input w-full" />
              {epass.confirm && <p className="text-xs text-red-500 mt-1">{epass.confirm.message}</p>}
            </div>
            {passError && <p className="text-xs text-red-500">{passError}</p>}
            <button type="submit" disabled={changePass.isPending} className="btn-secondary text-sm">
              {changePass.isPending ? 'Cambiando...' : 'Cambiar contraseña'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
