type Config = { subtitle: string; title: string }
type Listener = () => void

let override: Config | null = null
const listeners = new Set<Listener>()

export function getOverride() {
  return override
}

export function setOverride(config: Config | null) {
  override = config
  listeners.forEach((fn) => fn())
}

export function subscribe(fn: Listener) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
