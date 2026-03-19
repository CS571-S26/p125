'use client'

import { useEffect, useRef } from 'react'

import { useGame } from '@/contexts/game-context'
import { loadGame } from '@/lib/games/registry'

const GAME_LABELS: Record<string, string> = {
  snake: 'snake',
  platformer: 'platformer',
}

export function GameOverlay() {
  const { activeGame, exitGame } = useGame()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Load and start game when activeGame changes
  useEffect(() => {
    if (!activeGame || !canvasRef.current) return

    const canvas = canvasRef.current
    let cleanup: (() => void) | undefined

    async function startGame() {
      const mod = await loadGame(activeGame!)
      cleanup = mod.start(canvas, (score) => exitGame(score))
    }

    startGame()

    return () => {
      cleanup?.()
    }
  }, [activeGame, exitGame])

  // Escape key exits
  useEffect(() => {
    if (!activeGame) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') exitGame()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [activeGame, exitGame])

  if (!activeGame) return null

  const label = GAME_LABELS[activeGame] ?? activeGame

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col font-(family-name:--font-jetbrains-mono)">
      {/* Title bar — mirrors terminal chrome */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30 shrink-0">
        <button
          onClick={() => exitGame()}
          className="size-3 rounded-full bg-red-400/70 hover:bg-red-500 transition-colors cursor-pointer"
          aria-label="Exit game"
        />
        <div className="size-3 rounded-full bg-yellow-400/70" />
        <div className="size-3 rounded-full bg-green-400/70" />
        <span className="ml-2 text-xs text-muted-foreground">
          {label} — Press Escape or q to exit
        </span>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="flex-1 w-full block"
      />
    </div>
  )
}
