'use client'

import { useCrypto } from '@/hooks/use-crypto'
import { cn } from '@/lib/utils'

const compactUsdFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 2,
  notation: 'compact',
  style: 'currency'
})

const priceFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  style: 'currency'
})

const percentFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  signDisplay: 'always',
  style: 'percent'
})

const updatedAtFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit'
})

function formatPercent(value: number) {
  return percentFormatter.format(value / 100)
}

function formatUpdatedAt(value: string | null) {
  if (!value) return 'Not loaded'

  return updatedAtFormatter.format(new Date(value))
}

export function TopMarketQuotes() {
  const { data, error, isPending, lastUpdated, refetch } = useCrypto({
    includeNetworkTokens: false,
    limit: 10
  })

  const isEmpty = data.length === 0

  return (
    <div className='flex h-full flex-col'>
      <div className='flex items-center justify-between border-b border-black/8 py-2 dark:border-background'>
        <p className='font-mono text-[10px] uppercase tracking-[0.28em] text-[#7f7368] dark:text-white/38'>
          Updated {formatUpdatedAt(lastUpdated)}
        </p>
        <button
          type='button'
          onClick={refetch}
          disabled={isPending}
          className='h-9 shrink-0 border border-black/10 bg-white/70 px-3 font-mono text-[10px] uppercase tracking-[0.24em] text-[#18120f] outline-accent transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/4 dark:text-white dark:hover:bg-white/8'>
          {isPending ? 'Refreshing' : 'Refresh'}
        </button>
      </div>

      {error ? (
        <div className='m-4 border border-red-500/20 bg-red-500/10 p-4 text-sm leading-6 text-red-700 dark:text-red-200'>
          {error}
        </div>
      ) : null}

      {isEmpty && !error ? (
        <div className='grid gap-2 p-4'>
          {Array.from({ length: 10 }, (_, index) => (
            <div
              key={index}
              className='h-16 animate-pulse border border-black/8 bg-white/50 dark:border-white/10 dark:bg-white/4'
            />
          ))}
        </div>
      ) : (
        <div className='flex-1 overflow-y-auto'>
          {data.map((quote) => {
            const changeIsPositive = quote.percentChange24h >= 0

            return (
              <article
                key={quote.id}
                className='grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-black/8 px-0 py-3 last:border-b-0 dark:border-background'>
                <div className='grid size-9 place-items-center border border-black/10 bg-white/70 font-mono text-[10px] text-[#7f7368] dark:border-white/10 dark:bg-white/4 dark:text-white/48'>
                  {quote.rank}
                </div>
                <div className='min-w-0'>
                  <div className='flex items-center gap-2'>
                    <p className='truncate text-sm font-semibold text-[#18120f] dark:text-white'>{quote.name}</p>
                    <span className='font-mono text-[10px] uppercase text-[#7f7368] dark:text-white/38'>
                      {quote.symbol}
                    </span>
                  </div>
                  <p className='mt-1 font-okx text-[10px] uppercase text-[#7f7368] dark:text-white/38'>
                    {compactUsdFormatter.format(quote.marketCap)}
                  </p>
                </div>
                <div className='text-right'>
                  <p className='font-okx font-semibold text-sm text-[#18120f] dark:text-white'>
                    {priceFormatter.format(quote.price)}
                  </p>
                  <p
                    className={cn(
                      'mt-1 font-cm text-[10px] uppercase',
                      changeIsPositive ? 'text-emerald-600 dark:text-emerald-300' : 'text-red-600 dark:text-red-300'
                    )}>
                    {formatPercent(quote.percentChange24h)}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
