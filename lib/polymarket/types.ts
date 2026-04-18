export interface PolymarketOutcome {
  tokenId: string
  outcome: string
  price: number
  winner: boolean
}

export interface PolymarketMarket {
  conditionId: string
  question: string
  description: string
  slug: string
  image: string | null
  icon: string | null
  endDateIso: string | null
  active: boolean
  closed: boolean
  acceptingOrders: boolean
  minimumOrderSize: number | null
  minimumTickSize: number | null
  negRisk: boolean
  tags: string[]
  outcomes: PolymarketOutcome[]
}

export interface PolymarketMarketsApiResponse {
  success: boolean
  data: PolymarketMarket[]
  timestamp: string
  nextCursor?: string
  error?: string
}
