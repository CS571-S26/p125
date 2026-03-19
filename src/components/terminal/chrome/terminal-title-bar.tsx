'use client'

import { useGame } from '@/contexts/game-context'

export function TerminalTitleBar() {
  const { activeGame, exitGame, liveScore } = useGame()

  if (activeGame) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-black shrink-0">
        <button
          onClick={() => exitGame()}
          className="size-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors cursor-pointer"
          aria-label="Exit game"
        />
        <div className="size-3 rounded-full bg-yellow-500/40" />
        <div className="size-3 rounded-full bg-green-500/40" />

        {/* Game name */}
        <span className="font-pixel ml-2 text-[7px] pt-0.5 text-muted-foreground uppercase tracking-widest">
          games — {activeGame}
        </span>

        <div className="flex-1" />

        {/* Score */}
        <span className="font-pixel text-[8px] text-game-accent">
          score: {liveScore ?? 0}
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
