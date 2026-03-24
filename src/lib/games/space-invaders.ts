import type { GameConfig, GameControls } from '@/types/games'

import { GameEngine } from './engine'
import { playSound } from './audio'

// ─── Constants ────────────────────────────────────────────────────────────────

const GRID_COLS = 11
const GRID_ROWS = 5

type AlienType = 'squid' | 'crab' | 'octopus'

const ROW_TYPES: AlienType[] = ['squid', 'crab', 'crab', 'octopus', 'octopus']

const POINTS: Record<AlienType, number> = { squid: 30, crab: 20, octopus: 10 }

const COLORS: Record<AlienType, string> = {
  squid:   '#ffffff',
  crab:    '#7eecd4',
  octopus: '#3dba96',
}

const BG           = '#0d1117'
const PLAYER_COLOR = '#7eecd4'
const BULLET_COLOR = '#7eecd4'
const ALIEN_BULLET = '#f04040'

const STEP_X          = 6
const DROP_Y          = 14
const MARGIN_X        = 16
const PLAYER_SPEED    = 4   // px per render frame
const MAX_ALIEN_SHOTS = 3
const ALIEN_FIRE_RATE = 0.015  // chance per tick per alive alien (capped)
const BULLET_SPEED    = 5   // px per render frame

// ─── Pixel-art sprites ────────────────────────────────────────────────────────

type Sprite = readonly string[]

