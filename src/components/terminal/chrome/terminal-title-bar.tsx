export function TerminalTitleBar() {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30 shrink-0">
      <div className="size-3 rounded-full bg-red-400/70" />
      <div className="size-3 rounded-full bg-yellow-400/70" />
      <div className="size-3 rounded-full bg-green-400/70" />
      <span className="ml-2 text-xs text-muted-foreground font-(family-name:--font-jetbrains-mono)">
        bash — visitor@vishrut.tech
      </span>
    </div>
  )
}
