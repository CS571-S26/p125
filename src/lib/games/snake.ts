import type { GameConfig, GameControls } from '@/types/games'

import { playSound } from './audio'

const COLS = 24
const ROWS = 16
const TICK_MS = 120

// Local only — never exported
const PALETTE = {
  bg:           '#0e0e0f',
  gridLine:     'rgba(255,255,255,0.04)',
  snakeHead:    '#5b8dd9',
  snakeBody:    '#3a5f99',
  food:         '#c97a4a',
  scoreText:    '#6b7280',
  gameOverBg:   'rgba(0,0,0,0.65)',
  gameOverText: '#e5e7eb',
}

type Point = { x: number; y: number }
type Dir = { dx: number; dy: number }

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min
}

function randomFood(snake: Point[]): Point {
  let food: Point
  do {
    food = { x: randInt(0, COLS), y: randInt(0, ROWS) }
  } while (snake.some(s => s.x === food.x && s.y === food.y))
  return food
}

function start(
  canvas: HTMLCanvasElement,
  onExit: (score: number) => void,
  isMuted: () => boolean,
): GameControls {
  const ctx = canvas.getContext('2d')!

  canvas.style.imageRendering = 'pixelated'

  // Size canvas pixels to match its CSS layout size
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height

  const cellW = canvas.width / COLS
  const cellH = canvas.height / ROWS

  // ─── State ────────────────────────────────────────────────────────────────
  let snake: Point[] = [
    { x: 12, y: 8 },
    { x: 11, y: 8 },
    { x: 10, y: 8 },
  ]
  let dir: Dir = { dx: 1, dy: 0 }
  let nextDir: Dir = { dx: 1, dy: 0 }
  let food: Point = randomFood(snake)
  let score = 0
  let alive = true
  let paused = false
  let lastTick = 0
  let rafId = 0
  let exitTimeout: ReturnType<typeof setTimeout> | null = null

  // ─── Rendering ────────────────────────────────────────────────────────────
  function render() {
    // Background
    ctx.fillStyle = PALETTE.bg
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Subtle grid
    ctx.strokeStyle = PALETTE.gridLine
    ctx.lineWidth = 0.5
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath()
      ctx.moveTo(x * cellW, 0)
      ctx.lineTo(x * cellW, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath()
      ctx.moveTo(0, y * cellH)
      ctx.lineTo(canvas.width, y * cellH)
      ctx.stroke()
    }

    // Food
    ctx.fillStyle = PALETTE.food
    ctx.beginPath()
    ctx.arc(
      food.x * cellW + cellW / 2,
      food.y * cellH + cellH / 2,
      Math.min(cellW, cellH) * 0.35,
      0,
      Math.PI * 2,
    )
    ctx.fill()

    // Snake segments
    const px = Math.min(cellW, cellH) * 0.1
    const radius = Math.min(cellW, cellH) * 0.25

    snake.forEach((seg, i) => {
      const alpha = i === 0 ? 1 : Math.max(0.35, 1 - (i / snake.length) * 0.65)
      ctx.globalAlpha = alpha
      ctx.fillStyle = i === 0 ? PALETTE.snakeHead : PALETTE.snakeBody
      ctx.beginPath()
      ctx.roundRect(
        seg.x * cellW + px,
        seg.y * cellH + px,
        cellW - px * 2,
        cellH - px * 2,
        radius,
      )
      ctx.fill()
    })
    ctx.globalAlpha = 1

    // Score
    const fontSize = Math.round(Math.min(cellW, cellH) * 0.65)
    ctx.font = `${fontSize}px monospace`
    ctx.fillStyle = PALETTE.scoreText
    ctx.textAlign = 'right'
    ctx.textBaseline = 'top'
    ctx.fillText(`score: ${score}`, canvas.width - px * 4, px * 4)
  }

  function renderGameOver() {
    ctx.fillStyle = PALETTE.gameOverBg
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const unit = Math.min(canvas.width, canvas.height) / 20

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.fillStyle = PALETTE.gameOverText
    ctx.font = `bold ${unit * 1.6}px monospace`
    ctx.fillText('GAME OVER', cx, cy - unit)

    ctx.fillStyle = PALETTE.scoreText
    ctx.font = `${unit}px monospace`
    ctx.fillText(`score: ${score}`, cx, cy + unit)
  }

  // ─── Game loop ────────────────────────────────────────────────────────────
  function loop(timestamp: number) {
    if (paused) {
      rafId = requestAnimationFrame(loop)
      return
    }

    if (alive && timestamp - lastTick >= TICK_MS) {
      lastTick = timestamp
      dir = nextDir

      const head = snake[0]
      const newHead = { x: head.x + dir.dx, y: head.y + dir.dy }

      // Collisions
      if (
        newHead.x < 0 || newHead.x >= COLS ||
        newHead.y < 0 || newHead.y >= ROWS ||
        snake.some(s => s.x === newHead.x && s.y === newHead.y)
      ) {
        alive = false
        render()
        renderGameOver()
        playSound('die', isMuted())
        exitTimeout = setTimeout(() => onExit(score), 1500)
        return
      }

      snake.unshift(newHead)
      if (newHead.x === food.x && newHead.y === food.y) {
        score++
        food = randomFood(snake)
        playSound('eat', isMuted())
      } else {
        snake.pop()
      }
    }

    render()
    rafId = requestAnimationFrame(loop)
  }

  // ─── Input ────────────────────────────────────────────────────────────────
  function onKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowUp':    case 'w': case 'W':
        e.preventDefault()
        if (dir.dy !== 1)  nextDir = { dx: 0, dy: -1 }; break
      case 'ArrowDown':  case 's': case 'S':
        e.preventDefault()
        if (dir.dy !== -1) nextDir = { dx: 0, dy: 1 };  break
      case 'ArrowLeft':  case 'a': case 'A':
        e.preventDefault()
        if (dir.dx !== 1)  nextDir = { dx: -1, dy: 0 }; break
      case 'ArrowRight': case 'd': case 'D':
        e.preventDefault()
        if (dir.dx !== -1) nextDir = { dx: 1, dy: 0 };  break
    }
  }

  document.addEventListener('keydown', onKeyDown)
  rafId = requestAnimationFrame(loop)

  // ─── Controls ─────────────────────────────────────────────────────────────
  return {
    cleanup() {
      cancelAnimationFrame(rafId)
      document.removeEventListener('keydown', onKeyDown)
      if (exitTimeout) clearTimeout(exitTimeout)
    },
    pause() { paused = true },
    resume() { paused = false },
  }
}

export const config: GameConfig = {
  id: 'snake',
  label: 'snake',
  bg: PALETTE.bg,
  sounds: ['eat', 'die'],
  controls: ['Arrow keys / WASD — move', 'Q — quit'],
  start,
}
