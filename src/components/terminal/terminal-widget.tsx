'use client'

import { useEffect, useRef } from 'react'

import { useTerminal } from '@/hooks/use-terminal'
import { Card } from '@/components/ui/card'

import { TerminalTitleBar } from './chrome/terminal-title-bar'
import { TerminalStream } from './stream/terminal-stream'

export function TerminalWidget() {
  const {
    lines,
    input,
    isLoading,
    handleInputChange,
    handleKeyDown,
    outputRef,
  } = useTerminal()
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Keep focus on the hidden input after each command
  useEffect(() => {
    inputRef.current?.focus()
  }, [lines])

  return (
    <Card
      className="h-[400px] flex flex-col shadow-none border-border overflow-hidden cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      <TerminalTitleBar />

      <TerminalStream
        lines={lines}
        input={input}
        isLoading={isLoading}
        outputRef={outputRef}
      />

      {/* Hidden input — captures all keystrokes */}
      <input
        ref={inputRef}
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
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
