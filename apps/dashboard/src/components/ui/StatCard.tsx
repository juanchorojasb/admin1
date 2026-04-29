import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from './LoadingSpinner'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
  iconBg: string
  loading?: boolean
}

export function StatCard({ title, value, change, trend = 'neutral', icon, iconBg, loading }: StatCardProps) {
  const trendConfig = {
    up: { color: 'text-green-600', Icon: ArrowUpRight },
    down: { color: 'text-red-500', Icon: ArrowDownRight },
    neutral: { color: 'text-gray-400', Icon: Minus },
  }
  const { color, Icon } = trendConfig[trend]

  return (
    <div className="stat-card">
      <div className={cn('stat-icon', iconBg)}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 truncate">{title}</p>
        {loading ? (
          <LoadingSpinner size="sm" className="justify-start mt-1" />
        ) : (
          <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        )}
        {change && !loading && (
          <div className={cn('flex items-center gap-0.5 mt-1 text-xs font-medium', color)}>
            <Icon className="w-3 h-3" />
            {change}
          </div>
        )}
      </div>
    </div>
  )
}
