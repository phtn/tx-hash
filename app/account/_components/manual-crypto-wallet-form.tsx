'use client'

import { useMutation, useQuery } from 'convex/react'
import { Loader2 } from 'lucide-react'
import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import type { SavedCryptoWalletAddress } from '@/hooks/use-connected-wallet-address-offer'
import { usePaste } from '@/hooks/use-paste'
import { cn } from '@/lib/utils'

type WalletType = SavedCryptoWalletAddress['walletType']
type AddressType = SavedCryptoWalletAddress['addressType']
type ChainNamespace = SavedCryptoWalletAddress['chainNamespace']

interface ManualCryptoWalletFormProps {
  className?: string
  onCreated?: (walletId: Id<'user_crypto_wallets'>) => void
  submitLabel?: string
}

type ManualWalletDraft = {
  address: string
  addressType: AddressType
  description: string
  isPrimary: boolean
  networkId: NetworkPreset['id']
  walletName: string
  walletType: WalletType
}

type NetworkPreset = {
  caipNetworkId: string
  chainId: number | null
  chainNamespace: ChainNamespace
  id:
    | 'bitcoin-mainnet'
    | 'ethereum-mainnet'
    | 'ethereum-sepolia'
    | 'polygon-mainnet'
    | 'polygon-amoy'
    | 'solana-mainnet'
  label: string
  nativeAssetDecimals: number
  nativeAssetName: string
  nativeAssetSymbol: string
  networkKey: string
  networkName: string
  placeholder: string
}

const networkPresets: NetworkPreset[] = [
  {
    caipNetworkId: 'bip122:000000000019d6689c085ae165831e93',
    chainId: null,
    chainNamespace: 'bip122',
    id: 'bitcoin-mainnet',
    label: 'Bitcoin',
    nativeAssetDecimals: 8,
    nativeAssetName: 'Bitcoin',
    nativeAssetSymbol: 'BTC',
    networkKey: 'bip122:000000000019d6689c085ae165831e93',
    networkName: 'Bitcoin',
    placeholder: 'bc1q...'
  },
  {
    caipNetworkId: 'eip155:1',
    chainId: 1,
    chainNamespace: 'eip155',
    id: 'ethereum-mainnet',
    label: 'Ethereum',
    nativeAssetDecimals: 18,
    nativeAssetName: 'Ethereum',
    nativeAssetSymbol: 'ETH',
    networkKey: 'eip155:1',
    networkName: 'Ethereum',
    placeholder: '0x...'
  },
  {
    caipNetworkId: 'eip155:11155111',
    chainId: 11155111,
    chainNamespace: 'eip155',
    id: 'ethereum-sepolia',
    label: 'Ethereum Sepolia',
    nativeAssetDecimals: 18,
    nativeAssetName: 'Ethereum',
    nativeAssetSymbol: 'ETH',
    networkKey: 'eip155:11155111',
    networkName: 'Ethereum Sepolia',
    placeholder: '0x...'
  },
  {
    caipNetworkId: 'eip155:137',
    chainId: 137,
    chainNamespace: 'eip155',
    id: 'polygon-mainnet',
    label: 'Polygon',
    nativeAssetDecimals: 18,
    nativeAssetName: 'Polygon',
    nativeAssetSymbol: 'POL',
    networkKey: 'eip155:137',
    networkName: 'Polygon',
    placeholder: '0x...'
  },
  {
    caipNetworkId: 'eip155:80002',
    chainId: 80002,
    chainNamespace: 'eip155',
    id: 'polygon-amoy',
    label: 'Polygon Amoy',
    nativeAssetDecimals: 18,
    nativeAssetName: 'Polygon',
    nativeAssetSymbol: 'POL',
    networkKey: 'eip155:80002',
    networkName: 'Polygon Amoy',
    placeholder: '0x...'
  },
  {
    caipNetworkId: 'solana:mainnet',
    chainId: null,
    chainNamespace: 'solana',
    id: 'solana-mainnet',
    label: 'Solana',
    nativeAssetDecimals: 9,
    nativeAssetName: 'Solana',
    nativeAssetSymbol: 'SOL',
    networkKey: 'solana:mainnet',
    networkName: 'Solana',
    placeholder: 'So111...'
  }
]

const walletTypeLabels: Record<WalletType, string> = {
  custodial: 'Custodial',
  exchange: 'Exchange',
  hardware: 'Hardware',
  self_custody: 'Self custody',
  smart_contract: 'Smart contract',
  watch_only: 'Watch only'
}

const addressTypeLabels: Record<AddressType, string> = {
  contract: 'Contract',
  deposit: 'Deposit',
  multisig: 'Multisig',
  personal: 'Personal',
  unknown: 'Unknown',
  withdrawal: 'Withdrawal'
}

