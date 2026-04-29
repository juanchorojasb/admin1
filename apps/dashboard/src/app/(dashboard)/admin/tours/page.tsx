'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DataTable } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { useTours, useToggleTour, useBulkAvailability } from '@/hooks/useTours'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toursApi } from '@/lib/api/endpoints'
import { formatCOP } from '@/lib/utils'
import { Plus, ToggleLeft, ToggleRight, CalendarDays, Edit } from 'lucide-react'
import type { Tour } from '@/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTourSchema, type CreateTourDto } from '@/lib/schemas/tour.schema'
import toast from 'react-hot-toast'
import { TOURS_KEY } from '@/hooks/useTours'

export default function AdminToursPage() {
  const [page, setPage] = useState(1)
  const [formModal, setFormModal] = useState(false)
  const [availModal, setAvailModal] = useState(false)
  const [editingTour, setEditingTour] = useState<Tour | null>(null)
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useTours({ page, limit: 15, active: 'all' })
  const toggleTour = useToggleTour()

  const createTour = useMutation({
    mutationFn: (data: CreateTourDto) =>
      editingTour ? toursApi.update(editingTour.id, data) : toursApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TOURS_KEY] })
      toast.success(editingTour ? 'Tour actualizado' : 'Tour creado')
      setFormModal(false)
      setEditingTour(null)
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err.response?.data?.message ?? 'Error al guardar el tour'),
  })

  const bulkAvail = useBulkAvailability(selectedTour?.id ?? '')

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<CreateTourDto>({
    resolver: zodResolver(createTourSchema),
    defaultValues: { tourType: 'pasadia', difficulty: 'moderado', durationDays: 1, minPersons: 1, maxPersons: 20, isFeatured: false },
  })

  const { register: regAvail, handleSubmit: handleAvail, formState: { isSubmitting: submittingAvail } } = useForm<{
    startDate: string; endDate: string; departureCity: string; totalSpots: number; priceOverride?: number
  }>()

  const openEdit = (tour: Tour) => {
    setEditingTour(tour)
    setValue('name', tour.name)
    setValue('slug', tour.slug)
    setValue('tourType', tour.tourType)
    setValue('destination', tour.destination)
    setValue('basePrice', tour.basePrice)
    setValue('durationDays', tour.durationDays)
    setValue('minPersons', tour.minPersons)
    setValue('maxPersons', tour.maxPersons)
    setValue('difficulty', tour.difficulty as CreateTourDto['difficulty'])
    setValue('isFeatured', tour.isFeatured)
    setFormModal(true)
  }

  const generateDates = (start: string, end: string): string[] => {
    const dates: string[] = []
    const current = new Date(start)
    const last = new Date(end)
    while (current <= last) {
      dates.push(current.toISOString().slice(0, 10))
      current.setDate(current.getDate() + 1)
    }
    return dates
  }

  const onAvail = async (form: { startDate: string; endDate: string; departureCity: string; totalSpots: number; priceOverride?: number }) => {
    const dates = generateDates(form.startDate, form.endDate)
    await bulkAvail.mutateAsync({ dates, departureCity: form.departureCity, totalSpots: Number(form.totalSpots), priceOverride: form.priceOverride })
    setAvailModal(false)
  }

  const columns = [
    {
      key: 'name', header: 'Tour',
      render: (t: Tour) => (
        <div>
          <p className="font-medium text-sm">{t.name}</p>
          <p className="text-xs text-gray-400">{t.destination}</p>
        </div>
      ),
    },
    { key: 'tourType', header: 'Tipo', render: (t: Tour) => <span className="text-xs text-gray-500 capitalize">{t.tourType}</span> },
    { key: 'basePrice', header: 'Precio', render: (t: Tour) => <span className="font-semibold text-sm">{formatCOP(t.basePrice)}</span> },
    { key: 'durationDays', header: 'Duración', render: (t: Tour) => <span className="text-sm">{t.durationDays}d</span> },
    { key: 'difficulty', header: 'Dificultad', render: (t: Tour) => (
      <span className={`badge text-xs ${t.difficulty === 'facil' ? 'bg-green-100 text-green-700' : t.difficulty === 'dificil' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
        {t.difficulty}
      </span>
    )},
    { key: 'isActive', header: 'Estado', render: (t: Tour) => (
      <span className={`badge text-xs ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
        {t.isActive ? 'Activo' : 'Inactivo'}
      </span>
    )},
    {
      key: 'actions', header: '',
      render: (t: Tour) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(t)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="Editar">
            <Edit className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => { setSelectedTour(t); setAvailModal(true) }}
            className="p-1.5 hover:bg-brand-blue-50 rounded-lg" title="Disponibilidad"
          >
            <CalendarDays className="w-4 h-4 text-brand-blue" />
          </button>
          <button
            onClick={() => toggleTour.mutate(t.id)}
            className="p-1.5 hover:bg-gray-100 rounded-lg"
            title={t.isActive ? 'Desactivar' : 'Activar'}
          >
            {t.isActive
              ? <ToggleRight className="w-4 h-4 text-brand-green" />
              : <ToggleLeft className="w-4 h-4 text-gray-400" />}
          </button>
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tours</h1>
            <p className="text-gray-500 text-sm">{data?.total ?? 0} tours</p>
          </div>
          <button
            onClick={() => { setEditingTour(null); reset(); setFormModal(true) }}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Nuevo tour
          </button>
        </div>

        <div className="card">
          <DataTable
            columns={columns as Parameters<typeof DataTable>[0]['columns']}
            data={(data?.data ?? []) as Record<string, unknown>[]}
            total={data?.total}
            page={page}
            limit={15}
            isLoading={isLoading}
            onPageChange={setPage}
            onSearch={() => {}}
            searchPlaceholder="Buscar tour..."
            emptyMessage="No hay tours creados"
          />
        </div>

        {/* Modal: crear/editar tour */}
        <Modal
          open={formModal}
          onClose={() => { setFormModal(false); setEditingTour(null); reset() }}
          title={editingTour ? `Editar: ${editingTour.name}` : 'Nuevo tour'}
          size="xl"
        >
          <form onSubmit={handleSubmit((d) => createTour.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Nombre del tour *</label>
                <input {...register('name')} className="input" placeholder="Aventura al Nevado del Ruiz" />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="label">Slug (URL) *</label>
                <input {...register('slug')} className="input" placeholder="nevado-del-ruiz-manizales" />
                {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>}
              </div>
              <div>
                <label className="label">Destino *</label>
                <input {...register('destination')} className="input" placeholder="PNN Los Nevados" />
              </div>
              <div>
                <label className="label">Tipo *</label>
                <select {...register('tourType')} className="input">
                  <option value="pasadia">Pasadía</option>
                  <option value="1n2d">1 noche / 2 días</option>
                  <option value="2n3d">2 noches / 3 días</option>
                  <option value="multidia">Multidía</option>
                </select>
              </div>
              <div>
                <label className="label">Precio adulto (COP) *</label>
                <input {...register('basePrice', { valueAsNumber: true })} type="number" className="input" placeholder="350000" />
              </div>
              <div>
                <label className="label">Precio niño (COP)</label>
                <input {...register('priceChild', { valueAsNumber: true })} type="number" className="input" placeholder="245000" />
              </div>
              <div>
                <label className="label">Duración (días)</label>
                <input {...register('durationDays', { valueAsNumber: true })} type="number" min="1" className="input" />
              </div>
              <div>
                <label className="label">Dificultad</label>
                <select {...register('difficulty')} className="input">
                  <option value="facil">Fácil</option>
                  <option value="moderado">Moderado</option>
                  <option value="dificil">Difícil</option>
                </select>
              </div>
              <div>
                <label className="label">Mín. personas</label>
                <input {...register('minPersons', { valueAsNumber: true })} type="number" min="1" className="input" />
              </div>
              <div>
                <label className="label">Máx. personas</label>
                <input {...register('maxPersons', { valueAsNumber: true })} type="number" min="1" className="input" />
              </div>
              <div className="col-span-2">
                <label className="label">Descripción</label>
                <textarea {...register('description')} className="input" rows={3} placeholder="Describe la experiencia..." />
              </div>
              <div className="col-span-2">
                <label className="label">URL imagen principal</label>
                <input {...register('coverImage')} className="input" placeholder="https://..." />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input {...register('isFeatured')} type="checkbox" id="featured" className="rounded" />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700">Tour destacado en la portada</label>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t">
              <button type="button" onClick={() => setFormModal(false)} className="btn-ghost">Cancelar</button>
              <button type="submit" disabled={isSubmitting || createTour.isPending} className="btn-primary">
                {isSubmitting || createTour.isPending ? 'Guardando...' : editingTour ? 'Actualizar tour' : 'Crear tour'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal: disponibilidad en bloque */}
        <Modal
          open={availModal}
          onClose={() => setAvailModal(false)}
          title={`Disponibilidad: ${selectedTour?.name}`}
          size="sm"
        >
          <form onSubmit={handleAvail(onAvail)} className="space-y-4">
            <p className="text-sm text-gray-500">Crea disponibilidad para un rango de fechas. Se crea un cupo por cada día del rango.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Desde</label>
                <input {...regAvail('startDate')} type="date" className="input" required />
              </div>
              <div>
                <label className="label">Hasta</label>
                <input {...regAvail('endDate')} type="date" className="input" required />
              </div>
            </div>
            <div>
              <label className="label">Ciudad de salida</label>
              <input {...regAvail('departureCity')} className="input" placeholder="Manizales" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Cupos por fecha</label>
                <input {...regAvail('totalSpots', { valueAsNumber: true })} type="number" min="1" className="input" required />
              </div>
              <div>
                <label className="label">Precio especial (opcional)</label>
                <input {...regAvail('priceOverride', { valueAsNumber: true })} type="number" className="input" placeholder="Precio diferente" />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setAvailModal(false)} className="btn-ghost">Cancelar</button>
              <button type="submit" disabled={submittingAvail || bulkAvail.isPending} className="btn-primary">
                {submittingAvail || bulkAvail.isPending ? 'Creando...' : 'Crear fechas'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
