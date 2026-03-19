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
  ): GameControls
}

export interface GameModule {
  config: GameConfig
}
// No GamePalette type — palette is fully local to each game file, never exported
