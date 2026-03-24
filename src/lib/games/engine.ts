import type { GameControls, GameState, TextOpts } from '@/types/games'

export abstract class GameEngine {
  protected readonly canvas: HTMLCanvasElement
  protected readonly ctx: CanvasRenderingContext2D
  protected readonly onExit: (score: number) => void
  protected readonly isMuted: () => boolean

  protected tickMs = 120
  protected gameTitle = ''

  private rafId = 0
  private lastTick = 0
  private paused = false
  private stopped = false
  private exitTimeout: ReturnType<typeof setTimeout> | null = null
  private keyHandler:   ((e: KeyboardEvent) => void) | null = null
  private keyUpHandler: ((e: KeyboardEvent) => void) | null = null

  private gameState: GameState = 'intro'
  private finalScore = 0

  constructor(
    canvas: HTMLCanvasElement,
    onExit: (score: number) => void,
    isMuted: () => boolean,
  ) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.onExit = onExit
    this.isMuted = isMuted
  }

  // ─── Abstract ─────────────────────────────────────────────────────────────

  protected abstract tick(): void
  protected abstract render(): void
  /** Reset all game state to initial values. Called on restart from gameover screen. */
  protected abstract restart(): void

  // ─── Key handlers — override as needed, default no-op ────────────────────

  protected onArrowUp():    void {}
  protected onArrowDown():  void {}
  protected onArrowLeft():  void {}
  protected onArrowRight(): void {}
  protected onKeyW():       void {}
  protected onKeyA():       void {}
  protected onKeyS():       void {}
  protected onKeyD():       void {}
  protected onSpace():      void {}
  protected onEnter():      void {}
  /** Called only for keys not dispatched to a named handler above */
  protected onKeyDown(_e: KeyboardEvent): void {}
  /** Called on keyup for any key */
  protected onKeyUp(_e: KeyboardEvent): void {}

  // ─── Drawing utilities ────────────────────────────────────────────────────

  /** Fill the entire canvas with a solid color. */
  protected clearCanvas(color: string): void {
    this.ctx.fillStyle = color
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  /** Draw a filled rectangle. */
  protected fillRect(x: number, y: number, w: number, h: number, color: string): void {
    this.ctx.fillStyle = color
    this.ctx.fillRect(x, y, w, h)
  }

  /** Draw a stroked (outline) rectangle. */
  protected strokeRect(x: number, y: number, w: number, h: number, color: string, lineWidth = 1): void {
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = lineWidth
    this.ctx.strokeRect(x, y, w, h)
  }

  /** Draw text. Resets textAlign/textBaseline to defaults after drawing unless opts specify them. */
  protected drawText(text: string, x: number, y: number, opts?: TextOpts): void {
    const { ctx } = this
    ctx.textAlign    = opts?.align    ?? 'left'
    ctx.textBaseline = opts?.baseline ?? 'alphabetic'
    const size = opts?.size ?? 16
    const font = opts?.font ?? '"Press Start 2P", monospace'
    ctx.font      = `${size}px ${font}`
    ctx.fillStyle = opts?.color ?? '#ffffff'
    ctx.fillText(text, x, y)
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /** Sizes the canvas to integer cell dimensions. Call once in the subclass constructor. */
  protected sizeCanvas(cols: number, rows: number): { cellW: number; cellH: number } {
    const rect = this.canvas.getBoundingClientRect()
    const cellW = Math.max(1, Math.floor(rect.width / cols))
    const cellH = Math.max(1, Math.floor(rect.height / rows))
    this.canvas.width  = cellW * cols
    this.canvas.height = cellH * rows
    this.canvas.style.imageRendering = 'pixelated'
    return { cellW, cellH }
  }

  /**
   * Transition to the gameover screen with the given score.
   * If delayMs > 0, the loop is stopped for that duration, then resumes on the gameover screen.
   * If delayMs = 0, transitions immediately (loop keeps running).
   */
  protected exit(score: number, delayMs = 0): void {
    this.finalScore = score
    if (delayMs > 0) {
      this.stopped = true
      this.exitTimeout = setTimeout(() => {
        this.stopped = false
        this.gameState = 'gameover'
        this.rafId = requestAnimationFrame(ts => this.loop(ts))
      }, delayMs)
    } else {
      this.gameState = 'gameover'
    }
  }

  // ─── Default screens ──────────────────────────────────────────────────────

  protected renderIntro(): void {
    const { canvas } = this
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const unit = Math.min(canvas.width / 20, canvas.height / 10, 14)

    this.clearCanvas('#0d1117')

    this.drawText(this.gameTitle, cx, cy - unit * 3, {
      size: unit * 1.5, color: '#7eecd4', align: 'center', baseline: 'middle',
    })
    this.drawText('PRESS SPACE TO START', cx, cy + unit * 2, {
      size: Math.max(5, unit * 0.7), color: '#45d4b0', align: 'center', baseline: 'middle',
    })
  }

  protected renderGameOver(): void {
    const { canvas } = this
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const unit = Math.min(canvas.width / 20, canvas.height / 10, 14)

    this.clearCanvas('#0d1117')

    this.drawText('GAME OVER', cx, cy - unit * 2.5, {
      size: unit, color: '#7eecd4', align: 'center', baseline: 'middle',
    })
    this.drawText(`SCORE  ${this.finalScore}`, cx, cy, {
      size: Math.max(5, unit * 0.8), color: '#45d4b0', align: 'center', baseline: 'middle',
    })
    this.drawText('SPACE — play again    ESC — quit', cx, cy + unit * 2.5, {
      size: Math.max(4, unit * 0.55), color: '#237a65', align: 'center', baseline: 'middle',
    })
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  public run(): GameControls {
    const handler = (e: KeyboardEvent) => this.dispatchKey(e)
    const upHandler = (e: KeyboardEvent) => this.onKeyUp(e)
    this.keyHandler   = handler
    this.keyUpHandler = upHandler
    document.addEventListener('keydown', handler)
    document.addEventListener('keyup', upHandler)
    this.rafId = requestAnimationFrame(ts => this.loop(ts))

    return {
      cleanup: () => this.cleanup(),
      pause:   () => { this.paused = true },
      resume:  () => { this.paused = false },
    }
  }

  // ─── Internal ─────────────────────────────────────────────────────────────

  private loop(timestamp: number): void {
    if (this.stopped) return

    if (this.paused) {
      this.rafId = requestAnimationFrame(ts => this.loop(ts))
      return
    }

    if (this.gameState === 'intro') {
      this.renderIntro()
      this.rafId = requestAnimationFrame(ts => this.loop(ts))
      return
    }

    if (this.gameState === 'gameover') {
      this.renderGameOver()
      this.rafId = requestAnimationFrame(ts => this.loop(ts))
      return
    }

    // playing
    if (timestamp - this.lastTick >= this.tickMs) {
      this.lastTick = timestamp
      this.tick()
      if (this.stopped) return
      // State may have changed to gameover inside tick(); schedule next frame to render it
      if (this.gameState !== 'playing') {
        this.rafId = requestAnimationFrame(ts => this.loop(ts))
        return
      }
    }

    this.render()
    this.rafId = requestAnimationFrame(ts => this.loop(ts))
  }

  private dispatchKey(e: KeyboardEvent): void {
    // Intro screen: Space/Enter starts game, Escape exits
    if (this.gameState === 'intro') {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        this.gameState = 'playing'
      } else if (e.key === 'Escape') {
        this.onExit(0)
      }
      return
    }

    // Gameover screen: Space/Enter restarts, Escape exits
    if (this.gameState === 'gameover') {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        this.restart()
        this.gameState = 'playing'
      } else if (e.key === 'Escape') {
        this.onExit(this.finalScore)
      }
      return
    }

    // Playing — dispatch to named handlers
    switch (e.key) {
      case 'ArrowUp':    e.preventDefault(); this.onArrowUp();    return
      case 'ArrowDown':  e.preventDefault(); this.onArrowDown();  return
      case 'ArrowLeft':  e.preventDefault(); this.onArrowLeft();  return
      case 'ArrowRight': e.preventDefault(); this.onArrowRight(); return
      case 'w': case 'W': this.onKeyW(); return
      case 'a': case 'A': this.onKeyA(); return
      case 's': case 'S': this.onKeyS(); return
      case 'd': case 'D': this.onKeyD(); return
      case ' ':     e.preventDefault(); this.onSpace(); return
      case 'Enter': this.onEnter(); return
    }
    this.onKeyDown(e)
  }

  private cleanup(): void {
    this.stopped = true
    cancelAnimationFrame(this.rafId)
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler)
      this.keyHandler = null
    }
    if (this.keyUpHandler) {
      document.removeEventListener('keyup', this.keyUpHandler)
      this.keyUpHandler = null
    }
    if (this.exitTimeout) {
      clearTimeout(this.exitTimeout)
      this.exitTimeout = null
    }
  }
}