const SPRITES: Record<AlienType, readonly [Sprite, Sprite]> = {
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

// Player cannon — 4 rows × 9 cols
const PLAYER_SPRITE: Sprite = [
  '....X....',
  '...XXX...',
  '.XXXXXXX.',
  'XXXXXXXXX',
]

// ─── Types ────────────────────────────────────────────────────────────────────

interface Alien {
  col:   number
  row:   number
  type:  AlienType
  alive: boolean
}

interface Bullet {
  x:      number
  y:      number
  active: boolean
}

// ─── Game ─────────────────────────────────────────────────────────────────────

class SpaceInvadersGame extends GameEngine {
  protected tickMs = 400

  private aliens:    Alien[]  = []
  private dir        = 1
  private fleetX     = 0
  private fleetY     = 0
  private animFrame: 0 | 1 = 0

  private pixSize = 3
  private cellW   = 0
  private cellH   = 0

  // Player
  private playerX    = 0
  private moveLeft   = false
  private moveRight  = false
  private lives      = 3
  private hitFlash   = 0   // countdown frames after player hit

  // Bullets
  private playerBullet: Bullet = { x: 0, y: 0, active: false }
  private alienBullets: Bullet[] = []

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

  // ─── Sizing ───────────────────────────────────────────────────────────────

  private get playerW() { return PLAYER_SPRITE[0].length * this.pixSize }
  private get playerH() { return PLAYER_SPRITE.length * this.pixSize }
  private get shipY()   { return this.canvas.height - this.playerH - 20 }

  private initSizes(): void {
    const domRect = this.canvas.getBoundingClientRect()
    this.canvas.width  = Math.floor(domRect.width)
    this.canvas.height = Math.floor(domRect.height)
    const W = this.canvas.width
    const H = this.canvas.height

    this.pixSize = Math.max(2, Math.floor((W * 0.82) / (GRID_COLS * 14)))

    // Fleet occupies ~65% of usable width so it has room to march left/right
    const usableW  = W - 2 * MARGIN_X
    this.cellW     = Math.floor((usableW * 0.65) / GRID_COLS)
    this.cellH     = Math.floor((H * 0.48) / GRID_ROWS)

    // Center fleet horizontally
    this.fleetX  = MARGIN_X + Math.floor((usableW - GRID_COLS * this.cellW) / 2)
    this.fleetY  = Math.floor(H * 0.10)
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

  // ─── Drawing helpers ──────────────────────────────────────────────────────

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

  private centerX(spriteCols: number): number {
    return Math.floor((this.cellW - spriteCols * this.pixSize) / 2)
  }

  private centerY(spriteRows: number): number {
    return Math.floor((this.cellH - spriteRows * this.pixSize) / 2)
  }

  // ─── Input ────────────────────────────────────────────────────────────────

  protected onArrowLeft():  void { this.moveLeft  = true }
  protected onArrowRight(): void { this.moveRight = true }
  protected onKeyA():       void { this.moveLeft  = true }
  protected onKeyD():       void { this.moveRight = true }

  protected onKeyUp(e: KeyboardEvent): void {
    if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') this.moveLeft  = false
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.moveRight = false
  }

  protected onSpace(): void {
    if (!this.playerBullet.active) {
      this.playerBullet = {
        x: this.playerX + Math.floor(this.playerW / 2),
        y: this.shipY,
        active: true,
      }
      playSound('shoot', this.isMuted())
    }
  }

  // ─── Tick (fleet + alien fire) ────────────────────────────────────────────

  protected tick(): void {
    this.animFrame = this.animFrame === 0 ? 1 : 0

    const alive = this.aliens.filter(a => a.alive)
    if (!alive.length) {
      this.exit(this.score, 0)
      return
    }

    // Fleet movement
    const minCol    = Math.min(...alive.map(a => a.col))
    const maxCol    = Math.max(...alive.map(a => a.col))
    const leftEdge  = this.fleetX + minCol * this.cellW
    const rightEdge = this.fleetX + (maxCol + 1) * this.cellW

    if (
      (this.dir ===  1 && rightEdge + STEP_X > this.canvas.width - MARGIN_X) ||
      (this.dir === -1 && leftEdge  - STEP_X < MARGIN_X)
    ) {
      this.fleetY += DROP_Y
      this.dir    *= -1
    } else {
      this.fleetX += this.dir * STEP_X
    }

    // Alien fires a bullet (randomly, up to MAX_ALIEN_SHOTS in flight)
    const activeAlienShots = this.alienBullets.filter(b => b.active).length
    if (activeAlienShots < MAX_ALIEN_SHOTS && Math.random() < ALIEN_FIRE_RATE * alive.length) {
      // Pick a random alien from the bottom-most alive in each column
      const colMap = new Map<number, Alien>()
      for (const a of alive) {
        const prev = colMap.get(a.col)
        if (!prev || a.row > prev.row) colMap.set(a.col, a)
      }
      const shooters = [...colMap.values()]
      const shooter  = shooters[Math.floor(Math.random() * shooters.length)]
      const sprite   = SPRITES[shooter.type][0]
      const sx = this.fleetX + shooter.col * this.cellW + this.centerX(sprite[0].length) + Math.floor(sprite[0].length * this.pixSize / 2)
      const sy = this.fleetY + shooter.row * this.cellH + this.centerY(sprite.length) + sprite.length * this.pixSize
      this.alienBullets.push({ x: sx, y: sy, active: true })
    }
  }

  // ─── Render (player + bullets + collision each frame) ─────────────────────

  protected render(): void {
    const W = this.canvas.width
    this.clearCanvas(BG)

    // Fleet
    for (const alien of this.aliens) {
      if (!alien.alive) continue
      const sprites = SPRITES[alien.type]
      const sprite  = sprites[this.animFrame]
      const x = this.fleetX + alien.col * this.cellW + this.centerX(sprite[0].length)
      const y = this.fleetY + alien.row * this.cellH + this.centerY(sprite.length)
      this.drawSprite(sprite, x, y, COLORS[alien.type])
    }

    // Player — flash on hit
    if (this.hitFlash === 0 || Math.floor(this.hitFlash / 4) % 2 === 0) {
      this.drawSprite(PLAYER_SPRITE, this.playerX, this.shipY, PLAYER_COLOR)
    }
    if (this.hitFlash > 0) this.hitFlash--

    // Player movement (smooth, per render frame)
    if (this.moveLeft)  this.playerX = Math.max(MARGIN_X, this.playerX - PLAYER_SPEED)
    if (this.moveRight) this.playerX = Math.min(W - this.playerW - MARGIN_X, this.playerX + PLAYER_SPEED)

    // Player bullet
    if (this.playerBullet.active) {
      this.playerBullet.y -= BULLET_SPEED
      if (this.playerBullet.y < 0) {
        this.playerBullet.active = false
      } else {
        this.fillRect(this.playerBullet.x - 1, this.playerBullet.y, 2, this.pixSize * 2, BULLET_COLOR)
        // Collision with aliens
        for (const alien of this.aliens) {
          if (!alien.alive) continue
          const sprite = SPRITES[alien.type][this.animFrame]
          const ax = this.fleetX + alien.col * this.cellW + this.centerX(sprite[0].length)
          const ay = this.fleetY + alien.row * this.cellH + this.centerY(sprite.length)
          const aw = sprite[0].length * this.pixSize
          const ah = sprite.length    * this.pixSize
          if (
            this.playerBullet.x >= ax && this.playerBullet.x <= ax + aw &&
            this.playerBullet.y >= ay && this.playerBullet.y <= ay + ah
          ) {
            alien.alive = false
            this.playerBullet.active = false
            this.score += POINTS[alien.type]
            playSound('eat', this.isMuted())
            break
          }
        }
      }
    }

    // Alien bullets
    for (const b of this.alienBullets) {
      if (!b.active) continue
      b.y += BULLET_SPEED
      if (b.y > this.canvas.height) {
        b.active = false
        continue
      }
      this.fillRect(b.x - 1, b.y, 2, this.pixSize * 2, ALIEN_BULLET)

      // Collision with player (skip while flashing)
      if (this.hitFlash === 0) {
        if (
          b.x >= this.playerX && b.x <= this.playerX + this.playerW &&
          b.y >= this.shipY   && b.y <= this.shipY + this.playerH
        ) {
          b.active = false
          this.lives--
          this.hitFlash = 60
          playSound('die', this.isMuted())
          if (this.lives <= 0) {
            this.exit(this.score, 0)
            return
          }
        }
      }
    }

    // Lives HUD
    const livesLabel = `LIVES  ${this.lives}   SCORE  ${this.score}`
    this.drawText(livesLabel, 8, 16, { size: 8, color: '#45d4b0' })
  }

  protected restart(): void {
    this.score       = 0
    this.lives       = 3
    this.dir         = 1
    this.fleetX      = MARGIN_X + Math.floor(((this.canvas.width - 2 * MARGIN_X) - GRID_COLS * this.cellW) / 2)
    this.fleetY      = Math.floor(this.canvas.height * 0.10)
    this.animFrame   = 0
    this.hitFlash    = 0
    this.moveLeft    = false
    this.moveRight   = false
    this.playerBullet = { x: 0, y: 0, active: false }
    this.alienBullets = []
    this.playerX     = Math.floor(this.canvas.width / 2 - this.playerW / 2)
    this.initAliens()
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
