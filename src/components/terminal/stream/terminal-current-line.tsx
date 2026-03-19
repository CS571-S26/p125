import { cn } from '@/lib/utils'
import { TERMINAL_PROMPT } from '@/constants/terminal'

interface TerminalCurrentLineProps {
  input: string
  isLoading: boolean
  isFocused: boolean
}

export function TerminalCurrentLine({
  input,
  isLoading,
  isFocused,
}: TerminalCurrentLineProps) {
  return (
    <div className="text-sm leading-5 flex items-center">
      <span className="text-primary select-none shrink-0">
        {TERMINAL_PROMPT}&nbsp;
      </span>
      <span>{input}</span>
      {!isLoading && (
        <span
          className={cn(
            'inline-block w-[0.55ch] h-[1em] ml-px animate-[blink_1.2s_step-end_infinite]',
            isFocused
              ? 'bg-foreground'
              : 'border border-foreground bg-transparent',
          )}
        />
      )}
    </div>
  )
}
