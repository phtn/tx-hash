'use client'

import { AuthLoading, Authenticated, Unauthenticated, useMutation, useQuery } from 'convex/react'
import { useState } from 'react'

import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import type { SavedCryptoWalletAddress } from '@/hooks/use-connected-wallet-address-offer'
import { Icon, type IconName } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { ConnectedWalletAddressOffer } from './connected-wallet-address-offer'

type SavedWalletAddress = SavedCryptoWalletAddress
type AddressType = SavedWalletAddress['addressType']
type ChainNamespace = SavedWalletAddress['chainNamespace']
type SourceType = SavedWalletAddress['source']
type WalletType = SavedWalletAddress['walletType']

interface PendingAction {
  id: Id<'user_crypto_wallets'>
  type: 'archive' | 'primary'
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const walletTypeLabels: Record<WalletType, string> = {
  custodial: 'Custodial',
  exchange: 'Exchange',
  hardware: 'Hardware',
  self_custody: 'Self custody',
  smart_contract: 'Smart contract',
  watch_only: 'Watch only',
}

const addressTypeLabels: Record<AddressType, string> = {
  contract: 'Contract',
  deposit: 'Deposit',
  multisig: 'Multisig',
  personal: 'Personal',
  unknown: 'Unknown',
  withdrawal: 'Withdrawal',
}

const sourceLabels: Record<SourceType, string> = {
  imported: 'Imported',
  manual: 'Manual',
  system: 'System',
  wallet_connect: 'Wallet connect',
}

const namespaceLabels: Record<ChainNamespace, string> = {
  bip122: 'Bitcoin',
  eip155: 'EVM',
  other: 'Other',
  solana: 'Solana',
}

function truncateAddress(address: string) {
  if (address.length <= 24) return address
  return `${address.slice(0, 10)}...${address.slice(-8)}`
}

function getNetworkIcon(wallet: SavedWalletAddress): IconName {
  const networkKey = wallet.networkKey.toLowerCase()

  if (wallet.chainNamespace === 'bip122' || networkKey.includes('bitcoin')) return 'btc'
  if (networkKey.includes('polygon') || networkKey.includes('matic') || networkKey.includes('pol')) return 'pol'
  if (networkKey.includes('solana')) return 'sol'
  if (wallet.chainNamespace === 'eip155') return 'eth'

  return 'wallet'
}

function getUpdatedAtLabel(value: number) {
  return dateFormatter.format(new Date(value))
}

function WalletAddressSkeleton() {
  return (
    <div className='grid h-full min-h-112 grid-cols-1 bg-white/55 dark:bg-card/30 xl:grid-cols-[23rem_minmax(0,1fr)]'>
      <div className='border-r border-black/8 dark:border-background'>
        <div className='border-b border-black/8 p-5 dark:border-background'>
          <div className='h-3 w-32 animate-pulse bg-black/10 dark:bg-white/10' />
          <div className='mt-4 h-9 w-56 animate-pulse bg-black/10 dark:bg-white/10' />
        </div>
        <div className='space-y-2 p-4'>
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className='h-24 animate-pulse bg-white/70 dark:bg-white/4' />
          ))}
        </div>
      </div>
      <div className='p-6'>
        <div className='h-48 animate-pulse bg-white/70 dark:bg-white/4' />
      </div>
    </div>
  )
}

function WalletAddressesSignedOut() {
  return (
    <div className='grid h-full min-h-112 place-items-center bg-white/55 p-6 dark:bg-card/30'>
      <div className='max-w-md border border-black/8 bg-white/80 p-8 text-center dark:border-white/10 dark:bg-white/4'>
        <Icon name='wallet' className='mx-auto size-10 text-accent' />
        <h3 className='mt-6 font-ct text-3xl leading-none text-[#18120f] dark:text-white'>Wallet addresses</h3>
        <p className='mt-4 text-sm leading-6 text-[#675d53] dark:text-white/58'>
          Sign in to view saved crypto wallet addresses for the current account.
        </p>
      </div>
    </div>
  )
}

