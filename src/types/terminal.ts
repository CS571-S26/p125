import type { ReactNode } from 'react'

export type TerminalLineType = 'input' | 'output' | 'error' | 'system'

export interface TerminalLine {
  id: string
  type: TerminalLineType
  content: ReactNode
}

export interface TerminalState {
  lines: TerminalLine[]
  input: string
  history: string[]
  historyIndex: number
  isLoading: boolean
}

export interface CommandResult {
  lines: Omit<TerminalLine, 'id'>[]
  nextState?: Partial<TerminalState>
}

export interface CommandDef {
  description: string
  /** One-line description shown in `help` listing. */
  usage?: string
  /** Extended info shown in `help <command>`. Supports multiple lines as an array. */
  details?: string[]
  aliases?: string[]
  type: 'sync' | 'async'
  handler: (args: string[], state: TerminalState) => CommandResult | Promise<CommandResult>
  hiddenFromHelp: boolean
}
