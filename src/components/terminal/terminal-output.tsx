import type { RefObject } from 'react'

import type { TerminalLine } from '@/types/terminal'

import { TerminalLine as TerminalLineComponent } from './terminal-line'

interface TerminalOutputProps {
  lines: TerminalLine[]
  outputRef: RefObject<HTMLDivElement | null>
}

export function TerminalOutput({ lines, outputRef }: TerminalOutputProps) {
  return (
    <div
      ref={outputRef}
      className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5"
    >
      {lines.map((line) => (
        <TerminalLineComponent key={line.id} line={line} />
      ))}
    </div>
  )
}
