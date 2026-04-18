'use client'

import {
  type SavedCryptoWalletAddress,
  useConnectedWalletAddressOffer
} from '@/hooks/use-connected-wallet-address-offer'
import { Icon } from '@/lib/icons'
import { cn } from '@/lib/utils'

interface ConnectedWalletAddressOfferProps {
  className?: string
  savedWallets?: SavedCryptoWalletAddress[]
  variant?: 'panel' | 'topbar'
}

export function ConnectedWalletAddressOffer({
  className,
  savedWallets,
  variant = 'panel'
}: ConnectedWalletAddressOfferProps) {
  const {
    actionLabel,
    connectedWallet,
    connectedWalletLabel,
    error,
    isChecking,
    isSaved,
    isSaving,
    saveConnectedWallet
  } = useConnectedWalletAddressOffer({ savedWallets })

  if (!connectedWallet && variant === 'topbar') {
    return null
  }

  if (variant === 'topbar') {
    return (
      <button
        type='button'
        onClick={() => void saveConnectedWallet()}
        disabled={isSaved || isSaving || isChecking}
        aria-label={isSaved ? 'Connected wallet is already saved' : 'Add connected wallet to saved addresses'}
        className={cn(
          'flex h-10 shrink-0 items-center gap-2 rounded-[8px] border border-accent/35 bg-accent/12 px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#18120f] outline-accent transition-colors hover:bg-accent/18 disabled:cursor-default disabled:opacity-70 dark:border-accent/40 dark:bg-accent/18 dark:text-white dark:hover:bg-accent/24',
          { hidden: variant === 'topbar' && isSaved },
          isSaved && 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
          className
        )}>
        <Icon name={isSaved ? 'box-checked' : 'plus'} className='size-4' />
        <span>{actionLabel}</span>
      </button>
    )
  }

  return (
    <section
      className={cn('border-b border-black/8 bg-white/75 p-5 dark:border-background dark:bg-white/4', className)}>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div className='min-w-0'>
          <div className='flex items-center gap-2'>
            <span
              className={cn(
                'grid size-8 place-items-center rounded-full bg-accent-soft text-accent',
                isSaved && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
              )}>
              <Icon name={'pol'} className='size-6' />
            </span>
            <p className='mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#7f7368] dark:text-white/38'>
              {connectedWallet?.networkName} / {connectedWallet?.chainNamespace}
            </p>
          </div>

          {connectedWallet ? (
            <p className='mt-3 font-mono text-xl text-[#18120f] dark:text-white tracking-widest'>
              {connectedWalletLabel}
            </p>
          ) : (
            <p className='mt-3 text-sm leading-6 text-[#675d53] dark:text-white/58'>
              Connect a wallet and it will appear here as a one-click save option.
            </p>
          )}
          {error ? <p className='mt-3 text-xs leading-5 text-red-700 dark:text-red-300'>{error}</p> : null}
        </div>

        {connectedWallet ? (
          <button
            type='button'
            onClick={() => void saveConnectedWallet()}
            disabled={isSaved || isSaving || isChecking}
            className={cn(
              'flex items-center space-x-3 h-10 shrink-0 border border-accent/35 bg-accent/12 px-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[#18120f] outline-accent transition-colors hover:bg-accent/18 disabled:cursor-default disabled:opacity-65 dark:border-accent/40 dark:bg-accent/18 dark:text-white dark:hover:bg-accent/24',
              isSaved && 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
            )}>
            <Icon name='plus' className='size-4' />
            <span>{actionLabel}</span>
          </button>
        ) : null}
      </div>
    </section>
  )
}
