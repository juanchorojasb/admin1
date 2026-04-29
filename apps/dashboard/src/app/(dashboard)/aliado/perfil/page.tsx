'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/lib/auth/store'
import { useMutation, useQuery } from '@tanstack/react-query'
import { usersApi, authApi } from '@/lib/api/endpoints'
import { User, Building2, KeyRound, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import type { User as UserType, AliadoProfile } from '@/types'
import toast from 'react-hot-toast'

const profileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional(),
})

const businessSchema = z.object({
  businessName: z.string().min(3, 'Mínimo 3 caracteres'),
  aliadoType: z.enum(['ecohotel', 'transporte', 'restaurante', 'guia', 'otro']),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  nit: z.string().optional(),
})

const passSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8),
  confirm: z.string(),
}).refine((d) => d.newPassword === d.confirm, { message: 'Las contraseñas no coinciden', path: ['confirm'] })

type ProfileForm = z.infer<typeof profileSchema>
type BusinessForm = z.infer<typeof businessSchema>
type PassForm = z.infer<typeof passSchema>

const TYPE_LABEL: Record<string, string> = {
  ecohotel: 'Ecohotel',
  transporte: 'Transporte',
  restaurante: 'Restaurante',
  guia: 'Guía',
  otro: 'Otro',
}

export default function AliadoPerfilPage() {
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

  const ap = userData?.aliadoProfile as AliadoProfile | undefined

  const { register: rp, handleSubmit: hsp } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', phone: user?.phone ?? '' },
  })

  const { register: rb, handleSubmit: hsb, formState: { errors: eb } } = useForm<BusinessForm>({
    resolver: zodResolver(businessSchema),
    values: {
      businessName: ap?.businessName ?? '',
      aliadoType: (ap?.aliadoType as BusinessForm['aliadoType']) ?? 'ecohotel',
      description: ap?.description ?? '',
      address: ap?.address ?? '',
      city: ap?.city ?? '',
      nit: ap?.nit ?? '',
    },
  })

  const { register: rpass, handleSubmit: hspass, formState: { errors: epass }, reset: resetPass } = useForm<PassForm>({
    resolver: zodResolver(passSchema),
  })

  const updateProfile = useMutation({
    mutationFn: (data: ProfileForm) => usersApi.update(user!.id, data),
    onSuccess: (res) => { updateUser(res.data.data as UserType); toast.success('Perfil actualizado') },
    onError: () => toast.error('Error al actualizar'),
  })

  const updateBusiness = useMutation({
    mutationFn: (data: BusinessForm) => usersApi.updateAliadoProfile(user!.id, data),
    onSuccess: () => toast.success('Perfil de negocio guardado'),
    onError: () => toast.error('Error al guardar'),
  })

  const changePass = useMutation({
    mutationFn: (d: PassForm) => authApi.changePassword(d.currentPassword, d.newPassword),
    onSuccess: () => { toast.success('Contraseña actualizada'); setPassError(''); resetPass() },
    onError: (err: Error) => setPassError(err.message),
  })

  return (
    <DashboardLayout requiredRole="aliado">
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1>
          <p className="text-gray-500 text-sm">Información de cuenta y datos de negocio</p>
        </div>

        {/* Tarjeta aliado */}
        <div className="card bg-gradient-to-br from-orange-500 to-orange-700 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center font-bold text-2xl">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <p className="font-semibold text-lg">{user?.firstName} {user?.lastName}</p>
              <p className="text-orange-200 text-sm">{user?.email}</p>
              {ap && (
                <p className="text-orange-100 text-sm mt-1">
                  {TYPE_LABEL[ap.aliadoType] ?? ap.aliadoType} · {ap.city ?? '—'}
                </p>
              )}
            </div>
            {ap?.isVerified && (
              <div className="ml-auto flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs font-medium">Verificado</span>
              </div>
            )}
          </div>
        </div>

        {/* Datos personales */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-orange-600" /> Datos personales
          </h2>
          <form onSubmit={hsp((d) => updateProfile.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input {...rp('firstName')} className="input w-full" />
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

        {/* Perfil del negocio */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-orange-600" /> Datos del negocio
          </h2>
          <form onSubmit={hsb((d) => updateBusiness.mutate(d))} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del negocio</label>
              <input {...rb('businessName')} className="input w-full" />
              {eb.businessName && <p className="text-xs text-red-500 mt-1">{eb.businessName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de aliado</label>
              <select {...rb('aliadoType')} className="input w-full">
                {Object.entries(TYPE_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea {...rb('description')} className="input w-full h-24 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                <input {...rb('city')} className="input w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIT</label>
                <input {...rb('nit')} className="input w-full" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input {...rb('address')} className="input w-full" />
            </div>
            <button type="submit" disabled={updateBusiness.isPending} className="btn-primary text-sm">
              {updateBusiness.isPending ? 'Guardando...' : 'Guardar perfil de negocio'}
            </button>
          </form>
        </div>

        {/* Cambiar contraseña */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <KeyRound className="w-4 h-4 text-orange-600" /> Cambiar contraseña
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
