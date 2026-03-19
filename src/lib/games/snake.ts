import type { GameModule } from '@/types/games'

// Stub — replaced in PORT-045
export const start: GameModule['start'] = (_canvas, onExit) => {
  onExit(0)
  return () => {}
}
