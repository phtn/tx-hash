import type { PolymarketMarket, PolymarketMarketsApiResponse } from '@/lib/polymarket/types'
import { useCallback, useEffect, useState, useTransition } from 'react'

interface UsePolymarketMarketsOptions {
  autoFetch?: boolean
  limit?: number
  pollInterval?: number
}

interface UsePolymarketMarketsReturn {
  data: PolymarketMarket[]
  error: string | null
  isPending: boolean
  lastUpdated: string | null
  refetch: () => void
}

export function usePolymarketMarkets(options: UsePolymarketMarketsOptions = {}): UsePolymarketMarketsReturn {
  const { autoFetch = true, limit = 24, pollInterval = 0 } = options
  const [data, setData] = useState<PolymarketMarket[]>([])
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const fetchMarkets = useCallback(() => {
    startTransition(async () => {
      try {
        const params = new URLSearchParams({
          limit: String(limit),
        })
        const response = await fetch(`/api/polymarket/markets?${params}`)
        const result: PolymarketMarketsApiResponse = await response.json()

        if (result.success) {
          setData(result.data)
          setLastUpdated(result.timestamp)
          setError(null)
        } else {
          setError(result.error ?? 'Failed to fetch Polymarket markets')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      }
    })
  }, [limit])

  useEffect(() => {
    if (autoFetch) {
      fetchMarkets()
    }
  }, [autoFetch, fetchMarkets])

  useEffect(() => {
    if (pollInterval <= 0) return

    const intervalId = setInterval(fetchMarkets, pollInterval)
    return () => clearInterval(intervalId)
  }, [pollInterval, fetchMarkets])

  return {
    data,
    error,
    isPending,
    lastUpdated,
    refetch: fetchMarkets,
  }
}
