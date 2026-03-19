import type { GameConfig, GameId, GameModule } from '@/types/games'

// Static import map — bundler can analyze these at build time.
// Add new games here as they are built.
const REGISTRY: Record<GameId, () => Promise<GameModule>> = {
  snake: () => import('./snake') as Promise<GameModule>,
  platformer: () => import('./snake') as Promise<GameModule>, // placeholder until PORT-047
}

export async function loadGame(id: GameId): Promise<GameConfig> {
  const mod = await REGISTRY[id]()
  return mod.config
}
