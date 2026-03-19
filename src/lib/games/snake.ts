import type { GameConfig, GameControls } from '@/types/games'

import { GameEngine } from './engine'
import { playSound } from './audio'

const COLS = 20
const ROWS = 13

// ─── Palette — site teal theme ────────────────────────────────────────────────

const BG = '#0d1117'   // deep dark background
const GRID = '#111520'   // barely-visible pixel grid
const HEAD = '#7eecd4'   // bright mint (site lightest accent)
const HEAD_HL = '#c2f7ec'   // 8-bit highlight strip on head
const BODY_NEAR = '#45d4b0'   // body near head
const BODY_FAR = '#237a65'   // body near tail
const BORDER = '#1a4a3e'   // wall tiles (dark)
const BORDER_HL = '#245c4f'   // wall highlight
const FOOD = '#f04040'   // red food
const FOOD_HL = '#ff8080'   // red highlight
const FOOD_DIM = '#6b1a1a'   // red dim (blink off state)
const OVERLAY = 'rgba(13,17,23,0.93)'
const OVER_DIM = '#45d4b0'

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Point = { x: number; y: number }
type Dir = { dx: number; dy: number }

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min
}

/** Linear interpolate two hex colors by t (0=a, 1=b). */
function lerpHex(a: string, b: string, t: number): string {
  const ar = parseInt(a.slice(1, 3), 16), ag = parseInt(a.slice(3, 5), 16), ab = parseInt(a.slice(5, 7), 16)
  const br = parseInt(b.slice(1, 3), 16), bg = parseInt(b.slice(3, 5), 16), bb = parseInt(b.slice(5, 7), 16)
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const bl = Math.round(ab + (bb - ab) * t)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`
}

function randomFood(snake: Point[]): Point {
  let food: Point
  do {
    food = { x: randInt(1, COLS - 1), y: randInt(1, ROWS - 1) }
  } while (snake.some(s => s.x === food.x && s.y === food.y))
  return food
}

// ─── Game ─────────────────────────────────────────────────────────────────────

class SnakeGame extends GameEngine {
  protected tickMs = 130

  private readonly cellW: number
  private readonly cellH: number
  private readonly pad: number

  private readonly onScoreUpdate?: (s: number) => void

  private snake: Point[]
  private dir: Dir
  private nextDir: Dir
  private food: Point
  private score: number
  private frame = 0
  private eatFlash = 0   // counts down after eating

  constructor(
    canvas: HTMLCanvasElement,
    onExit: (score: number) => void,
    isMuted: () => boolean,
    onScoreUpdate?: (s: number) => void,
  ) {
    super(canvas, onExit, isMuted)
    this.onScoreUpdate = onScoreUpdate
    const { cellW, cellH } = this.sizeCanvas(COLS, ROWS)
    this.cellW = cellW
    this.cellH = cellH
    this.pad = Math.max(1, Math.round(Math.min(cellW, cellH) * 0.12))
    this.snake = [{ x: 10, y: 6 }, { x: 9, y: 6 }, { x: 8, y: 6 }]
    this.dir = { dx: 1, dy: 0 }
    this.nextDir = { dx: 1, dy: 0 }
    this.food = randomFood(this.snake)
    this.score = 0
  }

  protected onArrowUp(): void { if (this.dir.dy !== 1) this.nextDir = { dx: 0, dy: -1 } }
  protected onArrowDown(): void { if (this.dir.dy !== -1) this.nextDir = { dx: 0, dy: 1 } }
  protected onArrowLeft(): void { if (this.dir.dx !== 1) this.nextDir = { dx: -1, dy: 0 } }
  protected onArrowRight(): void { if (this.dir.dx !== -1) this.nextDir = { dx: 1, dy: 0 } }
  protected onKeyW(): void { this.onArrowUp() }
  protected onKeyA(): void { this.onArrowLeft() }
  protected onKeyS(): void { this.onArrowDown() }
  protected onKeyD(): void { this.onArrowRight() }

  protected tick(): void {
    this.dir = this.nextDir

    const head = this.snake[0]
    const newHead = { x: head.x + this.dir.dx, y: head.y + this.dir.dy }

    if (
      newHead.x <= 0 || newHead.x >= COLS - 1 ||
      newHead.y <= 0 || newHead.y >= ROWS - 1 ||
      this.snake.some(s => s.x === newHead.x && s.y === newHead.y)
    ) {
      this.render()
      this.renderDeath()
      playSound('die', this.isMuted())
      this.exit(this.score, 2000)
      return
    }

    this.snake.unshift(newHead)
    if (newHead.x === this.food.x && newHead.y === this.food.y) {
      this.score++
      this.food = randomFood(this.snake)
      playSound('eat', this.isMuted())
      this.eatFlash = 50
      this.onScoreUpdate?.(this.score)
    } else {
      this.snake.pop()
    }
  }

  // ─── Rendering helpers ──────────────────────────────────────────────────────

  /** Filled pixel block for a grid cell. */
  private block(col: number, row: number, color: string): void {
    const { ctx, cellW, cellH, pad } = this
    ctx.fillStyle = color
    ctx.fillRect(col * cellW + pad, row * cellH + pad, cellW - pad * 2, cellH - pad * 2)
  }

  /** 8-bit style top+left highlight strip on a cell (drawn after the base block). */
  private highlight(col: number, row: number, color: string): void {
    const { ctx, cellW, cellH, pad } = this
    const s = Math.max(1, pad - 1)
    ctx.fillStyle = color
    ctx.fillRect(col * cellW + pad, row * cellH + pad, cellW - pad * 2, s)  // top
    ctx.fillRect(col * cellW + pad, row * cellH + pad, s, cellH - pad * 2)  // left
  }

  // ─── Main render ────────────────────────────────────────────────────────────

  protected render(): void {
    const { ctx, canvas, cellW, cellH } = this
    this.frame++

    // Background
    ctx.fillStyle = BG
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Subtle pixel grid — draw thin lines at each cell boundary
    ctx.fillStyle = GRID
    for (let c = 0; c <= COLS; c++) {
      ctx.fillRect(c * cellW, 0, 1, canvas.height)
    }
    for (let r = 0; r <= ROWS; r++) {
      ctx.fillRect(0, r * cellH, canvas.width, 1)
    }

    // Border walls
    this.renderBorder()

    // Food — smooth sine fade in/out (~2.5 s cycle)
    const foodAlpha = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(this.frame * 0.04))
    ctx.globalAlpha = foodAlpha
    this.block(this.food.x, this.food.y, FOOD)
    this.highlight(this.food.x, this.food.y, FOOD_HL)
    ctx.globalAlpha = 1

    // Snake body — smooth color gradient neck → tail
    const len = this.snake.length
    for (let i = len - 1; i >= 1; i--) {
      const t = (i - 1) / Math.max(len - 2, 1)   // 0 = neck, 1 = tip of tail
      const color = lerpHex(BODY_NEAR, BODY_FAR, t)
      this.block(this.snake[i].x, this.snake[i].y, color)
    }

    // Eat flash — smooth sine ease-out over 50 frames (~0.83 s at 60 fps)
    if (this.eatFlash > 0) {
      const t    = this.eatFlash / 50              // 1 → 0
      const ease = Math.sin(t * Math.PI / 2)       // sine ease-out: smooth tail
      // Canvas-wide teal wash
      ctx.fillStyle = `rgba(126,236,212,${(ease * 0.09).toFixed(3)})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      // Head glow
      ctx.shadowColor = HEAD
      ctx.shadowBlur  = ease * 26
      this.eatFlash--
    }

    const head = this.snake[0]
    this.block(head.x, head.y, HEAD)
    this.highlight(head.x, head.y, HEAD_HL)
    ctx.shadowBlur = 0
  }

  private renderBorder(): void {
    for (let c = 0; c < COLS; c++) {
      this.block(c, 0, BORDER)
      this.highlight(c, 0, BORDER_HL)
      this.block(c, ROWS - 1, BORDER)
    }
    for (let r = 1; r < ROWS - 1; r++) {
      this.block(0, r, BORDER)
      this.highlight(0, r, BORDER_HL)
      this.block(COLS - 1, r, BORDER)
    }
  }

  private renderDeath(): void {
    const { ctx, canvas, cellH } = this
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const unit = Math.max(6, Math.min(cellH - 2, 10))

    ctx.fillStyle = OVERLAY
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.font = `${unit}px "Press Start 2P", monospace`
    ctx.fillStyle = HEAD
    ctx.fillText('GAME OVER', cx, cy - unit * 2.5)

    ctx.font = `${Math.max(5, unit - 2)}px "Press Start 2P", monospace`
    ctx.fillStyle = OVER_DIM
    ctx.fillText(`SCORE  ${this.score}`, cx, cy + unit)
  }
}

// ─── Export ───────────────────────────────────────────────────────────────────

function start(
  canvas: HTMLCanvasElement,
  onExit: (score: number) => void,
  isMuted: () => boolean,
  onScoreUpdate?: (score: number) => void,
): GameControls {
  return new SnakeGame(canvas, onExit, isMuted, onScoreUpdate).run()
}

export const config: GameConfig = {
  id: 'snake',
  label: 'snake',
  bg: BG,
  sounds: ['eat', 'die'],
  controls: ['ARROWS / WASD  MOVE', 'ESC  PAUSE', 'CTRL+C  QUIT'],
  start,
}
