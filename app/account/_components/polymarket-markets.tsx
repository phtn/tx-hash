'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { usePolymarketMarkets } from '@/hooks/use-polymarket'
import { Icon } from '@/lib/icons'
import type { PolymarketMarket, PolymarketOutcome } from '@/lib/polymarket/types'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { parseAsString, useQueryState } from 'nuqs'
import { useMemo, useState } from 'react'
import { EmbeddedDetail } from './embedded-detail'

const probabilityFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
  style: 'percent'
})

const updatedAtFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit'
})

const endDateFormatter = new Intl.DateTimeFormat('en-US')

const usdcFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 2,
  style: 'currency'
})

function clampProbability(value: number) {
  return Math.max(0, Math.min(1, value))
}

function formatProbability(value: number) {
  return probabilityFormatter.format(clampProbability(value))
}

function formatEndDate(value: string | null) {
  if (!value) {
    return 'Open'
  }

  return endDateFormatter.format(new Date(value))
}

function formatUpdatedAt(value: string | null) {
  if (!value) {
    return 'Not loaded'
  }

  return updatedAtFormatter.format(new Date(value))
}

function formatTokenId(value: string) {
  return `${value.slice(0, 6)}...${value.slice(-6)}`
}

function getLeadingOutcome(outcomes: PolymarketOutcome[]) {
  let leadingOutcome = outcomes[0] ?? null

  for (const outcome of outcomes) {
    if (!leadingOutcome || outcome.price > leadingOutcome.price) {
      leadingOutcome = outcome
    }
  }

  return leadingOutcome
}

function getMarketUrl(market: PolymarketMarket) {
  return `https://polymarket.com/market/${market.slug}`
}

function MarketImage({ market, className }: { market: PolymarketMarket; className?: string }) {
  if (market.image) {
    return (
      <div className={cn('relative h-full w-auto', className)}>
        <Image
          src={market.image}
          alt={market.question}
          fill
          sizes='(max-width: 768px) 100vw, 33vw'
          className='w-auto h-full object-cover grayscale aspect-square'
        />
      </div>
    )
  }

  return (
    <div className={cn('grid h-full w-full place-items-center bg-foreground/8 dark:bg-white/6', className)}>
      <Icon name='polymarket' className='size-10 text-[#18120f] dark:text-white' />
    </div>
  )
}

function MarketStat({ label, value }: { label: string; value: string }) {
  return (
    <div className='min-h-14 flex flex-col justify-center ps-6 border-b border-white/20 dark:border-white/20 md:border-r'>
      <p className='font-okx font-thin text-[7px] uppercase tracking-[0.26em] text-background/80'>{label}</p>
      <p className='font-okx font-semibold text-background text-lg'>{value}</p>
    </div>
  )
}

