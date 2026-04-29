'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/lib/auth/store'
import { useMutation } from '@tanstack/react-query'
import { usersApi } from '@/lib/api/endpoints'
import { authApi } from '@/lib/api/endpoints'
import { User, KeyRound, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import type { User as UserType } from '@/types'

const profileSchema = z.object({
  firstName: z.string().min(2, 'Mínimo 2 caracteres'),
  lastName: z.string().min(2),
  phone: z.string().optional(),
})

const passSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8, 'Mínimo 8 caracteres'),
  confirm: z.string(),
}).refine((d) => d.newPassword === d.confirm, { message: 'Las contraseñas no coinciden', path: ['confirm'] })

type ProfileForm = z.infer<typeof profileSchema>
type PassForm = z.infer<typeof passSchema>

export default function ClientePerfilPage() {
  const { user, updateUser } = useAuthStore()
  const [profileOk, setProfileOk] = useState(false)
  const [passOk, setPassOk] = useState(false)
  const [passError, setPassError] = useState('')

  const { register: rp, handleSubmit: hsp, formState: { errors: ep } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', phone: user?.phone ?? '' },
  })

  const { register: rpass, handleSubmit: hspass, formState: { errors: epass }, reset: resetPass } = useForm<PassForm>({
    resolver: zodResolver(passSchema),
  })

  const updateProfile = useMutation({
    mutationFn: (data: ProfileForm) => usersApi.update(user!.id, data),
    onSuccess: (res) => {
      updateUser(res.data.data as UserType)
      setProfileOk(true)
      setTimeout(() => setProfileOk(false), 3000)
    },
  })

  const changePass = useMutation({
    mutationFn: (data: PassForm) => authApi.changePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      setPassOk(true)
      setPassError('')
      resetPass()
      setTimeout(() => setPassOk(false), 3000)
    },
    onError: (err: Error) => setPassError(err.message ?? 'Error al cambiar contraseña'),
  })

  return (
    <DashboardLayout requiredRole="cliente">
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1>
          <p className="text-gray-500 text-sm">Administra tu información personal</p>
        </div>

        {/* Avatar / info básica */}
        <div className="card flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-blue-100 flex items-center justify-center text-brand-blue font-bold text-2xl">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="badge bg-brand-blue-100 text-brand-blue text-xs mt-1 inline-block capitalize">{user?.role}</span>
          </div>
          {user?.referralCode && (
            <div className="ml-auto text-right">
              <p className="text-xs text-gray-400">Código de referido</p>
              <p className="font-mono font-bold text-brand-blue text-lg">{user.referralCode}</p>
            </div>
          )}
        </div>

        {/* Editar perfil */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-brand-blue" /> Datos personales
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
                {ep.lastName && <p className="text-xs text-red-500 mt-1">{ep.lastName.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input {...rp('phone')} className="input w-full" placeholder="+57 300 000 0000" />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={updateProfile.isPending} className="btn-primary text-sm">
                {updateProfile.isPending ? 'Guardando...' : 'Guardar cambios'}
              </button>
              {profileOk && <span className="text-green-600 text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Guardado</span>}
            </div>
          </form>
        </div>

        {/* Cambiar contraseña */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <KeyRound className="w-4 h-4 text-brand-blue" /> Cambiar contraseña
          </h2>
          <form onSubmit={hspass((d) => changePass.mutate(d))} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
              <input {...rpass('currentPassword')} type="password" className="input w-full" />
              {epass.currentPassword && <p className="text-xs text-red-500 mt-1">{epass.currentPassword.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
              <input {...rpass('newPassword')} type="password" className="input w-full" />
              {epass.newPassword && <p className="text-xs text-red-500 mt-1">{epass.newPassword.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
              <input {...rpass('confirm')} type="password" className="input w-full" />
              {epass.confirm && <p className="text-xs text-red-500 mt-1">{epass.confirm.message}</p>}
            </div>
            {passError && <p className="text-xs text-red-500">{passError}</p>}
            <div className="flex items-center gap-3">
              <button type="submit" disabled={changePass.isPending} className="btn-secondary text-sm">
                {changePass.isPending ? 'Cambiando...' : 'Cambiar contraseña'}
              </button>
              {passOk && <span className="text-green-600 text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Contraseña actualizada</span>}
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
