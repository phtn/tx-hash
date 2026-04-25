'use client'

import { api } from '@/convex/_generated/api'
import { getPriceSymbolForChainId } from '@/lib/appkit/pay-config'
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'
import { useMutation, useQuery } from 'convex/react'
import type { FunctionReturnType } from 'convex/server'
import { useMemo, useState } from 'react'
import { useChainId } from 'wagmi'

export type SavedCryptoWalletAddress = FunctionReturnType<typeof api.userCryptoWallets.list>[number]

type SupportedChainNamespace = 'bip122' | 'eip155' | 'other' | 'solana'

export interface ConnectedCryptoWalletAddress {
  address: string
  caipNetworkId: string | null
  chainId: number | null
  chainNamespace: SupportedChainNamespace
  networkKey: string
  networkName: string
  normalizedAddress: string
}

interface UseConnectedWalletAddressOfferOptions {
  savedWallets?: SavedCryptoWalletAddress[]
}

const nativeAssetNameBySymbol: Record<string, string> = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  NATIVE: 'Native asset',
  POL: 'Polygon',
  SOL: 'Solana'
}

const nativeAssetDecimalsBySymbol: Record<string, number> = {
  BTC: 8,
  ETH: 18,
  POL: 18,
  SOL: 9
}

const nativeAssetCmcIdBySymbol: Partial<Record<string, number>> = {
  BTC: 1,
  ETH: 1027,
  SOL: 5426
}

function toSupportedChainNamespace(value: string | undefined): SupportedChainNamespace {
  if (value === 'bip122' || value === 'eip155' || value === 'solana') return value
  return 'other'
}

function toNumberChainId(value: number | string | undefined): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'string') return null

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeAddress(address: string, chainNamespace: SupportedChainNamespace) {
  return chainNamespace === 'eip155' ? address.toLowerCase() : address
}

function truncateAddress(address: string) {
  if (address.length <= 22) return address
  return `${address.slice(0, 8)}...${address.slice(-6)}`
}

function getNativeAssetSymbol(wallet: ConnectedCryptoWalletAddress) {
  if (wallet.chainNamespace === 'bip122') return 'BTC'
  if (wallet.chainNamespace === 'solana') return 'SOL'
  if (wallet.chainNamespace === 'eip155' && wallet.chainId !== null) return getPriceSymbolForChainId(wallet.chainId)

  return 'NATIVE'
}

function getNativeAsset(wallet: ConnectedCryptoWalletAddress) {
  const symbol = getNativeAssetSymbol(wallet)

  return {
    assetKey: `${wallet.networkKey}:native`,
    assetType: 'native' as const,
    cmcId: nativeAssetCmcIdBySymbol[symbol] ?? null,
    contractAddress: null,
    decimals: nativeAssetDecimalsBySymbol[symbol] ?? null,
    enabled: true,
    name: nativeAssetNameBySymbol[symbol] ?? symbol,
    sortOrder: 0,
    symbol
  }
}

function getConnectedWalletLabel(wallet: ConnectedCryptoWalletAddress) {
  return `${truncateAddress(wallet.address)}`
}

