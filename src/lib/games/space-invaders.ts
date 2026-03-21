import type { GameConfig, GameControls } from '@/types/games'

import { GameEngine } from './engine'

// ─── Constants ────────────────────────────────────────────────────────────────

const GRID_COLS = 11
const GRID_ROWS = 5

type AlienType = 'squid' | 'crab' | 'octopus'

const ROW_TYPES: AlienType[] = ['squid', 'crab', 'crab', 'octopus', 'octopus']

const COLORS: Record<AlienType, string> = {
  squid:   '#ffffff',   // white — classic top row
  crab:    '#7eecd4',   // site teal
  octopus: '#3dba96',   // deeper green
}

const BG           = '#0d1117'
const PLAYER_COLOR = '#7eecd4'
const STEP_X       = 6
const DROP_Y       = 14
const MARGIN_X     = 16

// ─── Pixel-art sprites — two animation frames per type ────────────────────────
// Each row is a string; 'X' = filled pixel, '.' = empty

type Sprite = readonly string[]

const SPRITES: Record<AlienType, readonly [Sprite, Sprite]> = {
  // 8 cols × 6 rows
  squid: [
    [
      '..XXXX..',
      '.XXXXXX.',
      'XX.XX.XX',
      'XXXXXXXX',
      '.X....X.',
      'X......X',
    ],
    [
      '..XXXX..',
      '.XXXXXX.',
      'XX.XX.XX',
      'XXXXXXXX',
      '..X..X..',
      '.X....X.',
    ],
  ],
  // 11 cols × 8 rows
  crab: [
    [
      '..X.....X..',
      '...X...X...',
      '..XXXXXXX..',
      '.XX.X.X.XX.',
      'XXXXXXXXXXX',
      '.X.XXXXX.X.',
      'X.X.....X.X',
      '...X...X...',
    ],
    [
      '..X.....X..',
      '...X...X...',
      '..XXXXXXX..',
      '.XX.X.X.XX.',
      'XXXXXXXXXXX',
      '.X.XXXXX.X.',
      '.X.X...X.X.',
      'X.........X',
    ],
  ],
  // 12 cols × 8 rows
  octopus: [
    [
      '...XXXXXX...',
      '.XXXXXXXXXX.',
      'XX.XXXXXX.XX',
      'XXXXXXXXXXXX',
      '.XXXXXXXXXX.',
      '..X......X..',
      '.X........X.',
      'X..........X',
    ],
    [
      '...XXXXXX...',
      '.XXXXXXXXXX.',
      'XX.XXXXXX.XX',
      'XXXXXXXXXXXX',
      '.XXXXXXXXXX.',
      '..X......X..',
      'X..........X',
      '.X........X.',
    ],
  ],
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Alien {
  col: number
  row: number
  type: AlienType
  alive: boolean
}

// ─── Game ─────────────────────────────────────────────────────────────────────

class SpaceInvadersGame extends GameEngine {
  protected tickMs = 400

  private aliens: Alien[] = []
  private dir       = 1
  private fleetX    = 0
  private fleetY    = 0
  private animFrame: 0 | 1 = 0

  private pixSize = 3   // px per sprite pixel
  private cellW   = 0
  private cellH   = 0

  private playerX = 0
  private playerW = 0
  private playerH = 0

  private score = 0

  constructor(
    canvas: HTMLCanvasElement,
    onExit: (score: number) => void,
    isMuted: () => boolean,
  ) {
    super(canvas, onExit, isMuted)
    this.gameTitle = 'SPACE INVADERS'
    this.initSizes()
    this.initAliens()
  }

  private initSizes(): void {
    const domRect = this.canvas.getBoundingClientRect()
    this.canvas.width  = Math.floor(domRect.width)
    this.canvas.height = Math.floor(domRect.height)
    const W = this.canvas.width
    const H = this.canvas.height

    // pixSize: widest sprite is octopus at 12 cols; fit 11 aliens × 14 cols comfortably
    this.pixSize = Math.max(2, Math.floor((W * 0.82) / (GRID_COLS * 14)))

    // Cell = slot for each alien, evenly divides canvas width
    this.cellW = Math.floor(W / GRID_COLS)
    this.cellH = Math.floor((H * 0.48) / GRID_ROWS)

    this.fleetX = 0
    this.fleetY = Math.floor(H * 0.10)

    // Player
    this.playerW = this.pixSize * 15
    this.playerH = this.pixSize * 4
    this.playerX = Math.floor(W / 2 - this.playerW / 2)
  }

  private initAliens(): void {
    this.aliens = []
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        this.aliens.push({ col, row, type: ROW_TYPES[row], alive: true })
      }
    }
  }

  // Draw a pixel-art sprite at (x, y) using this.pixSize blocks
  private drawSprite(sprite: Sprite, x: number, y: number, color: string): void {
    const p = this.pixSize
    for (let r = 0; r < sprite.length; r++) {
      for (let c = 0; c < sprite[r].length; c++) {
        if (sprite[r][c] === 'X') {
          this.fillRect(x + c * p, y + r * p, p, p, color)
        }
      }
    }
  }

  // Return the x offset to center a sprite of given col count within a cell
  private centerX(spriteCols: number): number {
    return Math.floor((this.cellW - spriteCols * this.pixSize) / 2)
  }

  // Return the y offset to center a sprite of given row count within a cell
  private centerY(spriteRows: number): number {
    return Math.floor((this.cellH - spriteRows * this.pixSize) / 2)
  }

  protected restart(): void {
    this.score     = 0
    this.dir       = 1
    this.fleetX    = 0
    this.fleetY    = Math.floor(this.canvas.height * 0.10)
    this.animFrame = 0
    this.initAliens()
  }

  protected tick(): void {
    this.animFrame = this.animFrame === 0 ? 1 : 0

    const alive = this.aliens.filter(a => a.alive)
    if (!alive.length) {
      this.exit(this.score, 0)
      return
    }

    // Use cell boundaries for edge detection
    const minCol = Math.min(...alive.map(a => a.col))
    const maxCol = Math.max(...alive.map(a => a.col))
    const leftEdge  = this.fleetX + minCol * this.cellW
    const rightEdge = this.fleetX + (maxCol + 1) * this.cellW

    if (
      (this.dir ===  1 && rightEdge + STEP_X > this.canvas.width  - MARGIN_X) ||
      (this.dir === -1 && leftEdge  - STEP_X < MARGIN_X)
    ) {
      this.fleetY += DROP_Y
      this.dir    *= -1
    } else {
      this.fleetX += this.dir * STEP_X
    }
  }

  protected render(): void {
    this.clearCanvas(BG)

    for (const alien of this.aliens) {
      if (!alien.alive) continue
      const sprites = SPRITES[alien.type]
      const sprite  = sprites[this.animFrame]
      const ox = this.centerX(sprite[0].length)
      const oy = this.centerY(sprite.length)
      const x  = this.fleetX + alien.col * this.cellW + ox
      const y  = this.fleetY + alien.row * this.cellH + oy
      this.drawSprite(sprite, x, y, COLORS[alien.type])
    }

    // Player ship
    const shipY = this.canvas.height - this.playerH - 20
    this.fillRect(this.playerX, shipY, this.playerW, this.playerH, PLAYER_COLOR)
    // Cockpit
    const cw = this.pixSize * 3
    const ch = this.pixSize * 2
    this.fillRect(this.playerX + Math.floor((this.playerW - cw) / 2), shipY - ch, cw, ch, PLAYER_COLOR)
  }
}

// ─── Export ───────────────────────────────────────────────────────────────────

function start(
  canvas: HTMLCanvasElement,
  onExit: (score: number) => void,
  isMuted: () => boolean,
): GameControls {
  return new SpaceInvadersGame(canvas, onExit, isMuted).run()
}

export const config: GameConfig = {
  id: 'space-invaders',
  label: 'space invaders',
  bg: BG,
  sounds: ['shoot', 'die'],
  controls: ['ARROWS / AD  MOVE', 'SPACE  SHOOT', 'ESC  PAUSE', 'CTRL+C  QUIT'],
  start,
}
