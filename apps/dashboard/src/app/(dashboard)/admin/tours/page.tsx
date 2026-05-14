'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DataTable } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { useTours, useToggleTour, useBulkAvailability, TOURS_KEY } from '@/hooks/useTours'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toursApi } from '@/lib/api/endpoints'
import { formatCOP } from '@/lib/utils'
import { Plus, ToggleLeft, ToggleRight, CalendarDays, Edit } from 'lucide-react'
import type { Tour } from '@/types'
import { createTourSchema, type CreateTourDto } from '@/lib/schemas/tour.schema'
import toast from 'react-hot-toast'

const TABS = ['Básico', 'Descripción', 'Incluye', 'Imágenes', 'SEO']

function ImagePreview({ url }: { url: string }) {
  const [error, setError] = useState(false)
  if (!url) return null
  if (error) {
    return (
      <div className="mt-1 h-16 w-24 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-400 border">
        URL inválida
      </div>
    )
  }
  return (
    <img
      src={url}
      alt=""
      className="mt-1 h-16 w-24 object-cover rounded border"
      onError={() => setError(true)}
    />
  )
}

function StringList({
  items,
  onChange,
  placeholder,
  addLabel,
}: {
  items: string[]
  onChange: (items: string[]) => void
  placeholder: string
  addLabel: string
}) {
  return (
    <div>
      <button
        type="button"
        onClick={() => onChange([...items, ''])}
        className="text-xs btn-ghost mb-1"
      >
        + {addLabel}
      </button>
      {items.map((val, idx) => (
        <div key={idx} className="flex gap-2 mb-1">
          <input
            value={val}
            onChange={e => {
              const a = [...items]
              a[idx] = e.target.value
              onChange(a)
            }}
            className="input flex-1 text-sm"
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, i) => i !== idx))}
            className="px-2 text-red-400 hover:text-red-600 text-xl leading-none"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

export default function AdminToursPage() {
  const [page, setPage] = useState(1)
  const [formModal, setFormModal] = useState(false)
  const [availModal, setAvailModal] = useState(false)
  const [editingTour, setEditingTour] = useState<Tour | null>(null)
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null)
  const [activeTab, setActiveTab] = useState(0)

  const [excludes, setExcludes] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [restrictions, setRestrictions] = useState<string[]>([])
  const [whatToBring, setWhatToBring] = useState<string[]>([])
  const [gallery, setGallery] = useState<string[]>([])
  const [departureCities, setDepartureCities] = useState<string[]>([])

  const qc = useQueryClient()
  const { data, isLoading } = useTours({ page, limit: 15, active: 'all' })
  const toggleTour = useToggleTour()

  const createTour = useMutation({
    mutationFn: (dto: CreateTourDto) =>
      editingTour ? toursApi.update(editingTour.id, dto) : toursApi.create(dto),
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

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateTourDto>({
    resolver: zodResolver(createTourSchema),
    defaultValues: {
      tourType: 'pasadia',
      difficulty: 'moderado',
      durationDays: 1,
      minPersons: 1,
      maxPersons: 20,
      isFeatured: false,
      itinerary: [],
      includes: {
        transport: false,
        breakfast: false,
        lunch: false,
        snacks: false,
        insurance: false,
        guide: false,
        parkEntrance: false,
        souvenir: false,
        accommodation: false,
        activity: '',
        notes: '',
      },
    },
  })

  const { fields: itineraryFields, append: appendItinerary, remove: removeItinerary } = useFieldArray({
    control,
    name: 'itinerary',
  })

  const {
    register: regAvail,
    handleSubmit: handleAvail,
    formState: { isSubmitting: submittingAvail },
  } = useForm<{
    startDate: string
    endDate: string
    departureCity: string
    totalSpots: number
    priceOverride?: number
  }>()

  const resetStringArrays = () => {
    setExcludes([])
    setRecommendations([])
    setRestrictions([])
    setWhatToBring([])
    setGallery([])
    setDepartureCities([])
  }

  const openEdit = (tour: Tour) => {
    setEditingTour(tour)
    setValue('name', tour.name)
    setValue('slug', tour.slug)
    setValue('internalName', tour.internalName ?? '')
    setValue('tourType', tour.tourType)
    setValue('destination', tour.destination)
    setValue('description', tour.description ?? '')
    setValue('basePrice', tour.basePrice)
    setValue('priceChild', tour.priceChild)
    setValue('durationDays', tour.durationDays)
    setValue('minPersons', tour.minPersons)
    setValue('maxPersons', tour.maxPersons)
    setValue('difficulty', tour.difficulty as CreateTourDto['difficulty'])
    setValue('isFeatured', tour.isFeatured)
    setValue('coverImage', tour.coverImage ?? '')
    setValue('includes', {
      transport: tour.includes?.transport ?? false,
      breakfast: tour.includes?.breakfast ?? false,
      lunch: tour.includes?.lunch ?? false,
      snacks: tour.includes?.snacks ?? false,
      insurance: tour.includes?.insurance ?? false,
      guide: tour.includes?.guide ?? false,
      parkEntrance: tour.includes?.parkEntrance ?? false,
      souvenir: tour.includes?.souvenir ?? false,
      accommodation: tour.includes?.accommodation ?? false,
      activity: tour.includes?.activity ?? '',
      notes: tour.includes?.notes ?? '',
    })
    setValue(
      'itinerary',
      (tour.itinerary as { time: string; activity: string }[] | undefined) ?? [],
    )
    setExcludes(tour.excludes ?? [])
    setRecommendations(tour.recommendations ?? [])
    setRestrictions(tour.restrictions ?? [])
    setWhatToBring(tour.whatToBring ?? [])
    setGallery(tour.gallery ?? [])
    setDepartureCities(tour.departureCities ?? [])
    setActiveTab(0)
    setFormModal(true)
  }

  const onSubmit = (data: CreateTourDto) => {
    createTour.mutate({
      ...data,
      excludes: excludes.filter(Boolean),
      recommendations: recommendations.filter(Boolean),
      restrictions: restrictions.filter(Boolean),
      whatToBring: whatToBring.filter(Boolean),
      gallery: gallery.filter(Boolean),
      departureCities: departureCities.filter(Boolean),
    })
  }

  const tabHasError = (tab: number) => {
    if (tab === 0) {
      return !!(
        errors.slug || errors.name || errors.tourType || errors.destination ||
        errors.basePrice || errors.durationDays || errors.minPersons || errors.maxPersons || errors.difficulty
      )
    }
    if (tab === 1) return !!(errors.description || errors.itinerary)
    if (tab === 2) return !!(errors.includes)
    if (tab === 3) return !!(errors.coverImage)
    if (tab === 4) return !!(errors.seoTitle || errors.seoDescription)
    return false
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

  const onAvail = async (form: {
    startDate: string
    endDate: string
    departureCity: string
    totalSpots: number
    priceOverride?: number
  }) => {
    const dates = generateDates(form.startDate, form.endDate)
    await bulkAvail.mutateAsync({
      dates,
      departureCity: form.departureCity,
      totalSpots: Number(form.totalSpots),
      priceOverride: form.priceOverride,
    })
    setAvailModal(false)
  }

  const watchedCoverImage = watch('coverImage')

  const columns = [
    {
      key: 'name',
      header: 'Tour',
      render: (t: Tour) => (
        <div>
          <p className="font-medium text-sm">{t.name}</p>
          <p className="text-xs text-gray-400">{t.destination}</p>
        </div>
      ),
    },
    {
      key: 'tourType',
      header: 'Tipo',
      render: (t: Tour) => <span className="text-xs text-gray-500 capitalize">{t.tourType}</span>,
    },
    {
      key: 'basePrice',
      header: 'Precio',
      render: (t: Tour) => <span className="font-semibold text-sm">{formatCOP(t.basePrice)}</span>,
    },
    {
      key: 'durationDays',
      header: 'Duración',
      render: (t: Tour) => <span className="text-sm">{t.durationDays}d</span>,
    },
    {
      key: 'difficulty',
      header: 'Dificultad',
      render: (t: Tour) => (
        <span
          className={`badge text-xs ${
            t.difficulty === 'facil'
              ? 'bg-green-100 text-green-700'
              : t.difficulty === 'dificil'
              ? 'bg-red-100 text-red-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {t.difficulty}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Estado',
      render: (t: Tour) => (
        <span
          className={`badge text-xs ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
        >
          {t.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (t: Tour) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(t)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="Editar">
            <Edit className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => { setSelectedTour(t); setAvailModal(true) }}
            className="p-1.5 hover:bg-brand-blue-50 rounded-lg"
            title="Disponibilidad"
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

  if (isLoading) return <PageLoader />

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tours</h1>
            <p className="text-gray-500 text-sm">{data?.total ?? 0} tours</p>
          </div>
          <button
            onClick={() => {
              setEditingTour(null)
              reset()
              resetStringArrays()
              setActiveTab(0)
              setFormModal(true)
            }}
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
          onClose={() => {
            setFormModal(false)
            setEditingTour(null)
            reset()
            resetStringArrays()
          }}
          title={editingTour ? `Editar: ${editingTour.name}` : 'Nuevo tour'}
          size="xl"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="-m-6">
            {/* Tab nav */}
            <div className="flex border-b border-gray-100 px-6 overflow-x-auto">
              {TABS.map((tab, idx) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={`relative shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === idx
                      ? 'text-brand-blue border-b-2 border-brand-blue'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                  {tabHasError(idx) && (
                    <span className="absolute top-2.5 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="px-6 py-5 min-h-[320px]">

              {/* Tab 0: Básico */}
              {activeTab === 0 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="label">Nombre del tour *</label>
                    <input {...register('name')} className="input" placeholder="Aventura al Nevado del Ruiz" />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="label">Nombre interno</label>
                    <input {...register('internalName')} className="input" placeholder="Para uso interno" />
                  </div>
                  <div>
                    <label className="label">Slug (URL) *</label>
                    <input {...register('slug')} className="input" placeholder="nevado-del-ruiz" />
                    {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>}
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
                    <label className="label">Destino *</label>
                    <input {...register('destination')} className="input" placeholder="PNN Los Nevados" />
                    {errors.destination && <p className="text-xs text-red-500 mt-1">{errors.destination.message}</p>}
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
                    <label className="label">Duración (días)</label>
                    <input {...register('durationDays', { valueAsNumber: true })} type="number" min="1" className="input" />
                  </div>
                  <div>
                    <label className="label">Mín. personas</label>
                    <input {...register('minPersons', { valueAsNumber: true })} type="number" min="1" className="input" />
                  </div>
                  <div>
                    <label className="label">Máx. personas</label>
                    <input {...register('maxPersons', { valueAsNumber: true })} type="number" min="1" className="input" />
                  </div>
                  <div>
                    <label className="label">Precio adulto (COP) *</label>
                    <input {...register('basePrice', { valueAsNumber: true })} type="number" className="input" placeholder="350000" />
                    {errors.basePrice && <p className="text-xs text-red-500 mt-1">{errors.basePrice.message}</p>}
                  </div>
                  <div>
                    <label className="label">Precio niño (COP)</label>
                    <input {...register('priceChild', { valueAsNumber: true })} type="number" className="input" placeholder="245000" />
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <input {...register('isFeatured')} type="checkbox" id="featured" className="rounded" />
                    <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                      Tour destacado en la portada
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 1: Descripción */}
              {activeTab === 1 && (
                <div className="space-y-5">
                  <div>
                    <label className="label">Descripción</label>
                    <textarea
                      {...register('description')}
                      className="input"
                      rows={6}
                      placeholder="Describe la experiencia..."
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="label mb-0">Itinerario</label>
                      <button
                        type="button"
                        onClick={() => appendItinerary({ time: '', activity: '' })}
                        className="text-xs btn-ghost"
                      >
                        + Agregar actividad
                      </button>
                    </div>
                    {itineraryFields.length === 0 && (
                      <p className="text-xs text-gray-400">Sin actividades. Haz clic en + Agregar actividad.</p>
                    )}
                    {itineraryFields.map((field, idx) => (
                      <div key={field.id} className="flex gap-2 mb-2 items-center">
                        <input
                          {...register(`itinerary.${idx}.time`)}
                          className="input w-28 text-sm"
                          placeholder="09:00"
                        />
                        <input
                          {...register(`itinerary.${idx}.activity`)}
                          className="input flex-1 text-sm"
                          placeholder="Descripción de la actividad..."
                        />
                        <button
                          type="button"
                          onClick={() => removeItinerary(idx)}
                          className="px-2 text-red-400 hover:text-red-600 text-xl leading-none"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Incluye */}
              {activeTab === 2 && (
                <div className="space-y-5">
                  <div>
                    <label className="label mb-2">¿Qué incluye?</label>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-6">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input {...register('includes.transport')} type="checkbox" className="rounded" />
                        Transporte
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input {...register('includes.breakfast')} type="checkbox" className="rounded" />
                        Desayuno
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input {...register('includes.lunch')} type="checkbox" className="rounded" />
                        Almuerzo
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input {...register('includes.snacks')} type="checkbox" className="rounded" />
                        Snacks
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input {...register('includes.insurance')} type="checkbox" className="rounded" />
                        Seguro
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input {...register('includes.guide')} type="checkbox" className="rounded" />
                        Guía
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input {...register('includes.parkEntrance')} type="checkbox" className="rounded" />
                        Entrada parque
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input {...register('includes.souvenir')} type="checkbox" className="rounded" />
                        Souvenir
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input {...register('includes.accommodation')} type="checkbox" className="rounded" />
                        Alojamiento
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="label">Actividad incluida</label>
                    <input {...register('includes.activity')} className="input" placeholder="Kayak, rapel..." />
                  </div>
                  <div>
                    <label className="label">Notas sobre lo que incluye</label>
                    <textarea {...register('includes.notes')} className="input" rows={2} />
                  </div>

                  <div className="border-t pt-4 space-y-4">
                    <div>
                      <label className="label mb-1">No incluye</label>
                      <StringList
                        items={excludes}
                        onChange={setExcludes}
                        placeholder="Alimentación extra..."
                        addLabel="Agregar"
                      />
                    </div>
                    <div>
                      <label className="label mb-1">Recomendaciones</label>
                      <StringList
                        items={recommendations}
                        onChange={setRecommendations}
                        placeholder="Llevar protector solar..."
                        addLabel="Agregar"
                      />
                    </div>
                    <div>
                      <label className="label mb-1">Restricciones</label>
                      <StringList
                        items={restrictions}
                        onChange={setRestrictions}
                        placeholder="No apto para menores de 12..."
                        addLabel="Agregar"
                      />
                    </div>
                    <div>
                      <label className="label mb-1">Qué llevar</label>
                      <StringList
                        items={whatToBring}
                        onChange={setWhatToBring}
                        placeholder="Botas de trekking..."
                        addLabel="Agregar"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Imágenes */}
              {activeTab === 3 && (
                <div className="space-y-5">
                  <div>
                    <label className="label">URL imagen principal</label>
                    <input {...register('coverImage')} className="input" placeholder="https://..." />
                    {errors.coverImage && (
                      <p className="text-xs text-red-500 mt-1">{errors.coverImage.message}</p>
                    )}
                    <ImagePreview key={watchedCoverImage} url={watchedCoverImage ?? ''} />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="label mb-0">Galería</label>
                      <button
                        type="button"
                        onClick={() => setGallery([...gallery, ''])}
                        className="text-xs btn-ghost"
                      >
                        + Agregar imagen
                      </button>
                    </div>
                    {gallery.map((url, idx) => (
                      <div key={idx} className="mb-3">
                        <div className="flex gap-2 items-center">
                          <input
                            value={url}
                            onChange={e => {
                              const a = [...gallery]
                              a[idx] = e.target.value
                              setGallery(a)
                            }}
                            className="input flex-1 text-sm"
                            placeholder="https://..."
                          />
                          <button
                            type="button"
                            onClick={() => setGallery(gallery.filter((_, i) => i !== idx))}
                            className="px-2 text-red-400 hover:text-red-600 text-xl leading-none"
                          >
                            ×
                          </button>
                        </div>
                        <ImagePreview key={url} url={url} />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="label mb-1">Ciudades de salida</label>
                    <StringList
                      items={departureCities}
                      onChange={setDepartureCities}
                      placeholder="Manizales"
                      addLabel="Agregar ciudad"
                    />
                  </div>
                </div>
              )}

              {/* Tab 4: SEO */}
              {activeTab === 4 && (
                <div className="space-y-4">
                  <div>
                    <label className="label">Título SEO</label>
                    <input
                      {...register('seoTitle')}
                      className="input"
                      placeholder="Tour al Nevado del Ruiz | Aves y Naturaleza"
                      maxLength={200}
                    />
                    {errors.seoTitle && (
                      <p className="text-xs text-red-500 mt-1">{errors.seoTitle.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="label">Descripción SEO</label>
                    <textarea
                      {...register('seoDescription')}
                      className="input"
                      rows={4}
                      placeholder="Descubre el volcán más alto de Colombia con guías expertos..."
                      maxLength={300}
                    />
                    {errors.seoDescription && (
                      <p className="text-xs text-red-500 mt-1">{errors.seoDescription.message}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setFormModal(false)}
                className="btn-ghost"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || createTour.isPending}
                className="btn-primary"
              >
                {isSubmitting || createTour.isPending
                  ? 'Guardando...'
                  : editingTour
                  ? 'Actualizar tour'
                  : 'Crear tour'}
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
            <p className="text-sm text-gray-500">
              Crea disponibilidad para un rango de fechas. Se crea un cupo por cada día del rango.
            </p>
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
                <input
                  {...regAvail('totalSpots', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Precio especial (opcional)</label>
                <input
                  {...regAvail('priceOverride', { valueAsNumber: true })}
                  type="number"
                  className="input"
                  placeholder="Precio diferente"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setAvailModal(false)} className="btn-ghost">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submittingAvail || bulkAvail.isPending}
                className="btn-primary"
              >
                {submittingAvail || bulkAvail.isPending ? 'Creando...' : 'Crear fechas'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
