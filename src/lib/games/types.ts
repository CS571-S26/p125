export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface Point {
  x: number
  y: number
}

export interface Tile {
  rect: Rect
  solid: boolean
}

export interface TextOpts {
  size?: number
  color?: string
  align?: CanvasTextAlign
  baseline?: CanvasTextBaseline
  font?: string
}
