import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const word = req.nextUrl.searchParams.get('word')?.toLowerCase()

  if (!word) {
    return NextResponse.json({ error: 'Missing query param: word' }, { status: 400 })
  }

  const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`, {
    cache: 'no-store',
  })

  if (res.status === 404) {
    return NextResponse.json({ error: `No definition found for "${word}".` }, { status: 404 })
  }

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch definition.' }, { status: 500 })
  }

  const data = await res.json()
  const entry = data[0]
  const meaning = entry?.meanings?.[0]
  const definition = meaning?.definitions?.[0]

  return NextResponse.json({
    word: entry.word,
    phonetic: entry.phonetic ?? entry.phonetics?.find((p: { text?: string }) => p.text)?.text,
    partOfSpeech: meaning.partOfSpeech,
    definition: definition.definition,
  })
}