export function useConnectedWalletAddressOffer(options: UseConnectedWalletAddressOfferOptions = {}) {
  const { caipNetwork, caipNetworkId, chainId: appKitChainId } = useAppKitNetwork()
  const wagmiChainId = useChainId()
  const evmAccount = useAppKitAccount({ namespace: 'eip155' })
  const bitcoinAccount = useAppKitAccount({ namespace: 'bip122' })
  const solanaAccount = useAppKitAccount({ namespace: 'solana' })
  const queriedSavedWallets = useQuery(
    api.userCryptoWallets.list,
    options.savedWallets ? 'skip' : { includeArchived: true }
  )
  const createWallet = useMutation(api.userCryptoWallets.createWallet)
  const updateWallet = useMutation(api.userCryptoWallets.updateWallet)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const savedWallets = options.savedWallets ?? queriedSavedWallets
  const activeNamespace = toSupportedChainNamespace(
    caipNetwork?.chainNamespace ??
      (evmAccount.isConnected
        ? 'eip155'
        : bitcoinAccount.isConnected
          ? 'bip122'
          : solanaAccount.isConnected
            ? 'solana'
            : undefined)
  )
  const connectedWallet = useMemo<ConnectedCryptoWalletAddress | null>(() => {
    const account =
      activeNamespace === 'bip122' ? bitcoinAccount : activeNamespace === 'solana' ? solanaAccount : evmAccount

    if (!account.isConnected || !account.address) {
      return null
    }

    const chainNamespace = activeNamespace
    const chainId =
      chainNamespace === 'eip155' ? toNumberChainId(appKitChainId ?? wagmiChainId ?? caipNetwork?.id) : null
    const networkKey = String(
      caipNetwork?.caipNetworkId ?? caipNetworkId ?? `${chainNamespace}:${chainId ?? caipNetwork?.id ?? 'default'}`
    ).toLowerCase()
    const networkName = caipNetwork?.name ?? (chainNamespace === 'bip122' ? 'Bitcoin' : 'Connected network')

    return {
      address: account.address,
      caipNetworkId: String(caipNetwork?.caipNetworkId ?? caipNetworkId ?? networkKey),
      chainId,
      chainNamespace,
      networkKey,
      networkName,
      normalizedAddress: normalizeAddress(account.address, chainNamespace)
    }
  }, [
    activeNamespace,
    appKitChainId,
    bitcoinAccount,
    caipNetwork?.caipNetworkId,
    caipNetwork?.id,
    caipNetwork?.name,
    caipNetworkId,
    evmAccount,
    solanaAccount,
    wagmiChainId
  ])

  const savedWallet = useMemo(() => {
    if (!connectedWallet || !savedWallets) return null

    return (
      savedWallets.find(
        (wallet) =>
          wallet.networkKey === connectedWallet.networkKey &&
          wallet.normalizedAddress === connectedWallet.normalizedAddress
      ) ?? null
    )
  }, [connectedWallet, savedWallets])

  const hasPrimaryWalletForNetwork = useMemo(() => {
    if (!connectedWallet || !savedWallets) return false

    return savedWallets.some(
      (wallet) => wallet.networkKey === connectedWallet.networkKey && wallet.isPrimary && !wallet.isArchived
    )
  }, [connectedWallet, savedWallets])

  const isChecking = Boolean(connectedWallet && savedWallets === undefined)
  const isSaved = Boolean(savedWallet && !savedWallet.isArchived)
  const isArchived = Boolean(savedWallet?.isArchived)
  const actionLabel = isChecking
    ? 'Checking wallet'
    : isSaving
      ? isArchived
        ? 'Restoring'
        : 'Saving'
      : isSaved
        ? 'saved'
        : isArchived
          ? 'Restore wallet'
          : 'Wallet'

  const saveConnectedWallet = async () => {
    if (!connectedWallet || isChecking || isSaved) return

    setIsSaving(true)
    setError(null)

    try {
      if (savedWallet?.isArchived) {
        await updateWallet({
          walletId: savedWallet.id,
          isArchived: false,
          isVerified: true,
          verifiedAt: Date.now()
        })
        return
      }

      await createWallet({
        address: connectedWallet.address,
        addressType: 'personal',
        assets: [getNativeAsset(connectedWallet)],
        caipNetworkId: connectedWallet.caipNetworkId,
        chainId: connectedWallet.chainId,
        chainNamespace: connectedWallet.chainNamespace,
        description: 'Added from a connected wallet session.',
        isPrimary: !hasPrimaryWalletForNetwork,
        isVerified: true,
        networkKey: connectedWallet.networkKey,
        networkName: connectedWallet.networkName,
        provider: null,
        source: 'wallet_connect',
        tags: ['connected'],
        walletName: `${connectedWallet.networkName} wallet`,
        walletType: 'self_custody'
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save connected wallet.')
    } finally {
      setIsSaving(false)
    }
  }

  return {
    actionLabel,
    connectedWallet,
    connectedWalletLabel: connectedWallet ? getConnectedWalletLabel(connectedWallet) : null,
    error,
    isArchived,
    isChecking,
    isSaved,
    isSaving,
    savedWallet,
    saveConnectedWallet
  }
}
