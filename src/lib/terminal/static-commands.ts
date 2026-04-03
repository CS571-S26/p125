import type { CommandResult } from '@/types/terminal'

import { out, err } from './helpers'

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

export function handleHello(): CommandResult {
  return out('World!')
}