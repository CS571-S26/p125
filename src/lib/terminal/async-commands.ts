import type { CommandResult } from '@/types/terminal'

import { err, out } from './helpers'

export async function handleNowPlaying(): Promise<CommandResult> {
  const res = await fetch('/api/terminal/nowplaying')
  const data = await res.json()

  if (!res.ok) return err(data.error ?? 'Could not fetch Spotify data.')

  const status = data.nowPlaying ? '▶ now playing' : '⏸ last played'
  return out(`${status}: ${data.track} — ${data.artist}`)
}

export async function handleWeather(): Promise<CommandResult> {
  const res = await fetch('/api/terminal/weather')
  const data = await res.json()

  if (!res.ok) return err(data.error ?? 'Could not fetch weather.')

  return out(
    `${data.city}: ${data.temp}°F (feels like ${data.feelsLike}°F)`,
    `${data.description.charAt(0).toUpperCase() + data.description.slice(1)} · Humidity ${data.humidity}%`,
  )
}

export async function handleJoke(): Promise<CommandResult> {
  const res = await fetch('/api/terminal/joke')
  const data = await res.json()

  if (!res.ok) return err(data.error ?? 'Could not fetch joke.')

  if (data.type === 'single') return out(data.joke)
  return out(data.setup, `  → ${data.delivery}`)
}

export async function handlePrice(args: string[]): Promise<CommandResult> {
  const ticker = args[0]?.toLowerCase()
  if (!ticker) return err('Usage: price <ticker>  e.g. price btc')

  const res = await fetch(`/api/terminal/price?ticker=${encodeURIComponent(ticker)}`)
  const data = await res.json()

  if (!res.ok) return err(data.error ?? 'Could not fetch price.')

  const change = data.change24h
  const sign = change >= 0 ? '+' : ''
  const arrow = change >= 0 ? '▲' : '▼'
  return out(
    `${data.ticker}: $${data.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}  ${arrow} ${sign}${change.toFixed(2)}% (24h)`,
  )
}

export async function handleDefine(args: string[]): Promise<CommandResult> {
  const word = args[0]?.toLowerCase()
  if (!word) return err('Usage: define <word>  e.g. define ephemeral')

  const res = await fetch(`/api/terminal/define?word=${encodeURIComponent(word)}`)
  const data = await res.json()

  if (!res.ok) return err(data.error ?? 'Could not fetch definition.')

  return out(
    `${data.word}  (${data.partOfSpeech})`,
    `  ${data.definition}`,
  )
}
