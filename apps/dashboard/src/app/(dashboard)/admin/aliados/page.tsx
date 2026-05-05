'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DataTable } from '@/components/ui/DataTable'
import { aliadosApi } from '@/lib/api/endpoints'
import toast from 'react-hot-toast'
import { BadgeCheck, Building2, Star, Truck, UtensilsCrossed, HelpCircle } from 'lucide-react'

interface AliadoRow {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  is_active: boolean
  business_name?: string
  aliado_type?: 'ecohotel' | 'transporte' | 'restaurante' | 'otro'
  city?: string
  rating?: number
  is_verified?: boolean
  description?: string
}

const TYPE_LABELS: Record<string, string> = {
  ecohotel: 'Ecohotel',
  transporte: 'Transporte',
  restaurante: 'Restaurante',
  otro: 'Otro',
}

const TYPE_ICONS: Record<string, ReactNode> = {
  ecohotel: <Building2 className="w-3.5 h-3.5" />,
  transporte: <Truck className="w-3.5 h-3.5" />,
  restaurante: <UtensilsCrossed className="w-3.5 h-3.5" />,
  otro: <HelpCircle className="w-3.5 h-3.5" />,
}

const TYPE_COLORS: Record<string, string> = {
  ecohotel: 'bg-green-100 text-green-700',
  transporte: 'bg-blue-100 text-blue-700',
  restaurante: 'bg-orange-100 text-orange-700',
  otro: 'bg-gray-100 text-gray-600',
}

export default function AdminAliadosPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['aliados', page, typeFilter, search],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (typeFilter) params.type = typeFilter
      if (search) params.search = search
      params.page = String(page)
      params.limit = '20'
      const res = await aliadosApi.list(params)
      const body = res.data as unknown as {
        data: AliadoRow[]
        pagination: { total: number; page: number; limit: number; totalPages: number }
      }
      return { data: body.data, ...body.pagination }
    },
  })

  const verify = useMutation({
    mutationFn: (id: string) => aliadosApi.verify(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['aliados'] })
      toast.success('Estado de verificación actualizado')
    },
    onError: () => toast.error('Error al actualizar el aliado'),
  })

  const typeCounts = (data?.data ?? []).reduce<Record<string, number>>((acc, a) => {
    const t = a.aliado_type ?? 'otro'
    acc[t] = (acc[t] ?? 0) + 1
    return acc
  }, {})

  const columns = [
    {
      key: 'business',
      header: 'Aliado',
      render: (a: AliadoRow) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">
            {(a.business_name ?? a.first_name)?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-sm">{a.business_name ?? `${a.first_name} ${a.last_name}`}</p>
            <p className="text-xs text-gray-400">{a.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contacto',
      render: (a: AliadoRow) => (
        <div>
          <p className="text-sm text-gray-700">{a.first_name} {a.last_name}</p>
          <p className="text-xs text-gray-400">{a.phone ?? '—'}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (a: AliadoRow) => {
        const t = a.aliado_type ?? 'otro'
        return (
          <span className={`badge text-xs flex items-center gap-1 w-fit ${TYPE_COLORS[t]}`}>
            {TYPE_ICONS[t]}
            {TYPE_LABELS[t] ?? t}
          </span>
        )
      },
    },
    {
      key: 'city',
      header: 'Ciudad',
      render: (a: AliadoRow) => <span className="text-sm text-gray-500">{a.city ?? '—'}</span>,
    },
    {
      key: 'rating',
      header: 'Calificación',
      render: (a: AliadoRow) => (
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-medium">{a.rating ? Number(a.rating).toFixed(1) : '—'}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (a: AliadoRow) => (
        <div className="flex flex-col gap-1">
          <span className={`badge text-xs ${a.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {a.is_active ? 'Activo' : 'Inactivo'}
          </span>
          {a.is_verified && (
            <span className="badge text-xs bg-brand-blue-50 text-brand-blue flex items-center gap-1 w-fit">
              <BadgeCheck className="w-3 h-3" /> Verificado
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (a: AliadoRow) => (
        <button
          onClick={() => verify.mutate(a.id)}
          className="p-1.5 hover:bg-gray-100 rounded-lg"
          title={a.is_verified ? 'Quitar verificación' : 'Verificar aliado'}
        >
          <BadgeCheck className={`w-4 h-4 ${a.is_verified ? 'text-brand-blue' : 'text-gray-400'}`} />
        </button>
      ),
    },
  ]

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Aliados</h1>
          <p className="text-gray-500 text-sm">{data?.total ?? 0} proveedores registrados</p>
        </div>

        {/* Resumen por tipo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(['ecohotel', 'transporte', 'restaurante', 'otro'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(typeFilter === t ? '' : t)}
              className={`card-sm flex items-center gap-3 text-left transition-all ${typeFilter === t ? 'ring-2 ring-brand-blue' : ''}`}
            >
              <div className={`p-2 rounded-xl ${TYPE_COLORS[t].replace('text-', 'text-').split(' ')[0]} bg-opacity-20`}>
                <span className={TYPE_COLORS[t].split(' ')[1]}>{TYPE_ICONS[t]}</span>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{typeCounts[t] ?? 0}</p>
                <p className="text-xs text-gray-500">{TYPE_LABELS[t]}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="card">
          <DataTable
            columns={columns as Parameters<typeof DataTable>[0]['columns']}
            data={(data?.data ?? []) as Record<string, unknown>[]}
            total={data?.total}
            page={page}
            limit={20}
            isLoading={isLoading}
            onPageChange={setPage}
            onSearch={(q) => setSearch(q)}
            searchPlaceholder="Buscar aliado..."
            emptyMessage="Sin aliados registrados"
            filters={
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="input py-1.5 text-sm w-40"
              >
                <option value="">Todos los tipos</option>
                {Object.entries(TYPE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            }
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