function OutcomeRow({ outcome }: { outcome: PolymarketOutcome }) {
  const percentage = clampProbability(outcome.price) * 100

  return (
    <div className='px-6 py-4 last:border-b-0 dark:border-background'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4 min-w-0'>
          <p className='truncate font-poly text-base text-[#18120f] dark:text-white'>{outcome.outcome}</p>
          <p className='font-mono text-[10px] uppercase tracking-[0.18em] text-[#7f7368] dark:text-white/38'>
            {formatTokenId(outcome.tokenId)}
          </p>
        </div>
        <p className='shrink-0 font-okx text-xl text-[#18120f] dark:text-white'>{formatProbability(outcome.price)}</p>
      </div>
      <div className='mt-3 h-1.5 bg-black/8 dark:bg-white/8'>
        <div className='h-full bg-accent' style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

function PolymarketMarketDetail({ market }: { market: PolymarketMarket }) {
  const leadingOutcome = getLeadingOutcome(market.outcomes)
  const minimumOrderSize = market.minimumOrderSize === null ? 'N/A' : usdcFormatter.format(market.minimumOrderSize)
  const minimumTickSize = market.minimumTickSize === null ? 'N/A' : String(market.minimumTickSize)

  return (
    <EmbeddedDetail eyebrow='Polymarket' description='' bodyClassName='p-0' className='min-h-0 overflow-hidden'>
      <div className='grid'>
        <div className='relative min-h-80 w-full overflow-hidden bg-accent'>
          <MarketImage market={market} />
          <div className='absolute inset-x-0 bottom-0 bg-linear-to-t from-black/82 via-black/48 to-transparent backdrop-blur-xl p-4 text-white'>
            <p className='font-mono text-[10px] uppercase tracking-[0.26em] text-white/58'>
              {formatEndDate(market.endDateIso)}
            </p>
            <h3 className='max-w-2xl font-poly text-lg leading-7'>{market.question}</h3>
          </div>
        </div>
        <div className='bg-foreground/90'>
          <div className='min-h-14 grid grid-cols-5 content-start'>
            <MarketStat label='Leader' value={leadingOutcome ? leadingOutcome.outcome : 'N/A'} />
            <MarketStat label='Odds' value={leadingOutcome ? formatProbability(leadingOutcome.price) : 'N/A'} />
            <MarketStat label='Minimum' value={minimumOrderSize} />
            <MarketStat label='Tick' value={minimumTickSize} />
            <div className='border-b border-black/8 dark:border-background md:border-t-0'>
              <a
                href={getMarketUrl(market)}
                target='_blank'
                rel='noreferrer'
                className='w-full h-full inline-flex items-center justify-center gap-2 text-polymarket font-poly font-semibold uppercase'>
                Open
                <Icon name='arrow-right' className='size-3 -rotate-25' />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className='border-b border-black/8 dark:border-background md:grid-cols-[minmax(0,1fr)_16rem]'>
        <div className='p-6'>
          <p className='font-mono text-[10px] uppercase tracking-[0.28em] text-[#7f7368] dark:text-white/38'>
            Resolution
          </p>
          <p className='mt-3 text-sm text-[#675d53] dark:text-white/58 text-balance leading-6'>
            {market.description || market.question}
          </p>
        </div>
      </div>

      <div>
        {market.outcomes.map((outcome) => (
          <OutcomeRow key={outcome.tokenId} outcome={outcome} />
        ))}
      </div>

      {market.tags.length > 0 ? (
        <div className='border-t border-black/8 p-6 dark:border-background'>
          <p className='font-mono text-[10px] uppercase tracking-[0.28em] text-[#7f7368] dark:text-white/38'>Tags</p>
          <div className='mt-4 flex flex-wrap gap-2'>
            {market.tags.slice(0, 8).map((tag) => (
              <span
                key={tag}
                className='border border-black/10 bg-white/70 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#7f7368] dark:border-white/10 dark:bg-white/4 dark:text-white/48'>
                {tag}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </EmbeddedDetail>
  )
}

export function PolymarketMarkets() {
  const [selectedMarketId, setSelectedMarketId] = useQueryState(
    'polymarket',
    parseAsString.withOptions({
      history: 'push',
      shallow: true
    })
  )
  const [query, setQuery] = useState('')
  const { data, error, isPending, lastUpdated, refetch } = usePolymarketMarkets({ limit: 24 })

  const filteredMarkets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return data
    }

    return data.filter((market) => {
      const searchText = `${market.question} ${market.slug} ${market.tags.join(' ')}`.toLowerCase()
      return searchText.includes(normalizedQuery)
    })
  }, [data, query])

  const selectedMarket =
    data.find((market) => market.conditionId === selectedMarketId) ?? filteredMarkets[0] ?? data[0] ?? null
  const isEmpty = data.length === 0

  return (
    <div className='flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden xl:flex-row'>
      <section className='flex min-h-0 w-full flex-1 flex-col overflow-hidden border-r border-black/8 xl:h-full xl:w-116 xl:min-w-116 xl:flex-none'>
        <div className='shrink-0 border-b border-black/8 dark:border-background'>
          <div className={cn('flex items-center justify-between px-6 h-10 bg-polymarket dark:bg-polymarket')}>
            <div className='flex items-center w-full gap-3'>
              <Icon name='polymarket' className='size-3 text-white' />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder='Search Polymarket'
                className={cn(
                  'font-poly text-[8px] placeholder:text-[8px] placeholder:uppercase placeholder:tracking-[0.28em] h-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-white/50'
                )}
              />
              {/*<p className=' text-white'>Polymarket</p>*/}
            </div>
            <div className='flex items-center flex-1 space-x-4'>
              <span className='text-[9px] font-poly tracking-widest whitespace-nowrap text-white'>
                {formatUpdatedAt(lastUpdated)}
              </span>
              <Icon onClick={refetch} name={isPending ? 'spinner-ring' : 'rotate'} className='size-4 text-white' />
            </div>
          </div>
        </div>

        {error ? (
          <div className='m-4 border border-red-500/20 bg-red-500/10 p-4 text-sm leading-6 text-red-700 dark:text-red-200'>
            {error}
          </div>
        ) : null}

        {isEmpty && !error ? (
          <div className='grid min-h-0 flex-1 content-start gap-2 overflow-y-auto overscroll-contain p-4'>
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className='h-20 animate-pulse bg-white/50 dark:bg-white/4' />
            ))}
          </div>
        ) : (
          <ScrollArea className='h-[88vh] overflow-y-scroll'>
            {filteredMarkets.map((market) => {
              const leadingOutcome = getLeadingOutcome(market.outcomes)
              const isSelected = market.conditionId === selectedMarket?.conditionId

              return (
                <button
                  key={market.conditionId}
                  type='button'
                  onClick={() => {
                    void setSelectedMarketId(market.conditionId)
                  }}
                  className={cn(
                    'grid w-full grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-0 border-b border-black/8 text-left outline-accent transition-colors dark:border-background',
                    isSelected
                      ? 'bg-foreground/8 dark:bg-white/8'
                      : 'bg-white/40 hover:bg-card dark:bg-white/3 dark:hover:bg-white/6'
                  )}>
                  <div className='h-14 w-14 overflow-hidden bg-foreground/8 dark:bg-white/6'>
                    <MarketImage market={market} />
                  </div>
                  <div className='min-w-0'>
                    <div className='flex items-center justify-between h-18'>
                      <p className='line-clamp-2 font-poly text-sm leading-5 text-[#18120f] dark:text-white w-2/3'>
                        {market.question}
                      </p>
                      <p
                        className={cn('w-1/6 font-poly font-bold text-2xl text-center uppercase', {
                          'text-green-600 dark:text-green-400': leadingOutcome?.outcome.toLowerCase() === 'yes',
                          'text-red-600 dark:text-red-400': leadingOutcome?.outcome.toLowerCase() === 'no'
                        })}>
                        {leadingOutcome?.outcome.toLowerCase() === 'yes' ? 'Y' : 'N'}
                      </p>
                      {leadingOutcome ? (
                        <div className='w-1/5 h-full bg-foreground/8 text-center'>
                          <p className='shrink-0 font-poly font-semibold text-lg'>
                            {formatProbability(leadingOutcome.price)}
                          </p>
                          <p className='text-[8px]'>{formatEndDate(market.endDateIso)}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </button>
              )
            })}
          </ScrollArea>
        )}
      </section>

      {selectedMarket ? (
        <PolymarketMarketDetail market={selectedMarket} />
      ) : (
        <EmbeddedDetail
          eyebrow='Polymarket'
          title='Prediction'
          description=''
          bodyClassName='grid min-h-0 place-items-center p-6'
          className='min-h-0 overflow-hidden'>
          <div className='max-w-sm text-center'>
            <Icon name='polymarket' className='mx-auto size-10 text-[#18120f] dark:text-white' />
            <p className='mt-4 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7f7368] dark:text-white/38'>
              No markets
            </p>
          </div>
        </EmbeddedDetail>
      )}
    </div>
  )
}
