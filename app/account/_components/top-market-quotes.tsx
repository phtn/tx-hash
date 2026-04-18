'use client'

import { useCrypto } from '@/hooks/use-crypto'
import type { CryptoQuote } from '@/lib/cmc/types'
import { Icon, type IconName } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { parseAsString, useQueryState } from 'nuqs'
import { EmbeddedDetail } from './embedded-detail'

const compactUsdFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 2,
  notation: 'compact',
  style: 'currency'
})

const usdFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
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

const supplyFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0
})

const quoteIconBySymbol: Partial<Record<string, IconName>> = {
  BNB: 'bnb',
  BTC: 'btc',
  DOGE: 'doge',
  ETH: 'eth',
  SOL: 'sol',
  TRX: 'trx',
  USDC: 'usdc',
  USDT: 'usdt',
  XRP: 'xrp'
}

function formatPercent(value: number) {
  return percentFormatter.format(value / 100)
}

function formatUpdatedAt(value: string | null) {
  if (!value) return 'Not loaded'

  return updatedAtFormatter.format(new Date(value))
}

function getQuoteIconName(symbol: string): IconName {
  return quoteIconBySymbol[symbol.toUpperCase()] ?? 'dashboard'
}

interface AssetStatProps {
  label: string
  value: string
  tone?: 'negative' | 'positive'
}

function AssetStat({ label, value, tone }: AssetStatProps) {
  return (
    <div className='px-6 py-4'>
      <p className='font-mono text-[10px] uppercase tracking-[0.26em] text-[#7f7368] dark:text-white/38'>{label}</p>
      <p
        className={cn(
          'mt-2 font-okx text-xl text-[#18120f] dark:text-white',
          tone === 'positive' && 'text-emerald-600 dark:text-emerald-300',
          tone === 'negative' && 'text-red-600 dark:text-red-300'
        )}>
        {value}
      </p>
    </div>
  )
}

