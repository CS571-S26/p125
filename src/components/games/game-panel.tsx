'use client'

import { useEffect, useRef } from 'react'

import { useGame } from '@/contexts/game-context'
import { loadGame } from '@/lib/games/registry'
import type { GameControls } from '@/types/games'

import { PauseOverlay } from './pause-overlay'

export function GamePanel() {
  const { activeGame, exitGame, isMuted, isPaused,
          setIsPaused, setActiveConfig, activeConfig } = useGame()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const controlsRef = useRef<GameControls | null>(null)

  // Load config + start game
  useEffect(() => {
    if (!activeGame || !canvasRef.current) return
    let mounted = true

    loadGame(activeGame).then(config => {
      if (!mounted || !canvasRef.current) return
      setActiveConfig(config)
      controlsRef.current = config.start(
        canvasRef.current,
        score => exitGame(score),
        () => isMuted,
      )
    })

    return () => {
      mounted = false
      controlsRef.current?.cleanup()
      controlsRef.current = null
    }
  }, [activeGame, exitGame, setActiveConfig]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync isPaused → game controls
  useEffect(() => {
    if (isPaused) controlsRef.current?.pause()
    else controlsRef.current?.resume()
  }, [isPaused])

  // Keyboard: Escape / Cmd+C toggle pause; Q quits
  useEffect(() => {
    if (!activeGame) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || ((e.metaKey || e.ctrlKey) && e.key === 'c')) {
        e.preventDefault()
        setIsPaused(!isPaused)
      }
      if (e.key === 'q' || e.key === 'Q') exitGame()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [activeGame, exitGame, isPaused, setIsPaused])

  const bgColor = activeConfig?.bg ?? '#0e0e0f'

  return (
    <div className="flex-1 relative flex flex-col overflow-hidden" style={{ background: bgColor }}>
      <canvas ref={canvasRef} className="flex-1 w-full block" style={{ imageRendering: 'pixelated' }} />
      {isPaused && <PauseOverlay />}
    </div>
  )
}
