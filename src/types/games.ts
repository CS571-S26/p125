export type GameId = 'snake' | 'platformer'

export interface GameControls {
  cleanup: () => void
  pause: () => void
  resume: () => void
}

export interface GameConfig {
  id: GameId
  label: string
  bg: string             // canvas container background color (prevents flash before canvas loads)
  sounds: string[]       // sound names — files expected at /sounds/{name}.mp3
  controls: string[]     // display strings for pause overlay (e.g. 'Arrow keys — move')
  start(
    canvas: HTMLCanvasElement,
    onExit: (score: number) => void,
    isMuted: () => boolean,
    onScoreUpdate?: (score: number) => void,
  ): GameControls
}

export interface GameModule {
  config: GameConfig
}
