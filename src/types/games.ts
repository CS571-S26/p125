export type GameId = 'snake' | 'platformer'

export interface GameModule {
  start(canvas: HTMLCanvasElement, onExit: (score?: number) => void): () => void
}
