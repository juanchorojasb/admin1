'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aliadosApi } from '@/lib/api/endpoints'
import { Modal } from '@/components/ui/Modal'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Building2, Star, CheckCircle, XCircle } from 'lucide-react'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface Service {
  id: string
  business_name: string
  aliado_type: string
  description: string
  address: string
  city: string
  nit: string
  is_verified: boolean
  rating: number
  created_at: string
}

const serviceSchema = z.object({
  businessName: z.string().min(3, 'Mínimo 3 caracteres'),
  aliadoType: z.enum(['ecohotel', 'transporte', 'restaurante', 'guia', 'otro']),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  nit: z.string().optional(),
})
type ServiceForm = z.infer<typeof serviceSchema>

const TYPE_LABEL: Record<string, string> = {
  ecohotel: '🏡 Ecohotel',
  transporte: '🚐 Transporte',
  restaurante: '🍽️ Restaurante',
  guia: '🧭 Guía',
  otro: '📦 Otro',
}

export default function AliadoServiciosPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const qc = useQueryClient()

  const { data: servicesData, isLoading } = useQuery({
    queryKey: ['aliado-services'],
    queryFn: async () => {
      const res = await aliadosApi.myServices()
      return res.data
    },
  })

  const { data: statsData } = useQuery({
    queryKey: ['aliado-stats'],
    queryFn: async () => {
      const res = await aliadosApi.stats()
      return res.data.data as { totalServices: number; rating: number; activeReservations: number; monthRevenue: number }
    },
  })

  const services = (servicesData?.data ?? []) as Service[]

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { aliadoType: 'ecohotel' },
  })

  const save = useMutation({
    mutationFn: (data: ServiceForm) => aliadosApi.myServices(),
    onSuccess: () => {
      toast.success('Servicio guardado')
      qc.invalidateQueries({ queryKey: ['aliado-services'] })
      setModalOpen(false)
      reset()
    },
    onError: () => toast.error('Error al guardar'),
  })

  return (
    <DashboardLayout requiredRole="aliado">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis servicios</h1>
            <p className="text-gray-500 text-sm">Gestiona los servicios ofrecidos a la agencia</p>
          </div>
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Nuevo servicio
          </button>
        </div>

        {/* Stats */}
        {statsData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Servicios activos', value: statsData.totalServices ?? 0 },
              { label: 'Valoración promedio', value: `${(statsData.rating ?? 0).toFixed(1)} ★` },
              { label: 'Reservas activas', value: statsData.activeReservations ?? 0 },
              { label: 'Ingresos este mes', value: `$${((statsData.monthRevenue ?? 0) / 1000000).toFixed(1)}M` },
            ].map((s) => (
              <div key={s.label} className="card-sm text-center">
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {isLoading && <PageLoader />}

        {!isLoading && services.length === 0 && (
          <div className="card text-center py-16">
            <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Aún no tienes servicios registrados</p>
            <p className="text-gray-400 text-sm mt-1">Agrega tu ecohotel, transporte u otro servicio</p>
            <button onClick={() => setModalOpen(true)} className="btn-primary mt-4">Registrar servicio</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((s) => (
            <div key={s.id} className="card hover:shadow-card-lg transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{TYPE_LABEL[s.aliado_type] ?? s.aliado_type}</span>
                    {s.is_verified
                      ? <span className="text-xs text-green-600 flex items-center gap-0.5"><CheckCircle className="w-3 h-3" /> Verificado</span>
                      : <span className="text-xs text-yellow-600 flex items-center gap-0.5"><XCircle className="w-3 h-3" /> Pendiente verificación</span>
                    }
                  </div>
                  <h3 className="font-semibold text-gray-900">{s.business_name}</h3>
                  {s.city && <p className="text-xs text-gray-400 mt-1">📍 {s.city}</p>}
                  {s.description && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{s.description}</p>}
                </div>
                {s.rating > 0 && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-bold">{s.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Registrar servicio" size="md">
          <form onSubmit={handleSubmit((d) => save.mutate(d))} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del negocio</label>
              <input {...register('businessName')} className="input w-full" placeholder="Ecohotel Las Palmas" />
              {errors.businessName && <p className="text-xs text-red-500 mt-1">{errors.businessName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de servicio</label>
              <select {...register('aliadoType')} className="input w-full">
                {Object.entries(TYPE_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea {...register('description')} className="input w-full h-24 resize-none" placeholder="Describe brevemente tu servicio..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                <input {...register('city')} className="input w-full" placeholder="Manizales" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIT</label>
                <input {...register('nit')} className="input w-full" placeholder="900.000.000-0" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input {...register('address')} className="input w-full" placeholder="Carrera 23 # 45-67" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={save.isPending} className="btn-primary flex-1">
                {save.isPending ? 'Guardando...' : 'Guardar servicio'}
              </button>
              <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost flex-1">Cancelar</button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
