import type { CommandResult } from '@/types/terminal'

import { out, err } from './helpers'

export async function handleNowPlaying(): Promise<CommandResult> {
  return out("Now playing coming soon...")
}

export async function handleWeather(): Promise<CommandResult> {
  return out("Weather coming soon...")
}

export async function handleJoke(): Promise<CommandResult> {
const res = await fetch('/api/terminal/joke')
  const data = await res.json()

  if (!res.ok) return err(data.error ?? 'Could not fetch joke.')

  if (data.type === 'single')   return out(data.joke)
  return out(data.setup, `  → ${data.delivery}`)
}

export async function handlePrice(args: string[]): Promise<CommandResult> {
  const ticker = args[0]?.toUpperCase()
  if (!ticker) {
    return err('Usage: price <ticker>  e.g. price BTC')
  }
  return out("Price coming soon...")
}

export async function handleDefine(args: string[]): Promise<CommandResult> {
  const word = args[0]?.toLowerCase()
  if (!word)     return err('Usage: define <word>  e.g. define ephemeral')
  
  const res = await fetch(`/api/terminal/define?word=${encodeURIComponent(word)}`)
  const data = await res.json()

  if (!res.ok) return err(data.error ?? 'Could not fetch definition.')

  return out(
    `${data.word}  (${data.partOfSpeech})`,
    `  ${data.definition}`,
  )
}
