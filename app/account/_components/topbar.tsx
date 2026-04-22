'use client'

import { ScrambleText } from '@/components/scramble-text'
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
    <div className='flex shrink-0 items-center gap-2 py-1 pl-1 pr-3'>
      <TokenCoaster size='sm' token={asset.token} />
      <div className='min-w-0'>
        <div className='flex items-baseline gap-1.5'>
          <span className='font-poly text-sm font-semibold leading-none text-[#18120f] dark:text-white'>
            {showBalance ? tokenAmountFormatter.format(asset.balance) : '------'}
          </span>
          <span className='font-poly text-sm tracking-wide uppercase text-foreground/70'>{asset.symbol}</span>
        </div>
        <div className='mt-0 font-okx text-sm text-foreground/80 uppercase tracking-wide leading-3.5'>
          {showBalance && asset.usdValue !== null ? (
            <span>{usdFormatter.format(asset.usdValue)}</span>
          ) : (
            <ScrambleText text='---------' />
          )}
        </div>
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
    address: bitcoinAddress,
    balanceBtc,
    isLoading: isLoadingBitcoin
  } = useBitcoinBalance(caipNetwork?.chainNamespace === 'bip122')
  const { getBySymbol } = useCrypto()

  const nativeSymbol = getNativeSymbolForChainId(chainId)
  const nativePriceSymbol = getPriceSymbolForChainId(chainId)
  const nativePrice = getBySymbol(nativePriceSymbol)?.price ?? null
  const bitcoinPrice = getBySymbol('BTC')?.price ?? null
  const isBitcoinNetwork = caipNetwork?.chainNamespace === 'bip122'
  const isLoading = isBitcoinNetwork ? isLoadingBitcoin : isLoadingTokens

  const bitcoinAsset = useMemo<TopbarAsset | null>(() => {
    if (!isBitcoinNetwork || !bitcoinAddress || (isLoadingBitcoin && balanceBtc === '0')) {
      return null
    }

    const balance = Number.parseFloat(balanceBtc)

    return {
      balance,
      id: 'bitcoin-BTC',
      price: bitcoinPrice,
      symbol: 'BTC',
      token: 'bitcoin',
      usdValue: bitcoinPrice === null ? null : balance * bitcoinPrice
    }
  }, [balanceBtc, bitcoinAddress, bitcoinPrice, isBitcoinNetwork, isLoadingBitcoin])

  const assets = useMemo<TopbarAsset[]>(() => {
    if (isBitcoinNetwork) {
      return bitcoinAsset ? [bitcoinAsset] : []
    }

    return tokens.map((tokenBalance) => getAssetFromTokenBalance(tokenBalance, nativeSymbol, nativePrice, bitcoinPrice))
  }, [bitcoinAsset, bitcoinPrice, isBitcoinNetwork, nativePrice, nativeSymbol, tokens])

  return (
    <header className='h-14 relative z-10 flex items-center justify-between gap-4 border-b border-black/8 bg-white/65 px-4 py-0 backdrop-blur-xl dark:border-background dark:bg-white/3 sm:ps-3 sm:pe-2'>
      <div className='flex min-w-0 flex-1 items-center gap-2'>
        <button
          type='button'
          onClick={toggle}
          aria-label={showBalances ? 'Hide asset balances' : 'Show asset balances'}
          className='grid size-7 shrink-0 place-items-center rounded-full bg-white/70 outline-accent dark:border-white/10 dark:bg-white/4'>
          <Icon name={showBalances ? 'visibile' : 'hide'} className='size-5' />
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
