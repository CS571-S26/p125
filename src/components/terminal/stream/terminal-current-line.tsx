import { TERMINAL_PROMPT } from '@/constants/terminal'

interface TerminalCurrentLineProps {
  input: string
  isLoading: boolean
}

export function TerminalCurrentLine({
  input,
  isLoading,
}: TerminalCurrentLineProps) {
  return (
    <div className="text-sm leading-5 flex items-center">
      <span className="text-primary select-none shrink-0">
        {TERMINAL_PROMPT}&nbsp;
      </span>
      <span>{input}</span>
      {!isLoading && (
        <span className="inline-block w-[0.55ch] h-[1em] bg-foreground ml-px animate-[blink_1.2s_step-end_infinite]" />
      )}
    </div>
  )
}
