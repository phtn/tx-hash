import { NextResponse, type NextRequest } from 'next/server'

interface BitcoinAddressStats {
  funded_txo_sum: number
  spent_txo_sum: number
}

interface MempoolAddressResponse {
  chain_stats: BitcoinAddressStats
  mempool_stats: BitcoinAddressStats
}

interface BitcoinBalanceApiResponse {
  symbol: 'BTC'
  balanceSats: string
  balanceBtc: string
}

interface BitcoinAddressRouteContext {
  params: Promise<{
    address: string
  }>
}

const BITCOIN_ADDRESS_PATTERN = /^(bc1[ac-hj-np-z02-9]{11,71}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/i
const MEMPOOL_ADDRESS_URL = 'https://mempool.space/api/address'
const SATS_PER_BTC = BigInt(100_000_000)

function formatSatsAsBtc(sats: bigint) {
  const sign = sats < BigInt(0) ? '-' : ''
  const absoluteSats = sats < BigInt(0) ? -sats : sats
  const whole = absoluteSats / SATS_PER_BTC
  const fraction = (absoluteSats % SATS_PER_BTC).toString().padStart(8, '0').replace(/0+$/, '')

  return `${sign}${whole.toString()}${fraction ? `.${fraction}` : ''}`
}

function getBalanceSats(stats: MempoolAddressResponse) {
  const confirmed = BigInt(stats.chain_stats.funded_txo_sum - stats.chain_stats.spent_txo_sum)
  const pending = BigInt(stats.mempool_stats.funded_txo_sum - stats.mempool_stats.spent_txo_sum)

  return confirmed + pending
}

export async function GET(
  _request: NextRequest,
  { params }: BitcoinAddressRouteContext
): Promise<NextResponse<BitcoinBalanceApiResponse | { error: string }>> {
  const { address } = await params
  const normalizedAddress = address.trim()

  if (!BITCOIN_ADDRESS_PATTERN.test(normalizedAddress)) {
    return NextResponse.json({ error: 'Invalid Bitcoin address' }, { status: 400 })
  }

  try {
    const response = await fetch(`${MEMPOOL_ADDRESS_URL}/${encodeURIComponent(normalizedAddress)}`, {
      headers: {
        Accept: 'application/json',
      },
      next: {
        revalidate: 15,
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: `Bitcoin balance lookup returned ${response.status}` }, { status: response.status })
    }

    const stats = (await response.json()) as MempoolAddressResponse
    const balanceSats = getBalanceSats(stats)

    return NextResponse.json({
      symbol: 'BTC',
      balanceSats: balanceSats.toString(),
      balanceBtc: formatSatsAsBtc(balanceSats),
    })
  } catch (error) {
    console.error('Error fetching Bitcoin balance:', error)

    return NextResponse.json({ error: 'Failed to fetch Bitcoin balance' }, { status: 500 })
  }
}
