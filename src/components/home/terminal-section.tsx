import { TerminalWidget } from '../terminal/terminal-widget'

export function TerminalSection() {
  return (
    <section className="max-w-3xl mx-auto w-full px-4 pb-24">
      <p className="text-xs text-muted-foreground font-(family-name:--font-jetbrains-mono) mb-4">
        Type <span className="text-foreground">help</span> to explore.
      </p>
      <TerminalWidget />
    </section>
  )
}
