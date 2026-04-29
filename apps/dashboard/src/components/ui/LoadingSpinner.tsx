import { cn } from '@/lib/utils'
import { Leaf } from 'lucide-react'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: Props) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Leaf className={cn('text-brand-green animate-spin', sizes[size])} />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-gray-400">Cargando...</p>
    </div>
  )
}