function EmptyWalletAddresses({ className }: { className?: string } = {}) {
  return (
    <div className={cn('grid h-full min-h-112 place-items-center bg-white/55 p-6 dark:bg-card/30', className)}>
      <div className='max-w-xl border border-dashed border-black/12 bg-white/72 p-8 dark:border-white/12 dark:bg-white/4'>
        <p className='font-mono text-[10px] uppercase tracking-[0.3em] text-[#7f7368] dark:text-white/38'>
          No saved addresses
        </p>
        <h3 className='mt-4 font-ct text-4xl leading-none text-[#18120f] dark:text-white'>Add wallet addresses</h3>
        <p className='mt-4 text-sm leading-6 text-[#675d53] dark:text-white/58'>
          This list is wired to Convex and will populate from saved user wallets. Add addresses through
          `api.userCryptoWallets.createWallet` or wire a create form into this pane next.
        </p>
      </div>
    </div>
  )
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className='border-b border-black/8 px-5 py-4 last:border-b-0 dark:border-background'>
      <p className='font-mono text-[10px] uppercase tracking-[0.26em] text-[#7f7368] dark:text-white/38'>{label}</p>
      <p className='mt-2 break-words font-okx text-base text-[#18120f] dark:text-white'>{value}</p>
    </div>
  )
}