function CryptoAssetDetail({ quote }: { quote: CryptoQuote }) {
  const change24hIsPositive = quote.percentChange24h >= 0
  const change7dIsPositive = quote.percentChange7d >= 0

  return (
    <EmbeddedDetail eyebrow={`${quote.rank} / ${quote.symbol}`} title={quote.name} description='' bodyClassName='p-0'>
      <div className='grid md:grid-cols-[minmax(0,1fr)_18rem]'>
        <div className='flex min-w-0 items-center gap-4 p-6'>
          <div className='grid size-16 shrink-0 place-items-center rounded-full bg-white dark:bg-white/4'>
            <Icon name={getQuoteIconName(quote.symbol)} className='size-14' />
          </div>
          <div className='min-w-0'>
            <p className='truncate font-okx text-3xl leading-none text-[#18120f] dark:text-white'>
              {priceFormatter.format(quote.price)}
            </p>
            <p className='mt-1 font-mono text-[10px] uppercase tracking-[0.24em] text-[#7f7368] dark:text-white/38'>
              {quote.symbol} / USD
            </p>
          </div>
        </div>
        <div className='grid grid-cols-2'>
          <AssetStat
            label='1h'
            tone={quote.percentChange1h >= 0 ? 'positive' : 'negative'}
            value={formatPercent(quote.percentChange1h)}
          />
          <AssetStat
            label='24h'
            tone={change24hIsPositive ? 'positive' : 'negative'}
            value={formatPercent(quote.percentChange24h)}
          />
        </div>
      </div>

      <div className='grid md:grid-cols-2'>
        <AssetStat label='Market cap' value={usdFormatter.format(quote.marketCap)} />
        <AssetStat label='24h volume' value={usdFormatter.format(quote.volume24h)} />
        <AssetStat
          label='Circulating supply'
          value={`${supplyFormatter.format(quote.circulatingSupply)} ${quote.symbol}`}
        />
        <AssetStat
          label='7d change'
          tone={change7dIsPositive ? 'positive' : 'negative'}
          value={formatPercent(quote.percentChange7d)}
        />
      </div>

      <div className='p-6'>
        <p className='font-mono text-[10px] uppercase tracking-[0.28em] text-[#7f7368] dark:text-white/38'>
          Market tags
        </p>
        <div className='mt-4 flex flex-wrap gap-2'>
          {quote.tags.slice(0, 8).map((tag) => (
            <span
              key={tag}
              className='border border-black/10 bg-white/70 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#7f7368] dark:border-white/10 dark:bg-white/4 dark:text-white/48'>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </EmbeddedDetail>
  )
}

export function TopMarketQuotes() {
  const [selectedAssetId, setSelectedAssetId] = useQueryState(
    'asset',
    parseAsString.withOptions({
      history: 'push',
      shallow: true
    })
  )
  const { data, error, isPending, lastUpdated, refetch } = useCrypto({
    includeNetworkTokens: false,
    limit: 10
  })

  const isEmpty = data.length === 0
  const selectedQuote = data.find((quote) => String(quote.id) === selectedAssetId) ?? null

  return (
    <div className='flex h-full min-w-0 flex-1 flex-col xl:flex-row'>
      <section className='flex min-h-112 w-full flex-col border-r border-black/8 xl:h-full xl:w-105 xl:min-w-105'>
        <div className='flex items-center justify-between gap-4 border-black/8 dark:border-background'>
          <div className='w-full flex items-center justify-between border-b border-black/8 px-6 h-10 dark:border-background bg-accent/90 dark:bg-accent/60'>
            <p className='font-poly text-[10px] uppercase tracking-[0.28em] dark:text-white'>Top 10</p>
            <Icon
              onClick={refetch}
              name={isPending ? 'spinner-ring' : 'rotate'}
              className={cn('size-4 text-white dark:text-white')}
            />
          </div>
        </div>

        {error ? (
          <div className='m-4 border border-red-500/20 bg-red-500/10 p-4 text-sm leading-6 text-red-700 dark:text-red-200'>
            {error}
          </div>
        ) : null}

        {isEmpty && !error ? (
          <div className='grid gap-2 p-4'>
            {Array.from({ length: 10 }, (_, index) => (
              <div key={index} className='h-16 animate-pulse bg-white/50 dark:border-white/10 dark:bg-white/4' />
            ))}
          </div>
        ) : (
          <div className='flex-1 overflow-y-auto'>
            {data.map((quote) => {
              const changeIsPositive = quote.percentChange24h >= 0
              const isSelected = String(quote.id) === selectedAssetId

              return (
                <button
                  key={quote.id}
                  type='button'
                  onClick={() => {
                    void setSelectedAssetId(String(quote.id))
                  }}
                  className={cn(
                    'grid w-full h-18! grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-1 px-5 text-left outline-accent transition-colors border-b first:border-t-0 first:border-b-0 last:border-t-0 dark:border-background',
                    isSelected
                      ? 'bg-foreground/8 dark:bg-white/8'
                      : 'bg-white/40 hover:bg-card dark:bg-white/3 dark:hover:bg-white/6'
                  )}>
                  <div className='grid size-9 place-items-center'>
                    <Icon name={getQuoteIconName(quote.symbol)} className='size-9' />
                  </div>
                  <div className='min-w-0'>
                    <div className='flex items-center gap-1.5'>
                      <p className='truncate text-base font-poly font-semibold text-[#18120f] dark:text-white'>
                        {quote.name}
                      </p>
                      <span className='font-okx text-[10px] uppercase text-[#7f7368] dark:text-white/38'>
                        {quote.symbol}
                      </span>
                    </div>
                    <p className='mt-1 font-okx text-[10px] uppercase text-[#7f7368] dark:text-white/38'>
                      {compactUsdFormatter.format(quote.marketCap)}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='font-okx text-sm font-semibold text-[#18120f] dark:text-white'>
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
                </button>
              )
            })}
          </div>
        )}
      </section>

      {selectedQuote ? (
        <CryptoAssetDetail quote={selectedQuote} />
      ) : (
        <EmbeddedDetail
          eyebrow='Asset detail'
          title='Select a quote'
          description='Choose a crypto asset from the ranked list to inspect its live quote, market cap, volume, and recent movement.'
          bodyClassName='flex items-center justify-center p-6'>
          <div className='max-w-sm text-center'>
            <p className='font-mono text-[10px] uppercase tracking-[0.28em] text-[#7f7368] dark:text-white/38'>
              Waiting for selection
            </p>
            <p className='mt-3 text-sm leading-6 text-[#675d53] dark:text-white/58'>
              Asset detail is intentionally rendered as the terminal embedded pane so the quote list remains visible.
            </p>
          </div>
        </EmbeddedDetail>
      )}
    </div>
  )
}
