import type { GameId } from '@/types/games'
import type { CommandDef } from '@/types/terminal'

const GAME_LIST: { id: GameId; description: string }[] = [
  { id: 'snake', description: 'Classic snake on a canvas overlay' },
]

export function makeGamesCommand(launchGame: (id: GameId) => void): CommandDef {
  return {
    description: 'Browse and launch terminal games',
    usage: '[game]',
    type: 'sync',
    hiddenFromHelp: false,
    handler: (args) => {
      if (!args.length) {
        return {
          lines: [
            { type: 'output' as const, content: 'Available games:' },
            ...GAME_LIST.map(g => ({
              type: 'output' as const,
              content: `  ${g.id.padEnd(16)}${g.description}`,
            })),
            { type: 'output' as const, content: '' },
            { type: 'output' as const, content: "Usage: games <name>" },
          ],
        }
      }

      const gameId = args[0].toLowerCase()
      const game = GAME_LIST.find(g => g.id === gameId)

      if (!game) {
        return {
          lines: [{
            type: 'error' as const,
            content: `Unknown game: "${gameId}". Type 'games' to see available games.`,
          }],
        }
      }

      launchGame(game.id)
      return {
        lines: [{
          type: 'system' as const,
          content: `Launching ${game.id}... (Escape or q to exit)`,
        }],
      }
    },
  }
}