function WalletAddressDetail({
  copiedWalletId,
  onArchive,
  onCopy,
  onSetPrimary,
  pendingAction,
  wallet,
}: {
  copiedWalletId: Id<'user_crypto_wallets'> | null
  onArchive: (wallet: SavedWalletAddress) => void
  onCopy: (wallet: SavedWalletAddress) => void
  onSetPrimary: (wallet: SavedWalletAddress) => void
  pendingAction: PendingAction | null
  wallet: SavedWalletAddress
}) {
  const enabledAssets = wallet.assets.filter((asset) => asset.enabled)
  const isArchiving = pendingAction?.id === wallet.id && pendingAction.type === 'archive'
  const isSettingPrimary = pendingAction?.id === wallet.id && pendingAction.type === 'primary'

  return (
    <section className='flex min-w-0 flex-1 flex-col bg-card dark:bg-background/30'>
      <div className='border-b border-black/8 p-6 dark:border-background'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div className='min-w-0'>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='border border-black/10 bg-white/70 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#7f7368] dark:border-white/10 dark:bg-white/4 dark:text-white/48'>
                {wallet.networkName}
              </span>
              {wallet.isPrimary ? (
                <span className='bg-accent px-2 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-white'>
                  Primary
                </span>
              ) : null}
              {wallet.isVerified ? (
                <span className='border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300'>
                  Verified
                </span>
              ) : null}
            </div>
            <h3 className='mt-4 truncate font-ct text-4xl leading-none text-[#18120f] dark:text-white'>
              {wallet.walletName}
            </h3>
            <p className='mt-4 max-w-2xl break-all font-mono text-sm leading-6 text-[#675d53] dark:text-white/58'>
              {wallet.address}
            </p>
          </div>

          <div className='flex shrink-0 flex-wrap gap-2'>
            <button
              type='button'
              onClick={() => onCopy(wallet)}
              className='h-10 border border-black/10 bg-white/70 px-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[#18120f] outline-accent hover:bg-white dark:border-white/10 dark:bg-white/4 dark:text-white dark:hover:bg-white/8'>
              {copiedWalletId === wallet.id ? 'Copied' : 'Copy'}
            </button>
            <button
              type='button'
              onClick={() => onSetPrimary(wallet)}
              disabled={wallet.isPrimary || isSettingPrimary}
              className='h-10 border border-black/10 bg-white/70 px-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[#18120f] outline-accent hover:bg-white disabled:cursor-not-allowed disabled:opacity-45 dark:border-white/10 dark:bg-white/4 dark:text-white dark:hover:bg-white/8'>
              {isSettingPrimary ? 'Saving' : 'Set primary'}
            </button>
            <button
              type='button'
              onClick={() => onArchive(wallet)}
              disabled={isArchiving}
              className='h-10 border border-red-500/20 bg-red-500/8 px-4 font-mono text-[10px] uppercase tracking-[0.22em] text-red-700 outline-accent hover:bg-red-500/12 disabled:cursor-not-allowed disabled:opacity-45 dark:text-red-300'>
              {isArchiving ? 'Archiving' : 'Archive'}
            </button>
          </div>
        </div>
      </div>

      <div className='grid border-b border-black/8 dark:border-background md:grid-cols-3'>
        <DetailStat label='Network' value={wallet.networkName} />
        <DetailStat label='Namespace' value={namespaceLabels[wallet.chainNamespace]} />
        <DetailStat label='Wallet type' value={walletTypeLabels[wallet.walletType]} />
        <DetailStat label='Address type' value={addressTypeLabels[wallet.addressType]} />
        <DetailStat label='Source' value={sourceLabels[wallet.source]} />
        <DetailStat label='Updated' value={getUpdatedAtLabel(wallet.updatedAt)} />
      </div>

      <div className='grid flex-1 gap-6 overflow-y-auto p-6 xl:grid-cols-[minmax(0,1fr)_20rem]'>
        <div className='space-y-6'>
          <div>
            <p className='font-mono text-[10px] uppercase tracking-[0.28em] text-[#7f7368] dark:text-white/38'>
              Supported assets
            </p>
            {enabledAssets.length > 0 ? (
              <div className='mt-4 grid gap-2 sm:grid-cols-2'>
                {enabledAssets.map((asset) => (
                  <div
                    key={asset.assetKey}
                    className='border border-black/8 bg-white/70 p-4 dark:border-white/10 dark:bg-white/4'>
                    <div className='flex items-center justify-between gap-3'>
                      <div className='min-w-0'>
                        <p className='truncate text-sm font-semibold text-[#18120f] dark:text-white'>{asset.name}</p>
                        <p className='mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#7f7368] dark:text-white/38'>
                          {asset.symbol} / {asset.assetType}
                        </p>
                      </div>
                      <span className='shrink-0 bg-foreground/8 px-2 py-1 font-okx text-xs uppercase text-[#18120f] dark:bg-white/8 dark:text-white'>
                        {asset.decimals ?? '-'}d
                      </span>
                    </div>
                    {asset.contractAddress ? (
                      <p className='mt-3 break-all font-mono text-[10px] leading-5 text-[#675d53] dark:text-white/48'>
                        {asset.contractAddress}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className='mt-4 border border-dashed border-black/10 bg-white/60 p-5 text-sm leading-6 text-[#675d53] dark:border-white/10 dark:bg-white/4 dark:text-white/54'>
                No enabled assets have been attached to this wallet address yet.
              </div>
            )}
          </div>

          {wallet.description ? (
            <div>
              <p className='font-mono text-[10px] uppercase tracking-[0.28em] text-[#7f7368] dark:text-white/38'>
                Notes
              </p>
              <p className='mt-4 text-sm leading-6 text-[#675d53] dark:text-white/58'>{wallet.description}</p>
            </div>
          ) : null}
        </div>

        <aside className='space-y-4'>
          <div className='border border-black/8 bg-white/70 p-5 dark:border-white/10 dark:bg-white/4'>
            <p className='font-mono text-[10px] uppercase tracking-[0.28em] text-[#7f7368] dark:text-white/38'>
              Chain metadata
            </p>
            <div className='mt-4 space-y-3 text-sm leading-6 text-[#675d53] dark:text-white/58'>
              <p>Chain ID: {wallet.chainId ?? 'Not set'}</p>
              <p>CAIP: {wallet.caipNetworkId ?? 'Not set'}</p>
              <p>Provider: {wallet.provider ?? 'Not set'}</p>
            </div>
          </div>

          {wallet.tags.length > 0 ? (
            <div className='border border-black/8 bg-white/70 p-5 dark:border-white/10 dark:bg-white/4'>
              <p className='font-mono text-[10px] uppercase tracking-[0.28em] text-[#7f7368] dark:text-white/38'>
                Tags
              </p>
              <div className='mt-4 flex flex-wrap gap-2'>
                {wallet.tags.map((tag) => (
                  <span
                    key={tag}
                    className='border border-black/10 bg-white/70 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#7f7368] dark:border-white/10 dark:bg-white/4 dark:text-white/48'>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  )
}

function WalletAddressesContent() {
  const allWallets = useQuery(api.userCryptoWallets.list, { includeArchived: true })
  const setPrimaryWallet = useMutation(api.userCryptoWallets.setPrimaryWallet)
  const updateWallet = useMutation(api.userCryptoWallets.updateWallet)
  const [selectedWalletId, setSelectedWalletId] = useState<Id<'user_crypto_wallets'> | null>(null)
  const [copiedWalletId, setCopiedWalletId] = useState<Id<'user_crypto_wallets'> | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)

  if (allWallets === undefined) {
    return <WalletAddressSkeleton />
  }

  const wallets = allWallets.filter((wallet) => !wallet.isArchived)

  if (wallets.length === 0) {
    return (
      <div className='flex h-full min-h-112 flex-col bg-white/55 dark:bg-card/30'>
        <ConnectedWalletAddressOffer savedWallets={allWallets} />
        <EmptyWalletAddresses className='min-h-0 flex-1' />
      </div>
    )
  }

  const selectedWallet = wallets.find((wallet) => wallet.id === selectedWalletId) ?? wallets[0]
  const networkCount = new Set(wallets.map((wallet) => wallet.networkKey)).size
  const enabledAssetCount = wallets.reduce(
    (total, wallet) => total + wallet.assets.filter((asset) => asset.enabled).length,
    0,
  )

  const handleCopy = async (wallet: SavedWalletAddress) => {
    await navigator.clipboard?.writeText(wallet.address)
    setCopiedWalletId(wallet.id)
    window.setTimeout(() => setCopiedWalletId(null), 1500)
  }

  const handleSetPrimary = async (wallet: SavedWalletAddress) => {
    if (wallet.isPrimary) return

    setPendingAction({ id: wallet.id, type: 'primary' })
    try {
      await setPrimaryWallet({ walletId: wallet.id })
    } finally {
      setPendingAction(null)
    }
  }

  const handleArchive = async (wallet: SavedWalletAddress) => {
    setPendingAction({ id: wallet.id, type: 'archive' })
    try {
      await updateWallet({
        walletId: wallet.id,
        isArchived: true,
      })
      if (selectedWalletId === wallet.id) {
        setSelectedWalletId(null)
      }
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <div className='flex h-full min-h-112 min-w-0 flex-col bg-white/55 dark:bg-card/30 xl:flex-row'>
      <section className='flex min-h-112 w-full flex-col border-r border-black/8 dark:border-background xl:h-full xl:w-105 xl:min-w-105'>
        <ConnectedWalletAddressOffer savedWallets={allWallets} />
        <div className='border-b border-black/8 dark:border-background'>
          <div className='flex h-10 items-center justify-between bg-accent/90 px-6 dark:bg-accent/60'>
            <p className='font-mono text-[10px] uppercase tracking-[0.28em] text-white'>Saved addresses</p>
            <Icon name='wallet' className='size-4 text-white' />
          </div>
          <div className='grid grid-cols-3 divide-x divide-black/8 dark:divide-background'>
            <div className='px-5 py-4'>
              <p className='font-mono text-[10px] uppercase tracking-[0.24em] text-[#7f7368] dark:text-white/38'>
                Wallets
              </p>
              <p className='mt-2 font-okx text-2xl text-[#18120f] dark:text-white'>{wallets.length}</p>
            </div>
            <div className='px-5 py-4'>
              <p className='font-mono text-[10px] uppercase tracking-[0.24em] text-[#7f7368] dark:text-white/38'>
                Networks
              </p>
              <p className='mt-2 font-okx text-2xl text-[#18120f] dark:text-white'>{networkCount}</p>
            </div>
            <div className='px-5 py-4'>
              <p className='font-mono text-[10px] uppercase tracking-[0.24em] text-[#7f7368] dark:text-white/38'>
                Assets
              </p>
              <p className='mt-2 font-okx text-2xl text-[#18120f] dark:text-white'>{enabledAssetCount}</p>
            </div>
          </div>
        </div>

        <div className='flex-1 overflow-y-auto'>
          {wallets.map((wallet) => {
            const isSelected = wallet.id === selectedWallet.id

            return (
              <button
                key={wallet.id}
                type='button'
                onClick={() => setSelectedWalletId(wallet.id)}
                className={cn(
                  'grid w-full grid-cols-[3rem_minmax(0,1fr)] gap-3 border-b border-black/8 px-5 py-4 text-left outline-accent transition-colors last:border-b-0 dark:border-background',
                  isSelected
                    ? 'bg-foreground/8 dark:bg-white/8'
                    : 'bg-white/40 hover:bg-card dark:bg-white/3 dark:hover:bg-white/6',
                )}>
                <div className='grid size-10 place-items-center rounded-full bg-white dark:bg-white/4'>
                  <Icon name={getNetworkIcon(wallet)} className='size-8' />
                </div>
                <div className='min-w-0'>
                  <div className='flex min-w-0 items-center gap-2'>
                    <p className='truncate text-sm font-semibold text-[#18120f] dark:text-white'>{wallet.walletName}</p>
                    {wallet.isPrimary ? (
                      <span className='shrink-0 bg-accent px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white'>
                        Primary
                      </span>
                    ) : null}
                  </div>
                  <p className='mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#7f7368] dark:text-white/38'>
                    {wallet.networkName} / {walletTypeLabels[wallet.walletType]}
                  </p>
                  <p className='mt-2 truncate font-mono text-xs text-[#675d53] dark:text-white/54'>
                    {truncateAddress(wallet.address)}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <WalletAddressDetail
        copiedWalletId={copiedWalletId}
        onArchive={handleArchive}
        onCopy={handleCopy}
        onSetPrimary={handleSetPrimary}
        pendingAction={pendingAction}
        wallet={selectedWallet}
      />
    </div>
  )
}

export function WalletAddresses() {
  return (
    <>
      <AuthLoading>
        <WalletAddressSkeleton />
      </AuthLoading>
      <Unauthenticated>
        <WalletAddressesSignedOut />
      </Unauthenticated>
      <Authenticated>
        <WalletAddressesContent />
      </Authenticated>
    </>
  )
}
