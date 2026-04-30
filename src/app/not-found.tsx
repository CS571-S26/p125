'use client'

import { usePathname } from 'next/navigation'
import { GameProvider } from '@/contexts/game-context'

import type { TerminalLine } from '@/types/terminal'
import { PageHeaderSetter } from '@/components/layout/page-header-setter'
import { TerminalWidget } from '@/components/terminal/terminal-widget'

const ASCII_404 = String.raw`
 _  _    ___    _  _
| || |  / _ \  | || |
| || |_| | | | | || |_
|__   _| | | | |__   _|
   | | | |_| |    | |
   |_|  \___/     |_|
`

function buildInitialLines(pathname: string): Omit<TerminalLine, 'id'>[] {
  return [
    { type: 'input', content: `navigate ${pathname}` },
    {
      type: 'error',
      content: `navigate: no such route '${pathname}'`,
    },
    {
      type: 'system',
      content: <pre className="leading-tight">{ASCII_404}</pre>,
    },
    { type: 'system', content: 'Page not found.' },
    {
      type: 'system',
      content:
        "Type 'navigate' to see available routes, or 'help' for all commands.",
    },
  ]
}

export default function NotFound() {
  const pathname = usePathname()

  return (
    <>
      <PageHeaderSetter subtitle="404" title="Not Found" />
      <GameProvider>
        <p className="text-xs text-muted-foreground font-(family-name:--font-jetbrains-mono) mb-4 pt-24">
          Lost? Try <span className="text-foreground">navigate</span> or{' '}
          <span className="text-foreground">help</span>.
        </p>
        <TerminalWidget initialLines={buildInitialLines(pathname)} />
      </GameProvider>
    </>
  )
}
