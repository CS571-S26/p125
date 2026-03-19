'use client'

import { createContext, useCallback, useContext, useState } from 'react'

import type { GameConfig, GameId } from '@/types/games'

interface GameContextValue {
  activeGame: GameId | null
  lastScore: { gameId: GameId; score: number } | null
  isMuted: boolean
  isPaused: boolean
  activeConfig: GameConfig | null
  launchGame: (id: GameId) => void
  exitGame: (score?: number) => void
  toggleMute: () => void
  setIsPaused: (v: boolean) => void
  setActiveConfig: (c: GameConfig | null) => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [activeGame, setActiveGame] = useState<GameId | null>(null)
  const [lastScore, setLastScore] = useState<{ gameId: GameId; score: number } | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [activeConfig, setActiveConfig] = useState<GameConfig | null>(null)

  const launchGame = useCallback((id: GameId) => {
    setActiveGame(id)
  }, [])

  const exitGame = useCallback((score?: number) => {
    setActiveGame(prev => {
      if (prev && score !== undefined) {
        setLastScore({ gameId: prev, score })
      }
      return null
    })
    setIsPaused(false)
    setActiveConfig(null)
  }, [])

  const toggleMute = useCallback(() => setIsMuted(m => !m), [])

  return (
    <GameContext.Provider value={{
      activeGame,
      lastScore,
      isMuted,
      isPaused,
      activeConfig,
      launchGame,
      exitGame,
      toggleMute,
      setIsPaused,
      setActiveConfig,
    }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within a GameProvider')
  return ctx
}
