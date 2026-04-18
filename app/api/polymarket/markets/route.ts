import { getPolymarketSamplingMarkets } from '@/lib/polymarket'
import type { PolymarketMarket, PolymarketMarketsApiResponse, PolymarketOutcome } from '@/lib/polymarket/types'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const DEFAULT_LIMIT = 24
const MAX_LIMIT = 50
const INITIAL_CURSOR = 'MA=='

type RawMarket = Record<string, unknown>

function getLimit(value: string | null) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return DEFAULT_LIMIT
  return Math.min(Math.max(Math.trunc(parsed), 1), MAX_LIMIT)
}

function asString(value: unknown) {
  return typeof value === 'string' ? value : null
}

function asNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function asBoolean(value: unknown) {
  return typeof value === 'boolean' ? value : false
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === 'string')
}

function mapOutcome(value: unknown): PolymarketOutcome | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const raw = value as RawMarket
  const tokenId = asString(raw.token_id)
  const outcome = asString(raw.outcome)
  const price = asNumber(raw.price)

  if (!tokenId || !outcome || price === null) {
    return null
  }

  return {
    tokenId,
    outcome,
    price,
    winner: asBoolean(raw.winner),
  }
}

function mapMarket(value: unknown): PolymarketMarket | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const raw = value as RawMarket
  const conditionId = asString(raw.condition_id)
  const question = asString(raw.question)
  const slug = asString(raw.market_slug)

  if (!conditionId || !question || !slug) {
    return null
  }

  const outcomes = Array.isArray(raw.tokens) ? raw.tokens.map(mapOutcome).filter((outcome) => outcome !== null) : []

  return {
    conditionId,
    question,
    description: asString(raw.description) ?? '',
    slug,
    image: asString(raw.image),
    icon: asString(raw.icon),
    endDateIso: asString(raw.end_date_iso),
    active: asBoolean(raw.active),
    closed: asBoolean(raw.closed),
    acceptingOrders: asBoolean(raw.accepting_orders),
    minimumOrderSize: asNumber(raw.minimum_order_size),
    minimumTickSize: asNumber(raw.minimum_tick_size),
    negRisk: asBoolean(raw.neg_risk),
    tags: asStringArray(raw.tags),
    outcomes,
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<PolymarketMarketsApiResponse>> {
  const { searchParams } = request.nextUrl
  const limit = getLimit(searchParams.get('limit'))
  const cursor = searchParams.get('cursor') ?? INITIAL_CURSOR

  try {
    const payload = await getPolymarketSamplingMarkets(cursor)
    const markets = payload.data
      .map(mapMarket)
      .filter((market) => market !== null)
      .filter((market) => market.active && !market.closed && market.acceptingOrders)
      .slice(0, limit)

    return NextResponse.json({
      success: true,
      data: markets,
      nextCursor: payload.next_cursor,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching Polymarket markets:', error)

    return NextResponse.json(
      {
        success: false,
        data: [],
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Failed to fetch Polymarket markets',
      },
      { status: 500 }
    )
  }
}
