import type { GameConfig, GameId, GameModule } from '@/types/games'

// Static import map — bundler can analyze these at build time.
// Add new games here as they are built.
const REGISTRY: Record<GameId, () => Promise<GameModule>> = {
  'space-invaders': () => import('./space-invaders') as Promise<GameModule>,
  pacman:         () => import('./pacman') as Promise<GameModule>,
}

export async function loadGame(id: GameId): Promise<GameConfig> {
  const mod = await REGISTRY[id]()
  return mod.config
}
