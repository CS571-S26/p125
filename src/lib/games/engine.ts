import type { GameControls } from '@/types/games'
import type { TextOpts } from './types'

export abstract class GameEngine {
  protected readonly canvas: HTMLCanvasElement
  protected readonly ctx: CanvasRenderingContext2D
  protected readonly onExit: (score: number) => void
  protected readonly isMuted: () => boolean

  protected tickMs = 120

  private rafId = 0
  private lastTick = 0
  private paused = false
  private stopped = false
  private exitTimeout: ReturnType<typeof setTimeout> | null = null
  private keyHandler: ((e: KeyboardEvent) => void) | null = null

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
   * Stop the RAF loop and schedule the onExit callback.
   * Safe to call from inside tick() — the engine will not call render()
   * or schedule another frame after tick() returns.
   */
  protected exit(score: number, delayMs = 0): void {
    this.stopped = true
    this.exitTimeout = setTimeout(() => this.onExit(score), delayMs)
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  public run(): GameControls {
    const handler = (e: KeyboardEvent) => this.dispatchKey(e)
    this.keyHandler = handler
    document.addEventListener('keydown', handler)
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

    if (timestamp - this.lastTick >= this.tickMs) {
      this.lastTick = timestamp
      this.tick()
      // If tick() called exit(), stopped is now true.
      // Do not call render() or schedule another frame.
      if (this.stopped) return
    }

    this.render()
    this.rafId = requestAnimationFrame(ts => this.loop(ts))
  }

  private dispatchKey(e: KeyboardEvent): void {
    switch (e.key) {
      case 'ArrowUp':    e.preventDefault(); this.onArrowUp();    return
      case 'ArrowDown':  e.preventDefault(); this.onArrowDown();  return
      case 'ArrowLeft':  e.preventDefault(); this.onArrowLeft();  return
      case 'ArrowRight': e.preventDefault(); this.onArrowRight(); return
      case 'w': case 'W': this.onKeyW(); return
      case 'a': case 'A': this.onKeyA(); return
      case 's': case 'S': this.onKeyS(); return
      case 'd': case 'D': this.onKeyD(); return
      case ' ':     this.onSpace(); return
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
    if (this.exitTimeout) {
      clearTimeout(this.exitTimeout)
      this.exitTimeout = null
    }
  }
}
