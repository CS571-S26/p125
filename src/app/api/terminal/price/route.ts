import { NextRequest, NextResponse } from 'next/server'

// Well-known tickers → CoinGecko IDs (avoids a search round-trip for common coins)
const KNOWN: Record<string, string> = {
  btc: 'bitcoin',
  eth: 'ethereum',
  sol: 'solana',
  doge: 'dogecoin',
  ada: 'cardano',
  xrp: 'ripple',
  bnb: 'binancecoin',
  usdt: 'tether',
  usdc: 'usd-coin',
  avax: 'avalanche-2',
  dot: 'polkadot',
  link: 'chainlink',
  matic: 'matic-network',
  ltc: 'litecoin',
  shib: 'shiba-inu',
  uni: 'uniswap',
  atom: 'cosmos',
  near: 'near',
  apt: 'aptos',
  sui: 'sui',
}

async function resolveId(ticker: string): Promise<string | null> {
  if (KNOWN[ticker]) return KNOWN[ticker]

  // Fall back to CoinGecko search — pick the symbol-exact match with the best market cap rank
  const res = await fetch(
    `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(ticker)}`,
    { cache: 'no-store' },
  )
  if (!res.ok) return null

  const data = await res.json()
  const match = (data.coins as { id: string; symbol: string; market_cap_rank: number | null }[])
    .filter(c => c.symbol.toLowerCase() === ticker)
    .sort((a, b) => (a.market_cap_rank ?? Infinity) - (b.market_cap_rank ?? Infinity))[0]

  return match?.id ?? null
}

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker')?.toLowerCase()

  if (!ticker) {
    return NextResponse.json({ error: 'Missing ticker parameter.' }, { status: 400 })
  }

  const id = await resolveId(ticker)
  if (!id) {
    return NextResponse.json(
      { error: `Unknown ticker: ${ticker.toUpperCase()}` },
      { status: 400 },
    )
  }

  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`,
    { cache: 'no-store' },
  )

  if (!res.ok) {
    if (res.status === 429) {
      return NextResponse.json({ error: 'Welp, you hit the rate limit. Try again in a minute.' }, { status: 429 })
    }
    else {
      console.error("[PRICE] Failed to fetch price data.", res.status, res.statusText, await res.text())
    }
    return NextResponse.json({ error: 'Failed to fetch price data.' }, { status: 500 })
  }

  const data = await res.json()
  const coin = data[id]

  if (!coin) {
    return NextResponse.json({ error: `No price data for ${ticker.toUpperCase()}` }, { status: 404 })
  }

  return NextResponse.json({
    ticker: ticker.toUpperCase(),
    price: coin.usd,
    change24h: coin.usd_24h_change,
  })
}
