import type { CommandDef, CommandResult } from '@/types/terminal'
import {
  Arg,
  Badge,
  Cmd,
  Dim,
  HelpRow,
  Indent,
  Muted,
  Stack,
} from '@/components/terminal/rich'

import {
  handleDefine,
  handleJoke,
  handleNowPlaying,
  handlePrice,
  handleWeather,
} from './async-commands'
import {
  handleClear,
  handleDate,
  handleExit,
  handleExperience,
  handleHello,
  handleProjects,
  handleRm,
  handleSkills,
  handleSudo,
  handleWhoami,
} from './static-commands'

// ─── Registry ─────────────────────────────────────────────────────────────────

export const COMMANDS: Record<string, CommandDef> = {
  // ── Meta ──────────────────────────────────────────────────────────────────
  help: {
    description: 'Show available commands',
    usage: '[command]',
    details: [
      'Lists all available commands with their usage.',
      'Run `help <command>` for detailed info on a specific command.',
    ],
    type: 'sync',
    handler: (args): CommandResult => {
      // help <command> — detail view for a specific command
      if (args[0]) {
        const query = args[0].toLowerCase()
        const entry = Object.entries(COMMANDS).find(
          ([name, def]) => name === query || def.aliases?.includes(query),
        )
        if (!entry) {
          return {
            lines: [
              { type: 'error', content: `help: no such command '${args[0]}'` },
            ],
          }
        }
        const [name, def] = entry
        return {
          lines: [
            {
              type: 'output',
              content: (
                <Stack>
                  <div>
                    <Cmd>{name}</Cmd>
                    {def.usage && (
                      <>
                        {' '}
                        <Arg>{def.usage}</Arg>
                      </>
                    )}
                    {def.type === 'async' && (
                      <>
                        {' '}
                        <Badge>async</Badge>
                      </>
                    )}
                  </div>
                  <Indent>
                    <Stack>
                      <Muted>{def.description}</Muted>
                      {def.details?.map((line, i) => (
                        <Dim key={i}>{line}</Dim>
                      ))}
                      {def.aliases?.length ? (
                        <Dim>aliases: {def.aliases.join(', ')}</Dim>
                      ) : null}
                    </Stack>
                  </Indent>
                </Stack>
              ),
            },
          ],
        }
      }

      // help — list all visible commands
      const lines = Object.entries(COMMANDS)
        .filter(([, def]) => !def.hiddenFromHelp)
        .map(([name, def]) => ({
          type: 'output' as const,
          content: (
            <HelpRow
              name={name}
              usage={def.usage}
              description={def.description}
              isAsync={def.type === 'async'}
              aliases={def.aliases}
            />
          ),
        }))
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

  hello: {
    description: 'Saying hi never hurts',
    type: 'sync',
    handler: handleHello,
    hiddenFromHelp: true,
  },

  // ── Async ─────────────────────────────────────────────────────────────────
  nowplaying: {
    description: 'What am I listening to right now?',
    details: [
      'Fetches the currently playing (or most recently played) track from Spotify.',
      'Uses the Spotify Web API with a server-side refresh token — no login required.',
    ],
    aliases: ['music'],
    type: 'async',
    handler: () => handleNowPlaying(),
    hiddenFromHelp: false,
  },

  weather: {
    description: 'Current weather in Madison, WI',
    details: [
      'Fetches live conditions from the OpenWeatherMap API.',
      "Always shows Madison, WI — where I'm based.",
    ],
    aliases: ['location'],
    type: 'async',
    handler: () => handleWeather(),
    hiddenFromHelp: false,
  },

  joke: {
    description: 'Tell me a programming joke',
    details: [
      'Pulls a random safe-mode programming joke from jokeapi.dev.',
      'Handles both single-line and two-part (setup/punchline) formats.',
    ],
    type: 'async',
    handler: () => handleJoke(),
    hiddenFromHelp: false,
  },

  price: {
    description: 'Crypto price lookup',
    usage: '<ticker>',
    details: [
      'Fetches the current USD price and 24h change from the CoinGecko API.',
      'Works with any crypto ticker — e.g. price btc, price pepe, price wif',
    ],
    type: 'async',
    handler: (args) => handlePrice(args),
    hiddenFromHelp: false,
  },

  define: {
    description: 'Look up a word definition',
    usage: '<word>',
    details: [
      'Fetches the definition, phonetic, and part of speech from dictionaryapi.dev.',
      'Example: define ephemeral',
    ],
    type: 'async',
    handler: (args) => handleDefine(args),
    hiddenFromHelp: false,
  },
}
