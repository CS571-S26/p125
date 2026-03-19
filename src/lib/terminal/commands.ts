import type { CommandDef, CommandResult } from '@/types/terminal'

import {
  handleClear,
  handleContact,
  handleDate,
  handleExit,
  handleExperience,
  handleProjects,
  handleRm,
  handleSkills,
  handleSudo,
  handleWhoami,
} from './static-commands'

// ─── Registry ─────────────────────────────────────────────────────────────────
// Async commands (PORT-017) will be merged into this object after they are built.

export const COMMANDS: Record<string, CommandDef> = {
  // ── Meta ──────────────────────────────────────────────────────────────────
  help: {
    description: 'Show available commands',
    type: 'sync',
    handler: (): CommandResult => {
      const lines = Object.entries(COMMANDS).flatMap(([name, def]) => {
        const tag = def.type === 'async' ? ' [async]' : ''
        const usage = def.usage ? ` ${def.usage}` : ''
        const aliases = def.aliases?.length ? `  (alias: ${def.aliases.join(', ')})` : ''
        if (def.hiddenFromHelp) return []
        return [
          {
            type: 'output' as const,
            content: `  ${(name + usage).padEnd(24)}${def.description}${tag}${aliases}`,
          },
        ]
      })
      return { lines }
    },
    hiddenFromHelp: false,
  },

  clear: {
    description: 'Clear the terminal',
    type: 'sync',
    handler: handleClear,
    hiddenFromHelp: false,
  },

  // ── Info ──────────────────────────────────────────────────────────────────
  whoami: {
    description: 'Who are you?',
    type: 'sync',
    handler: handleWhoami,
    hiddenFromHelp: true,
  },

  date: {
    description: 'Print current date and time',
    type: 'sync',
    handler: handleDate,
    hiddenFromHelp: false,
  },

  skills: {
    description: 'List my technical skills',
    type: 'sync',
    handler: handleSkills,
    hiddenFromHelp: false,
  },

  experience: {
    description: 'View my work experience',
    type: 'sync',
    handler: handleExperience,
    hiddenFromHelp: false,
  },

  projects: {
    description: 'Browse my projects',
    type: 'sync',
    handler: handleProjects,
    hiddenFromHelp: false,
  },

  // ── Contact ───────────────────────────────────────────────────────────────
  contact: {
    description: 'Send me a message',
    type: 'sync',
    handler: handleContact,
    hiddenFromHelp: false,
  },

  // ── Easter eggs ───────────────────────────────────────────────────────────
  sudo: {
    description: '...',
    type: 'sync',
    handler: handleSudo,
    hiddenFromHelp: true,
  },

  rm: {
    description: '...',
    type: 'sync',
    handler: (args) => handleRm(args),
    hiddenFromHelp: true,
  },

  exit: {
    description: 'Exit the terminal',
    aliases: ['quit'],
    type: 'sync',
    handler: handleExit,
    hiddenFromHelp: true,
  },
}
