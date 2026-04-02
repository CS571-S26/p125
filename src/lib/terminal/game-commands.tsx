import type { GameId } from '@/types/games'
import type { CommandDef } from '@/types/terminal'
import { Muted, Dim, HelpRow } from '@/components/terminal/rich'

const GAME_LIST: { id: GameId; description: string }[] = [
  { id: 'snake',          description: 'Classic snake' },
  { id: 'space-invaders', description: 'Defend Earth from the alien fleet' },
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
            ...GAME_LIST.map(g => ({
              type: 'output' as const,
              content: <HelpRow name={g.id} description={g.description} />,
            })),
            {
              type: 'output' as const,
              content: <Dim>type <Muted>games &lt;name&gt;</Muted> to launch</Dim>,
            },
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
