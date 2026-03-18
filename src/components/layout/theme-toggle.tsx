'use client'

import { useEffect, useState } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { Skeleton } from '../ui/skeleton'

const CYCLE: Record<string, string> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
}

const LABELS: Record<string, string> = {
  system: 'System theme',
  light: 'Light mode',
  dark: 'Dark mode',
}

const ICONS: Record<string, React.ReactNode> = {
  system: <Monitor className="size-4" />,
  light: <Sun className="size-4" />,
  dark: <Moon className="size-4" />,
}

export function ThemeToggle() {
  const { theme = 'system', setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  function cycleTheme() {
    setTheme(CYCLE[theme] ?? 'system')
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          onClick={cycleTheme}
          aria-label="Toggle theme"
        >
          {mounted ? ICONS[theme] : <Skeleton className="size-4" />}
          <span className="sr-only">{LABELS[theme]}</span>
        </Button>
      </TooltipTrigger>
      {mounted && (
        <TooltipContent>{LABELS[theme] ?? 'Toggle theme'}</TooltipContent>
      )}
    </Tooltip>
  )
}
