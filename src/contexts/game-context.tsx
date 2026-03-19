'use client'

import { createContext, useCallback, useContext, useState } from 'react'

import type { GameId } from '@/types/games'

interface GameContextValue {
  activeGame: GameId | null
  lastScore: { gameId: GameId; score: number } | null
  launchGame: (id: GameId) => void
  exitGame: (score?: number) => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [activeGame, setActiveGame] = useState<GameId | null>(null)
  const [lastScore, setLastScore] = useState<{ gameId: GameId; score: number } | null>(null)

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
  }, [])

  return (
    <GameContext.Provider value={{ activeGame, lastScore, launchGame, exitGame }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within a GameProvider')
  return ctx
}
