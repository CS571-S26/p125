'use client'

import { useEffect, useRef } from 'react'
import { useGame } from '@/contexts/game-context'

import type { GameControls } from '@/types/games'
import { loadGame } from '@/lib/games/registry'

import { PauseOverlay } from './pause-overlay'

export function GamePanel() {
  const {
    activeGame,
    exitGame,
    isMuted,
    isPaused,
    setIsPaused,
    setActiveConfig,
    activeConfig,
    setLiveScore,
    toggleMute,
    launchGame,
  } = useGame()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const controlsRef = useRef<GameControls | null>(null)

  // Load config + start game
  useEffect(() => {
    if (!activeGame || !canvasRef.current) return
    let mounted = true

    loadGame(activeGame).then((config) => {
      if (!mounted || !canvasRef.current) return
      setActiveConfig(config)
      controlsRef.current = config.start(
        canvasRef.current,
        (score) => exitGame(score),
        () => isMuted,
        (score) => setLiveScore(score),
      )
    })

    return () => {
      mounted = false
      controlsRef.current?.cleanup()
      controlsRef.current = null
    }
  }, [activeGame, exitGame, setActiveConfig])

  // Sync isPaused context → game controls
  useEffect(() => {
    if (isPaused) controlsRef.current?.pause()
    else controlsRef.current?.resume()
  }, [isPaused])

  // Keyboard: Escape, Ctrl+C, Ctrl+R, Ctrl+M
  useEffect(() => {
    if (!activeGame) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setIsPaused(!isPaused)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        e.preventDefault()
        exitGame()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
        e.preventDefault()
        exitGame()
        setTimeout(() => launchGame(activeGame), 50)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
        e.preventDefault()
        toggleMute()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [activeGame, exitGame, isPaused, setIsPaused, toggleMute, launchGame])

  const bgColor = activeConfig?.bg ?? '#000000'
  const hints = activeConfig?.controls ?? []

  return (
    <div
      className="flex-1 relative flex flex-col overflow-hidden"
      style={{ background: bgColor }}
    >
      <canvas
        ref={canvasRef}
        className="flex-1 w-full block"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* Controls strip — bottom */}
      {hints.length > 0 && (
        <div className="shrink-0 flex items-center gap-5 px-3 py-1.5 bg-game-surface border-t border-game-line">
          {hints.map((h) => (
            <span
              key={h}
              className="font-pixel text-[6px] text-game-dim tracking-wide"
            >
              {h}
            </span>
          ))}
        </div>
      )}

      {isPaused && <PauseOverlay />}
    </div>
  )
}
