import type { CommandResult, TerminalState } from '@/types/terminal'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function out(...lines: string[]): CommandResult {
  return { lines: lines.map(content => ({ type: 'output' as const, content })) }
}

function err(content: string): CommandResult {
  return { lines: [{ type: 'error' as const, content }] }
}

// ─── Handlers ────────────────────────────────────────────────────────────────

export function handleClear(): CommandResult {
  return { lines: [], nextState: { lines: [] } }
}

export function handleWhoami(): CommandResult {
  return out('visitor') // TODO: Save contact us information in local storage and check and display that here
}

export function handleDate(): CommandResult {
  return out(new Date().toLocaleString('en-US', { timeZoneName: 'short' }))
}

export function handleSkills(): CommandResult {
  return out("Skills coming soon!")
}

export function handleExperience(): CommandResult {
  return out('Work experience coming soon!')
}

export function handleProjects(): CommandResult {
  return out('Projects coming soon!')
}

export function handleContact(_args: string[], state: TerminalState): CommandResult {
  if (state.contactFlow) {
    return err('A contact session is already in progress. Press Ctrl+C to cancel.')
  }
  return {
    lines: [{ type: 'output' as const, content: "What's your name?" }],
    nextState: { contactFlow: { step: 'name', data: {} } },
  }
}

export function handleSudo(): CommandResult {
  return err('Nice try.')
}

export function handleRm(args: string[]): CommandResult {
  if (args.includes('-rf') || args.includes('-r') || args.includes('/')) {
    return err('rm: /: Permission denied')
  }
  return err(`rm: missing operand`)
}

export function handleExit(): CommandResult {
  return out('There is no escape.')
}
