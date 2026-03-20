import { NextResponse } from 'next/server'

export async function GET() {
  const res = await fetch('https://v2.jokeapi.dev/joke/Programming?safe-mode', {
    cache: 'no-store',
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch joke.' }, { status: 500 })
  }

  const data = await res.json()

  if (data.type === 'single') {
    return NextResponse.json({ type: 'single', joke: data.joke })
  }

  return NextResponse.json({ type: 'twopart', setup: data.setup, delivery: data.delivery })
}
