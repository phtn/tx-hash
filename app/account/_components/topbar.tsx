'use client'

import { useBitcoinBalance } from '@/hooks/use-bitcoin-balance'
import { useCrypto } from '@/hooks/use-crypto'
import { useNetworkTokens, type TokenBalance } from '@/hooks/use-network-tokens'
import { useToggle } from '@/hooks/use-toggle'
import { getNativeSymbolForChainId, getPriceSymbolForChainId } from '@/lib/appkit/pay-config'
import { tickerSymbol } from '@/lib/appkit/ticker'
import { TokenCoaster, type Token } from '@/lib/appkit/token-coaster'
import { Wallet } from '@/lib/appkit/wallet'
import { Icon } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { useAppKitNetwork } from '@reown/appkit/react'
import { memo, useMemo } from 'react'
import { useChainId } from 'wagmi'
import { ConnectedWalletAddressOffer } from './connected-wallet-address-offer'

const tokenAmountFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 6,
  minimumFractionDigits: 0
})

const usdFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 2,
  notation: 'compact',
  style: 'currency'
})

interface TopbarAsset {
  balance: number
  id: string
  price: number | null
  symbol: string
  token: Token
  usdValue: number | null
}

function getTokenPrice(token: Token, nativePrice: number | null, bitcoinPrice: number | null) {
  if (token === 'usdc' || token === 'usdt') return 1
  if (token === 'bitcoin') return bitcoinPrice
  return nativePrice
}

function getDisplayToken(token: Token, nativeSymbol: string): Token {
  if (token === 'ethereum' && nativeSymbol === 'matic') return 'pol'
  return token
}

function getAssetFromTokenBalance(
  tokenBalance: TokenBalance,
  nativeSymbol: string,
  nativePrice: number | null,
  bitcoinPrice: number | null
): TopbarAsset {
  const sourceToken = tokenBalance.token
  const token = getDisplayToken(sourceToken, nativeSymbol)
  const balance = Number.parseFloat(tokenBalance.formatted)
  const symbol = sourceToken === 'ethereum' ? tickerSymbol(nativeSymbol) : tickerSymbol(token)
  const price = getTokenPrice(sourceToken, nativePrice, bitcoinPrice)

  return {
    balance,
    id: `${token}-${symbol}`,
    price,
    symbol,
    token,
    usdValue: price === null ? null : balance * price
  }
}

function AssetPill({ asset, showBalance }: { asset: TopbarAsset; showBalance: boolean }) {
  return (
    <div className='flex shrink-0 items-center gap-2 rounded-[8px] bg-white/70 py-1 pl-1 pr-3 dark:border-white/10 dark:bg-white/4'>
      <TokenCoaster size='sm' token={asset.token} />
      <div className='min-w-0'>
        <div className='flex items-baseline gap-1.5'>
          <span className='font-okx text-sm font-semibold leading-none text-[#18120f] dark:text-white'>
            {showBalance ? tokenAmountFormatter.format(asset.balance) : '****'}
          </span>
          <span className='font-mono text-base tracking-wide uppercase text-[#7f7368] dark:text-white/42'>
            {asset.symbol}
          </span>
        </div>
        <p className='mt-0.5 font-mono text-xs text-[#7f7368] dark:text-white/60 uppercase tracking-wide'>
          {showBalance && asset.usdValue !== null ? usdFormatter.format(asset.usdValue) : 'Private'}
        </p>
      </div>
    </div>
  )
}

export const Topbar = memo(function Topbar() {
  const [showBalances, { toggle }] = useToggle(true)
  const chainId = useChainId()
  const { caipNetwork } = useAppKitNetwork()
  const { tokens, isLoading: isLoadingTokens } = useNetworkTokens()
  const {
    balanceBtc,
    balanceSats,
    isLoading: isLoadingBitcoin
  } = useBitcoinBalance(caipNetwork?.chainNamespace === 'bip122')
  const { getBySymbol } = useCrypto()

  const nativeSymbol = getNativeSymbolForChainId(chainId)
  const nativePriceSymbol = getPriceSymbolForChainId(chainId)
  const nativePrice = getBySymbol(nativePriceSymbol)?.price ?? null
  const bitcoinPrice = getBySymbol('BTC')?.price ?? null
  const isBitcoinNetwork = caipNetwork?.chainNamespace === 'bip122'
  const isLoading = isBitcoinNetwork ? isLoadingBitcoin : isLoadingTokens

  const assets = useMemo<TopbarAsset[]>(() => {
    if (isBitcoinNetwork) {
      if (balanceSats <= BigInt(0)) return []

      const balance = Number.parseFloat(balanceBtc)
      return [
        {
          balance,
          id: 'bitcoin-BTC',
          price: bitcoinPrice,
          symbol: 'BTC',
          token: 'bitcoin',
          usdValue: bitcoinPrice === null ? null : balance * bitcoinPrice
        }
      ]
    }

    return tokens.map((tokenBalance) => getAssetFromTokenBalance(tokenBalance, nativeSymbol, nativePrice, bitcoinPrice))
  }, [balanceBtc, balanceSats, bitcoinPrice, isBitcoinNetwork, nativePrice, nativeSymbol, tokens])

  return (
    <header className='relative z-10 flex items-center justify-between gap-4 border-b border-black/8 bg-white/65 px-4 py-3 backdrop-blur-xl dark:border-background dark:bg-white/3 sm:px-6'>
      <div className='flex min-w-0 flex-1 items-center gap-3'>
        <button
          type='button'
          onClick={toggle}
          aria-label={showBalances ? 'Hide asset balances' : 'Show asset balances'}
          className='grid size-10 shrink-0 place-items-center rounded-full border border-black/8 bg-white/70 outline-accent dark:border-white/10 dark:bg-white/4'>
          <Icon name={showBalances ? 'eyeglasses' : 'sunglasses'} className='size-7' />
        </button>

        <div className='flex min-w-0 flex-1 items-center gap-2 overflow-x-auto'>
          {assets.map((asset) => (
            <AssetPill key={asset.id} asset={asset} showBalance={showBalances} />
          ))}

          <ConnectedWalletAddressOffer variant='topbar' />

          {assets.length === 0 ? (
            <div
              className={cn(
                'flex h-10 shrink-0 items-center rounded-full border border-black/8 bg-white/70 px-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[#7f7368] dark:border-white/10 dark:bg-white/4 dark:text-white/42',
                isLoading && 'animate-pulse'
              )}>
              {isLoading ? 'Loading assets' : 'No funded assets'}
            </div>
          ) : null}
        </div>
      </div>
      <div className='flex shrink-0 items-center'>
        <Wallet />
      </div>
    </header>
  )
})
