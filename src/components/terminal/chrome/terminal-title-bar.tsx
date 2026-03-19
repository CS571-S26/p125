'use client'

import { useGame } from '@/contexts/game-context'

export function TerminalTitleBar() {
  const { activeGame, exitGame } = useGame()

  if (activeGame) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30 shrink-0">
        <button
          onClick={() => exitGame()}
          className="size-3 rounded-full bg-red-400/70 hover:bg-red-500 transition-colors cursor-pointer"
          aria-label="Exit game"
        />
        <div className="size-3 rounded-full bg-yellow-400/70" />
        <div className="size-3 rounded-full bg-green-400/70" />
        <span className="ml-2 text-xs text-muted-foreground font-(family-name:--font-jetbrains-mono)">
          {activeGame} — Esc pause · Q quit
        </span>
      </div>
    )
  }

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
