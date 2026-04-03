import type React from 'react'
import { AlertTriangle, Info, Lightbulb } from 'lucide-react'

import { cn } from '@/lib/utils'

const CALLOUT_CONFIG = {
  warn: {
    icon: AlertTriangle,
    className: 'border-amber-500/30 bg-amber-500/8 text-amber-200/90',
    iconClassName: 'text-amber-400',
  },
  info: {
    icon: Info,
    className: 'border-blue-500/30 bg-blue-500/8 text-blue-200/90',
    iconClassName: 'text-blue-400',
  },
  tip: {
    icon: Lightbulb,
    className: 'border-emerald-500/30 bg-emerald-500/8 text-emerald-200/90',
    iconClassName: 'text-emerald-400',
  },
} as const

interface CalloutProps {
  type?: keyof typeof CALLOUT_CONFIG
  children: React.ReactNode
}

export function Callout({ type = 'info', children }: CalloutProps) {
  const config = CALLOUT_CONFIG[type]
  const Icon = config.icon

  return (
    <div className={cn('my-6 flex gap-3 rounded-lg border p-4', config.className)}>
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', config.iconClassName)} aria-hidden />
      <div className="text-sm leading-relaxed [&>p]:m-0">{children}</div>
    </div>
  )
}
