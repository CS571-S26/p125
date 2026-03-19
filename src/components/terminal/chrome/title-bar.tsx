import { cn } from '@/lib/utils'

type DotAction = {
  onClick: () => void
  ariaLabel?: string
}

type TitleBarProps = {
  title: React.ReactNode
  rightContent?: React.ReactNode
  redAction?: DotAction
  yellowAction?: DotAction
  greenAction?: DotAction
}

const DOT_COLORS = {
  red: {
    base: 'bg-red-400/70',
    glow: 'drop-shadow-[0_0_2px_theme(--color-red-500)]',
  },
  yellow: {
    base: 'bg-yellow-400/70',
    glow: 'drop-shadow-[0_0_2px_theme(--color-yellow-500)]',
  },
  green: {
    base: 'bg-green-400/70',
    glow: 'drop-shadow-[0_0_2px_theme(--color-green-500)]',
  },
}

function Dot({
  color,
  action,
}: {
  color: keyof typeof DOT_COLORS
  action?: DotAction
}) {
  const { base, glow } = DOT_COLORS[color]

  if (action) {
    return (
      <button
        onClick={action.onClick}
        aria-label={action.ariaLabel}
        className={cn(
          'size-3 rounded-full transition-colors cursor-pointer',
          base,
          glow,
        )}
      />
    )
  }

  return <div className={cn('size-3 rounded-full', base)} />
}

export function TitleBar({
  title,
  rightContent,
  redAction,
  yellowAction,
  greenAction,
}: TitleBarProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30 shrink-0">
      <Dot color="red" action={redAction} />
      <Dot color="yellow" action={yellowAction} />
      <Dot color="green" action={greenAction} />

      <span className="ml-2 text-xs text-muted-foreground font-(family-name:--font-jetbrains-mono)">
        {title}
      </span>

      {rightContent && (
        <>
          <div className="flex-1" />
          {rightContent}
        </>
      )}
    </div>
  )
}
