import type { GameId, GameModule } from '@/types/games'

// Static import map — bundler can analyze these at build time.
// Add new games here as they are built.
const LOADERS: Record<GameId, () => Promise<{ start: GameModule['start'] }>> = {
  snake: () => import('./snake'),
  platformer: () => import('./snake'), // placeholder until PORT-047
}

export async function loadGame(id: GameId): Promise<GameModule> {
  const mod = await LOADERS[id]()
  return { start: mod.start }
}
