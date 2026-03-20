import { NextResponse } from 'next/server'

export async function GET() {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    return NextResponse.json({ error: 'Spotify credentials not configured.' }, { status: 500 })
  }

  // Exchange refresh token for access token
  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: SPOTIFY_REFRESH_TOKEN }),
    cache: 'no-store',
  })

  if (!tokenRes.ok) {
    return NextResponse.json({ error: 'Failed to authenticate with Spotify.' }, { status: 500 })
  }

  const { access_token } = await tokenRes.json()

  // Try currently playing first
  const currentlyPlayingResponse = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: { Authorization: `Bearer ${access_token}` },
    cache: 'no-store',
  })

  if (currentlyPlayingResponse.status === 200) {
    const data = await currentlyPlayingResponse.json()
    if (data?.item) {
      return NextResponse.json({
        track: data.item.name,
        artist: data.item.artists.map((a: { name: string }) => a.name).join(', '),
        nowPlaying: !data.is_playing ? false : true,
      })
    }
  }

  // Fall back to recently played
  const recentlyPlayedResponse = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
    headers: { Authorization: `Bearer ${access_token}` },
    cache: 'no-store',
  })

  if (!recentlyPlayedResponse.ok) {
    return NextResponse.json({ error: 'Could not fetch Spotify data.' }, { status: 503 })
  }

  const recentlyPlayed = await recentlyPlayedResponse.json()
  const item = recentlyPlayed.items?.[0]?.track
  if (!item) {
    return NextResponse.json({ error: 'No recent tracks found.' }, { status: 404 })
  }

  return NextResponse.json({
    track: item.name,
    artist: item.artists.map((a: { name: string }) => a.name).join(', '),
    nowPlaying: false,
  })
}