const defaultDraft: ManualWalletDraft = {
  address: '',
  addressType: 'personal',
  description: '',
  isPrimary: false,
  networkId: 'ethereum-mainnet',
  walletName: '',
  walletType: 'self_custody'
}

function toOptionalString(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function buildNativeAsset(preset: NetworkPreset) {
  return {
    assetKey: `${preset.networkKey}:native`,
    assetType: 'native' as const,
    cmcId:
      preset.nativeAssetSymbol === 'BTC'
        ? 1
        : preset.nativeAssetSymbol === 'ETH'
          ? 1027
          : preset.nativeAssetSymbol === 'SOL'
            ? 5426
            : null,
    contractAddress: null,
    decimals: preset.nativeAssetDecimals,
    enabled: true,
    name: preset.nativeAssetName,
    sortOrder: 0,
    symbol: preset.nativeAssetSymbol
  }
}

export function ManualCryptoWalletForm({
  className,
  onCreated,
  submitLabel = 'Save wallet'
}: ManualCryptoWalletFormProps) {
  const createWallet = useMutation(api.userCryptoWallets.createWallet)
  const savedWallets = useQuery(api.userCryptoWallets.list, { includeArchived: false })
  const { error: pasteError, isPasting, paste, pasted } = usePaste()

  const [draft, setDraft] = useState<ManualWalletDraft>(defaultDraft)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const selectedNetwork = useMemo(
    () => networkPresets.find((preset) => preset.id === draft.networkId) ?? networkPresets[0],
    [draft.networkId]
  )
  const networkWalletCount = useMemo(
    () => savedWallets?.filter((wallet) => wallet.networkKey === selectedNetwork.networkKey).length ?? 0,
    [savedWallets, selectedNetwork.networkKey]
  )
  const canSubmit = draft.walletName.trim().length > 0 && draft.address.trim().length > 0

  const handlePasteAddress = async () => {
    const pastedText = await paste()
    if (!pastedText) {
      return
    }

    setDraft((current) => ({
      ...current,
      address: pastedText.trim()
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) {
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const walletId = await createWallet({
        address: draft.address.trim(),
        addressType: draft.addressType,
        assets: [buildNativeAsset(selectedNetwork)],
        caipNetworkId: selectedNetwork.caipNetworkId,
        chainId: selectedNetwork.chainId,
        chainNamespace: selectedNetwork.chainNamespace,
        description: toOptionalString(draft.description),
        isPrimary: draft.isPrimary,
        networkKey: selectedNetwork.networkKey,
        networkName: selectedNetwork.networkName,
        provider: null,
        source: 'manual',
        walletName: draft.walletName.trim(),
        walletType: draft.walletType
      })

      setDraft((current) => ({
        ...defaultDraft,
        addressType: current.addressType,
        isPrimary: false,
        networkId: current.networkId,
        walletType: current.walletType
      }))
      setSuccessMessage(`Saved ${selectedNetwork.label} wallet. Use the button above to return to the list.`)
      onCreated?.(walletId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save wallet.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={cn('flex h-full min-h-0 flex-col bg-card', className)}>
      <div className='border-b border-black/8 px-6 py-5 dark:border-background'>
        <p className='font-mono text-[8px] uppercase tracking-[0.28em] text-[#7f7368] dark:text-white/38'>New Entry</p>
        <h3 className='mt-3 font-ct text-3xl leading-none text-[#18120f] dark:text-white'>Add crypto wallet</h3>
        <p className='mt-3 max-w-2xl text-sm leading-6 text-[#675d53] dark:text-white/58'>Add a new wallet address.</p>
      </div>

      <form className='grid gap-6 p-6' onSubmit={handleSubmit}>
        <div className='grid gap-4 xl:grid-cols-2'>
          <div className='grid gap-2'>
            <label className='text-[10px] font-medium uppercase tracking-[0.28em] text-[#7f7368]'>Network</label>
            <Select
              value={draft.networkId}
              onValueChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  networkId: value as NetworkPreset['id']
                }))
              }>
              <SelectTrigger className='h-11 rounded-2xl border-black/10 shadow-[0_8px_24px_rgba(63,42,20,0.05)]'>
                <SelectValue placeholder='Select network' />
              </SelectTrigger>
              <SelectContent className='border-black/10'>
                {networkPresets.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className='text-xs leading-5 text-[#7f7368] dark:text-white/42'>
              {networkWalletCount > 0
                ? `${networkWalletCount} saved wallet${networkWalletCount === 1 ? '' : 's'} already use this network.`
                : `No saved ${selectedNetwork.label.toLowerCase()} wallets yet.`}
            </p>
          </div>

          <div className='grid gap-2'>
            <label className='text-[10px] font-medium uppercase tracking-[0.28em] text-[#7f7368]'>Wallet name</label>
            <Input
              value={draft.walletName}
              onChange={(event) => setDraft((current) => ({ ...current, walletName: event.target.value }))}
              placeholder={`${selectedNetwork.label} wallet`}
              className='h-11 rounded-2xl border-black/10 bg-white/80 shadow-[0_8px_24px_rgba(63,42,20,0.05)]'
            />
          </div>
        </div>

        <div className='grid gap-4 xl:grid-cols-2'>
          <div className='grid gap-2'>
            <label className='text-[10px] font-medium uppercase tracking-[0.28em] text-[#7f7368]'>Wallet type</label>
            <Select
              value={draft.walletType}
              onValueChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  walletType: value as WalletType
                }))
              }>
              <SelectTrigger className='h-11 rounded-2xl border-black/10'>
                <SelectValue placeholder='Select wallet type' />
              </SelectTrigger>
              <SelectContent className='border-black/10'>
                {Object.entries(walletTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='grid gap-2'>
            <label className='text-[10px] font-medium uppercase tracking-[0.28em] text-[#7f7368]'>Address type</label>
            <Select
              value={draft.addressType}
              onValueChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  addressType: value as AddressType
                }))
              }>
              <SelectTrigger className='h-11 rounded-2xl border-black/10'>
                <SelectValue placeholder='Select address type' />
              </SelectTrigger>
              <SelectContent className='border-black/10'>
                {Object.entries(addressTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='grid gap-2'>
          <label className='text-[10px] font-medium uppercase tracking-[0.28em] text-[#7f7368]'>Wallet address</label>
          <div className='relative'>
            <Input
              value={draft.address}
              onChange={(event) => setDraft((current) => ({ ...current, address: event.target.value }))}
              placeholder={selectedNetwork.placeholder}
              className='h-11 rounded-2xl border-black/10 bg-white/80 pr-20 font-mono shadow-[0_8px_24px_rgba(63,42,20,0.05)]'
            />
            <button
              type='button'
              onClick={() => void handlePasteAddress()}
              disabled={isPasting}
              className='absolute inset-y-1.5 right-1.5 rounded-xl border border-black/10 bg-white/85 px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#18120f] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/8 dark:text-white dark:hover:bg-white/12'>
              {isPasting ? 'Pasting' : pasted ? 'Pasted' : 'Paste'}
            </button>
          </div>
          <p className='text-xs leading-5 text-[#7f7368] dark:text-white/42'>
            {pasteError?.message ??
              `Saved as \`${selectedNetwork.networkKey}\` with \`${selectedNetwork.nativeAssetSymbol}\` as the default native asset.`}
          </p>
        </div>

        <div className='grid gap-2'>
          <label className='text-[10px] font-medium uppercase tracking-[0.28em] text-[#7f7368]'>Notes</label>
          <Textarea
            value={draft.description}
            onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
            placeholder='Context, custody notes, or purpose of this wallet.'
            className='min-h-24 rounded-[22px] border-black/10 bg-white/80 shadow-[0_8px_24px_rgba(63,42,20,0.05)]'
          />
        </div>

        <label className='flex items-start gap-3 rounded-md border border-black/8 bg-white/65 p-4 text-sm leading-6 text-[#675d53] dark:border-white/10 dark:bg-white/4 dark:text-white/58'>
          <Checkbox
            checked={draft.isPrimary}
            onCheckedChange={(checked) =>
              setDraft((current) => ({
                ...current,
                isPrimary: checked === true
              }))
            }
            className='mt-1'
          />
          <span>
            <span className='block font-medium text-[#18120f] dark:text-white'>Set as primary wallet</span>
            <span className='mt-1 block'>
              If enabled, this wallet becomes the primary route for {selectedNetwork.label}. You can change it later
              from the wallet details pane.
            </span>
          </span>
        </label>

        {error ? (
          <div className='rounded-[20px] border border-rose-500/20 bg-rose-500/8 px-4 py-3 text-sm leading-6 text-rose-700 dark:text-rose-300'>
            {error}
          </div>
        ) : null}

        {successMessage ? (
          <div className='rounded-[20px] border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm leading-6 text-emerald-700 dark:text-emerald-300'>
            {successMessage}
          </div>
        ) : null}

        <div className='flex flex-wrap items-center justify-between gap-3 border-t border-black/8 pt-2 dark:border-background'>
          <p className='text-xs leading-5 text-[#7f7368] dark:text-white/42'>
            Manual wallets are saved with source `manual` and include the network’s native asset by default.
          </p>
          <button
            type='submit'
            disabled={!canSubmit || isSaving}
            className='h-11 rounded-2xl bg-[#18120f] px-5 font-mono text-[10px] uppercase tracking-[0.24em] text-white transition-colors hover:bg-[#28201c] disabled:cursor-not-allowed disabled:opacity-50'>
            {isSaving ? (
              <span className='inline-flex items-center gap-2'>
                <Loader2 className='size-4 animate-spin' />
                Saving
              </span>
            ) : (
              submitLabel
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
