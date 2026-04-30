import type { TerminalLine as TerminalLineType } from '@/types/terminal'
import { TERMINAL_PROMPT } from '@/constants/terminal'

interface TerminalLineProps {
  line: TerminalLineType
}

export function TerminalLine({ line }: TerminalLineProps) {
  if (line.type === 'input') {
    return (
      <div className="text-sm leading-5">
        <span className="text-primary select-none">{TERMINAL_PROMPT}</span>{' '}
        <span>{line.content as string}</span>
      </div>
    )
  }

  if (line.type === 'error') {
    return (
      <div className="text-sm leading-5 text-destructive">{line.content}</div>
    )
  }

  if (line.type === 'system') {
    return (
      <div className="text-sm leading-5 text-muted-foreground italic whitespace-pre-wrap">
        {line.content}
      </div>
    )
  }

  // output
  return <div className="text-sm leading-5 whitespace-pre-wrap">{line.content}</div>
}
