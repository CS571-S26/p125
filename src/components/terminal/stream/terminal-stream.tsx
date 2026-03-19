import type { RefObject } from 'react'

import type { TerminalLine } from '@/types/terminal'

import { TerminalCurrentLine } from './terminal-current-line'
import { TerminalLine as TerminalLineComponent } from './terminal-line'

interface TerminalStreamProps {
  lines: TerminalLine[]
  input: string
  isLoading: boolean
  outputRef: RefObject<HTMLDivElement | null>
}

export function TerminalStream({
  lines,
  input,
  isLoading,
  outputRef,
}: TerminalStreamProps) {
  return (
    <div
      ref={outputRef}
      className="font-(family-name:--font-jetbrains-mono) flex-1 overflow-y-auto px-4 py-3 space-y-0.5"
    >
      {lines.map((line) => (
        <TerminalLineComponent key={line.id} line={line} />
      ))}
      <TerminalCurrentLine input={input} isLoading={isLoading} />
    </div>
  )
}
