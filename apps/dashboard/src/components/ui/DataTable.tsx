'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from './LoadingSpinner'

interface Column<T> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  total?: number
  page?: number
  limit?: number
  isLoading?: boolean
  onPageChange?: (page: number) => void
  onSearch?: (q: string) => void
  searchPlaceholder?: string
  filters?: React.ReactNode
  emptyMessage?: string
  keyField?: string
}

export function DataTable<T extends Record<string, unknown>>({
  columns, data, total = 0, page = 1, limit = 20,
  isLoading, onPageChange, onSearch, searchPlaceholder = 'Buscar...',
  filters, emptyMessage = 'Sin resultados', keyField = 'id',
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const totalPages = Math.ceil(total / limit)

  const handleSearch = (v: string) => {
    setSearch(v)
    onSearch?.(v)
  }

  return (
    <div className="space-y-3">
      {(onSearch || filters) && (
        <div className="flex items-center gap-3 flex-wrap">
          {onSearch && (
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="input pl-9 py-2"
              />
            </div>
          )}
          {filters && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              {filters}
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full bg-white">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={cn('table-header', col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-12">
                  <LoadingSpinner className="justify-center" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-gray-400 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={String(row[keyField] ?? i)} className="table-row">
                  {columns.map((col) => (
                    <td key={col.key} className={cn('table-cell', col.className)}>
                      {col.render ? col.render(row) : String(row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{total} resultados · página {page} de {totalPages}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page - 2 + i
              if (p < 1 || p > totalPages) return null
              return (
                <button
                  key={p}
                  onClick={() => onPageChange?.(p)}
                  className={cn(
                    'w-8 h-8 rounded-lg text-sm font-medium',
                    p === page ? 'bg-brand-blue text-white' : 'hover:bg-gray-100'
                  )}
                >
                  {p}
                </button>
              )
            })}
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
