'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { configApi } from '@/lib/api/endpoints'

export const SITE_CONFIG_KEY = 'site-config'

export function useSiteConfig() {
  return useQuery({
    queryKey: [SITE_CONFIG_KEY],
    queryFn: async () => {
      const res = await configApi.getSite()
      return res.data.data as Record<string, unknown>
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateSiteConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) =>
      configApi.updateKey(key, value),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SITE_CONFIG_KEY] })
      toast.success('Guardado')
    },
    onError: () => toast.error('Error al guardar'),
  })
}

export function useUploadImage() {
  return useMutation({
    mutationFn: ({ file, filename }: { file: string; filename: string }) =>
      configApi.upload(file, filename),
    onError: () => toast.error('Error al subir imagen'),
  })
}
