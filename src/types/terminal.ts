import type { ReactNode } from 'react'

export type TerminalLineType = 'input' | 'output' | 'error' | 'system'

export interface TerminalLine {
  id: string
  type: TerminalLineType
  content: ReactNode
}

export type ContactStep = 'name' | 'email' | 'message' | 'confirm'

export interface ContactFlow {
  step: ContactStep
  data: Partial<{ name: string; email: string; message: string }>
}

export interface TerminalState {
  lines: TerminalLine[]
  input: string
  history: string[]
  historyIndex: number
  isLoading: boolean
  contactFlow: ContactFlow | null
}

export interface CommandResult {
  lines: Omit<TerminalLine, 'id'>[]
  nextState?: Partial<TerminalState>
}

export interface CommandDef {
  description: string
  usage?: string
  aliases?: string[]
  type: 'sync' | 'async'
  handler: (args: string[], state: TerminalState) => CommandResult | Promise<CommandResult>
}
