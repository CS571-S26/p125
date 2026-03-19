'use client'

import { useEffect, useRef } from 'react'

import { useGame } from '@/contexts/game-context'
import { useTerminal } from '@/hooks/use-terminal'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { COMMANDS } from '@/lib/terminal/commands'
import { makeGamesCommand } from '@/lib/terminal/game-commands'

import { GamePanel } from '@/components/games/game-panel'

import { TerminalTitleBar } from './chrome/terminal-title-bar'
import { TerminalStream } from './stream/terminal-stream'

export function TerminalWidget() {
  const { lines, input, isLoading, handleInputChange, handleKeyDown, outputRef, appendLine } =
    useTerminal()
  const { activeGame, lastScore, launchGame } = useGame()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const cardRef  = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    COMMANDS['games'] = makeGamesCommand(launchGame)
  }, [launchGame])

  useEffect(() => {
    if (lastScore) {
      appendLine('system', `[${lastScore.gameId}] Game over — score: ${lastScore.score}`)
    }
  }, [lastScore]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!activeGame) inputRef.current?.focus()
  }, [lines, activeGame])

  // Scroll card into view and expand it when a game launches
  useEffect(() => {
    if (activeGame) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 50)
    }
  }, [activeGame])

  return (
    <Card
      ref={cardRef}
      className={cn(
        'flex flex-col shadow-none border-border overflow-hidden cursor-text transition-[height] duration-300',
        activeGame ? 'h-[480px]' : 'h-[400px]',
      )}
      onClick={() => { if (!activeGame) inputRef.current?.focus() }}
    >
      <TerminalTitleBar />

      {activeGame
        ? <GamePanel />
        : <TerminalStream
            lines={lines}
            input={input}
            isLoading={isLoading}
            outputRef={outputRef}
          />
      }

      <input
        ref={inputRef}
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={isLoading || !!activeGame}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="Terminal input"
        className="sr-only"
      />
    </Card>
  )
}
