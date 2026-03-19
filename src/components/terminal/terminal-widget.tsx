'use client'

import { useEffect, useRef } from 'react'

import { useGame } from '@/contexts/game-context'
import { useTerminal } from '@/hooks/use-terminal'
import { Card } from '@/components/ui/card'
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

  // Register the games command on mount (needs launchGame from context)
  useEffect(() => {
    COMMANDS['games'] = makeGamesCommand(launchGame)
  }, [launchGame])

  // Append score line when a game exits
  useEffect(() => {
    if (lastScore) {
      appendLine('system', `[${lastScore.gameId}] Game over — score: ${lastScore.score}`)
    }
  }, [lastScore]) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-focus input after commands, but not while a game is open
  useEffect(() => {
    if (!activeGame) inputRef.current?.focus()
  }, [lines, activeGame])

  return (
    <Card
      className="h-[400px] flex flex-col shadow-none border-border overflow-hidden cursor-text"
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

      {/* Hidden input — disabled while a game overlay is open */}
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
