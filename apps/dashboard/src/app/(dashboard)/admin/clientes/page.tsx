'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DataTable } from '@/components/ui/DataTable'
import { RoleBadge } from '@/components/ui/Badge'
import { useUsers, useToggleUserStatus, useUserStats } from '@/hooks/useUsers'
import { formatDate } from '@/lib/utils'
import { UserCheck, UserX, Users, TrendingUp } from 'lucide-react'
import type { User } from '@/types'

export default function AdminClientesPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('cliente')

  const { data, isLoading } = useUsers({ page, limit: 20, ...(roleFilter ? { role: roleFilter } : {}), ...(search ? { search } : {}) })
  const { data: stats } = useUserStats()
  const toggleStatus = useToggleUserStatus()

  const columns = [
    {
      key: 'name', header: 'Usuario',
      render: (u: User) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-blue-100 flex items-center justify-center text-brand-blue font-bold text-sm shrink-0">
            {u.firstName[0]}{u.lastName[0]}
          </div>
          <div>
            <p className="font-medium text-sm">{u.firstName} {u.lastName}</p>
            <p className="text-xs text-gray-400">{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'phone', header: 'Teléfono', render: (u: User) => <span className="text-sm text-gray-500">{u.phone ?? '—'}</span> },
    { key: 'role', header: 'Rol', render: (u: User) => <RoleBadge role={u.role} /> },
    { key: 'referralCode', header: 'Código ref.', render: (u: User) => <span className="font-mono text-xs text-gray-400">{u.referralCode ?? '—'}</span> },
    { key: 'createdAt', header: 'Registro', render: (u: User) => <span className="text-sm text-gray-500">{formatDate(u.createdAt)}</span> },
    {
      key: 'isActive', header: 'Estado',
      render: (u: User) => (
        <span className={`badge text-xs ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {u.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'actions', header: '',
      render: (u: User) => (
        <button
          onClick={() => toggleStatus.mutate(u.id)}
          className="p-1.5 hover:bg-gray-100 rounded-lg"
          title={u.isActive ? 'Desactivar usuario' : 'Activar usuario'}
        >
          {u.isActive
            ? <UserX className="w-4 h-4 text-red-400" />
            : <UserCheck className="w-4 h-4 text-green-600" />}
        </button>
      ),
    },
  ]

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-500 text-sm">{data?.total ?? 0} usuarios · {stats?.newThisMonth ?? 0} nuevos este mes</p>
        </div>

        {/* Stats por rol */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { role: 'cliente', label: 'Clientes', icon: <Users className="w-4 h-4 text-brand-green" />, bg: 'bg-brand-green-50' },
              { role: 'freelance', label: 'Revendedores', icon: <TrendingUp className="w-4 h-4 text-purple-600" />, bg: 'bg-purple-50' },
              { role: 'aliado', label: 'Aliados', icon: <UserCheck className="w-4 h-4 text-orange-500" />, bg: 'bg-orange-50' },
              { role: 'admin', label: 'Admins', icon: <UserCheck className="w-4 h-4 text-brand-blue" />, bg: 'bg-brand-blue-50' },
            ].map((item) => (
              <button
                key={item.role}
                onClick={() => setRoleFilter(item.role)}
                className={`card-sm flex items-center gap-3 text-left transition-all ${roleFilter === item.role ? 'ring-2 ring-brand-blue' : ''}`}
              >
                <div className={`p-2 rounded-xl ${item.bg}`}>{item.icon}</div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{stats.byRole?.[item.role] ?? 0}</p>
                  <p className="text-xs text-gray-500">{item.label}</p>
                </div>
              </button>
            ))}
          </div>
        )}

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
            searchPlaceholder="Buscar por nombre, correo..."
            emptyMessage="Sin usuarios"
            filters={
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input py-1.5 text-sm w-36"
              >
                <option value="">Todos los roles</option>
                {['admin', 'cliente', 'freelance', 'aliado'].map((r) => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
            }
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
