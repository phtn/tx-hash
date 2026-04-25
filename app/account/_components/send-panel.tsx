'use client'

import { AuthLoading, Authenticated, Unauthenticated, useMutation, useQuery } from 'convex/react'
import { ArrowUpRight, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { isAddress, parseUnits, type Address } from 'viem'
import {
  useChainId,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract
} from 'wagmi'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import type { SavedCryptoWalletAddress } from '@/hooks/use-connected-wallet-address-offer'
import { useCrypto } from '@/hooks/use-crypto'
import { usePaste } from '@/hooks/use-paste'
import { Icon, type IconName } from '@/lib/icons'
import { getUsdcAddress, isUsdcSupportedChain } from '@/lib/usdc'
import { getUsdtAddress, isUsdtSupportedChain } from '@/lib/usdt'
import { sepolia as sepoliaNetwork } from '@reown/appkit/networks'
import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'

type SendNetwork = 'eth' | 'sepolia' | 'pol' | 'btc'
type SendAsset = 'BTC' | 'ETH' | 'POL' | 'USDC' | 'USDT'
type SepoliaStableAsset = Extract<SendAsset, 'USDC' | 'USDT'>
type AmountMode = 'asset' | 'usd'
type SubmittedTransfer = {
  address: string
  amount: string
  assetSymbol: SendAsset
  contactId?: Id<'contacts'>
  hash: `0x${string}`
  walletAddressId?: Id<'contact_wallet_addresses'>
}

const sendNetworkLabels: Record<SendNetwork, string> = {
  btc: 'Bitcoin',
  eth: 'Ethereum',
  sepolia: 'Sepolia',
  pol: 'Polygon'
}

const sendNetworkIcons: Record<SendNetwork, IconName> = {
  btc: 'btc',
  eth: 'eth',
  sepolia: 'eth',
  pol: 'pol'
}

const defaultAssetSymbols: Record<SendNetwork, SendAsset> = {
  btc: 'BTC',
  eth: 'ETH',
  sepolia: 'USDC',
  pol: 'POL'
}

const sendAssetOptions = {
  btc: ['BTC'],
  eth: ['ETH'],
  sepolia: ['USDC', 'USDT'],
  pol: ['POL']
} as const satisfies Record<SendNetwork, readonly SendAsset[]>

const contactNetworkAliases: Record<SendNetwork, string[]> = {
  btc: ['bitcoin', 'btc'],
  eth: ['ethereum', 'eth', 'mainnet'],
  sepolia: ['sepolia', 'ethereum sepolia', 'eth sepolia', 'eip155:11155111'],
  pol: ['polygon', 'matic', 'pol', 'amoy']
}

const ERC20_TRANSFER_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  }
] as const

const SEPOLIA_CHAIN_ID = sepoliaNetwork.id
const RECEIPT_RETRY_DELAY_MS = (attemptIndex: number): number => Math.min(1000 * 2 ** attemptIndex, 5000)
const RECEIPT_REFETCH_INTERVAL_MS = (query: { state: { data: unknown } }): number | false => {
  if (query.state.data) return false
  return 2000
}

const sepoliaStableTokenConfig: Record<
  SepoliaStableAsset,
  {
    getAddress: (chainId: number) => Address | undefined
    isSupportedChain: (chainId: number) => boolean
  }
> = {
  USDC: {
    getAddress: getUsdcAddress,
    isSupportedChain: isUsdcSupportedChain
  },
  USDT: {
    getAddress: getUsdtAddress,
    isSupportedChain: isUsdtSupportedChain
  }
}

const usdFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 2,
  style: 'currency'
})

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Transaction failed.'
}

function isSepoliaStableAsset(asset: SendAsset): asset is SepoliaStableAsset {
  return asset === 'USDC' || asset === 'USDT'
}

function getAssetFractionDigits(asset: SendAsset) {
  if (asset === 'ETH') return 18
  return isSepoliaStableAsset(asset) ? 6 : 8
}

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function matchesSavedWalletNetwork(
  wallet: Pick<SavedCryptoWalletAddress, 'chainId' | 'chainNamespace' | 'networkKey' | 'networkName'>,
  network: SendNetwork
) {
  const networkKey = wallet.networkKey.toLowerCase()
  const networkName = wallet.networkName.toLowerCase()

  if (network === 'btc') {
    return wallet.chainNamespace === 'bip122' || networkKey.includes('bitcoin') || networkName.includes('bitcoin')
  }

  if (network === 'pol') {
    return (
      wallet.chainId === 137 ||
      wallet.chainId === 80002 ||
      networkKey.includes('polygon') ||
      networkKey.includes('matic') ||
      networkKey.includes('amoy') ||
      networkName.includes('polygon') ||
      networkName.includes('amoy')
    )
  }

  if (network === 'sepolia') {
    return (
      wallet.chainNamespace === 'eip155' &&
      (wallet.chainId === SEPOLIA_CHAIN_ID ||
        wallet.chainId === 1 ||
        networkKey === 'eip155:11155111' ||
        networkKey === 'eip155:1' ||
        networkName.includes('sepolia') ||
        networkName.includes('ethereum'))
    )
  }

  if (network === 'eth' && networkName.includes('sepolia')) {
    return false
  }

  if (wallet.chainId !== null) {
    return wallet.chainId === 1
  }

  return networkKey === 'eip155:1' || networkName.includes('ethereum')
}

function matchesContactWalletNetwork(wallet: { network: string }, network: SendNetwork) {
  const normalizedNetwork = wallet.network.trim().toLowerCase()
  if (!normalizedNetwork) {
    return false
  }

  if (network === 'sepolia') {
    return [...contactNetworkAliases.sepolia, ...contactNetworkAliases.eth].some(
      (alias) => normalizedNetwork === alias || normalizedNetwork.includes(alias)
    )
  }

  if (network === 'eth' && normalizedNetwork.includes('sepolia')) {
    return false
  }

  return contactNetworkAliases[network].some(
    (alias) => normalizedNetwork === alias || normalizedNetwork.includes(alias)
  )
}

function formatAmountValue(value: number, maximumFractionDigits: number) {
  return value.toFixed(maximumFractionDigits).replace(/\.?0+$/, '')
}

function LoadingCard() {
  return (
    <Card className='overflow-hidden rounded-[30px] border-white/70 bg-[#f6f2eb] shadow-[0_22px_72px_rgba(63,42,20,0.12)]'>
      <CardHeader className='space-y-3 border-b border-black/5 p-6 sm:p-7'>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-10 w-10 rounded-2xl' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-3 w-56' />
          </div>
        </div>
      </CardHeader>
      <CardContent className='grid gap-4 p-6 sm:p-7'>
        <Skeleton className='h-11 rounded-2xl' />
        <Skeleton className='h-11 rounded-2xl' />
        <Skeleton className='h-11 rounded-2xl' />
      </CardContent>
    </Card>
  )
}

function SignedOutCard() {
  return (
    <Card className='overflow-hidden rounded-[30px] border-white/70 bg-[#f6f2eb] shadow-[0_22px_72px_rgba(63,42,20,0.12)]'>
      <CardHeader className='space-y-3 border-b border-black/5 p-6 sm:p-7'>
        <CardTitle className='flex items-center gap-3 text-[1.35rem] tracking-[-0.04em] text-[#18120f]'>
          <ArrowUpRight className='size-5 text-[#7f7368]' />
          Send
        </CardTitle>
        <CardDescription className='max-w-xl text-sm leading-6 text-[#675d53]'>
          Sign in to send to your saved contacts.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

const SendPanelContent = ({ network }: { network: SendNetwork }) => {
  const contacts = useQuery(api.contacts.list)
  const savedWallets = useQuery(api.userCryptoWallets.list, { includeArchived: false })
  const createTransaction = useMutation(api.transactions.createTransaction)
  const { getBySymbol } = useCrypto()
  const { error: pasteError, isPasting, paste, pasted } = usePaste()
  const { open: openAppKit } = useAppKit()
  const { address: evmWalletAddress, isConnected: isEvmWalletConnected } = useAppKitAccount({ namespace: 'eip155' })
  const { caipNetwork, switchNetwork: switchAppKitNetwork } = useAppKitNetwork()
  const chainId = useChainId()
  const { mutateAsync: switchChainAsync } = useSwitchChain()
  const { mutateAsync: writeContractAsync, isPending: isWalletPromptPending } = useWriteContract()

  const [selectedSavedWalletId, setSelectedSavedWalletId] = useState<Id<'user_crypto_wallets'> | null>(null)
  const [selectedContactId, setSelectedContactId] = useState<Id<'contacts'> | null>(null)
  const [selectedWalletId, setSelectedWalletId] = useState<Id<'contact_wallet_addresses'> | null>(null)
  const [recipientAddress, setRecipientAddress] = useState('')
  const [selectedAsset, setSelectedAsset] = useState<SendAsset>(defaultAssetSymbols[network])
  const [amount, setAmount] = useState('')
  const [amountMode, setAmountMode] = useState<AmountMode>('asset')
  const [isSending, setIsSending] = useState(false)
  const [didSend, setDidSend] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [submittedTransfer, setSubmittedTransfer] = useState<SubmittedTransfer | null>(null)
  const recordingHashRef = useRef<`0x${string}` | null>(null)

  const { isLoading: isConfirmingTransfer, data: transferReceipt } = useWaitForTransactionReceipt({
    hash: submittedTransfer?.hash,
    query: {
      enabled: Boolean(submittedTransfer?.hash),
      retry: 5,
      retryDelay: RECEIPT_RETRY_DELAY_MS,
      refetchInterval: RECEIPT_REFETCH_INTERVAL_MS
    }
  })

  const networkLabel = sendNetworkLabels[network]
  const assetOptions = sendAssetOptions[network]
  const assetSymbol = selectedAsset
  const assetFractionDigits = getAssetFractionDigits(assetSymbol)
  const isSepoliaSend = network === 'sepolia'

  useEffect(() => {
    if ((assetOptions as readonly SendAsset[]).includes(selectedAsset)) {
      return
    }

    setSelectedAsset(defaultAssetSymbols[network])
  }, [assetOptions, network, selectedAsset])

  const availableSavedWallets = useMemo(
    () => (savedWallets ?? []).filter((wallet) => matchesSavedWalletNetwork(wallet, network)),
    [network, savedWallets]
  )
  const availableContacts = useMemo(
    () =>
      (contacts ?? []).filter((contact) =>
        contact.walletAddresses.some((walletAddress) => matchesContactWalletNetwork(walletAddress, network))
      ),
    [contacts, network]
  )
  const selectedSavedWallet = useMemo(
    () => availableSavedWallets.find((wallet) => wallet.id === selectedSavedWalletId) ?? null,
    [availableSavedWallets, selectedSavedWalletId]
  )
  const selectedContact = useMemo(
    () => availableContacts.find((contact) => contact.id === selectedContactId) ?? null,
    [availableContacts, selectedContactId]
  )
  const selectedContactWallets = useMemo(
    () =>
      selectedContact?.walletAddresses.filter((walletAddress) => matchesContactWalletNetwork(walletAddress, network)) ??
      [],
    [network, selectedContact]
  )
  const selectedWallet = useMemo(
    () => selectedContactWallets.find((wallet) => wallet.id === selectedWalletId) ?? null,
    [selectedContactWallets, selectedWalletId]
  )
  const assetPrice = useMemo(() => {
    if (assetSymbol === 'USDC' || assetSymbol === 'USDT') {
      return 1
    }

    if (assetSymbol === 'BTC') {
      return getBySymbol('BTC')?.price ?? null
    }

    if (assetSymbol === 'POL') {
      return getBySymbol('POL')?.price ?? getBySymbol('MATIC')?.price ?? null
    }

    return getBySymbol('ETH')?.price ?? null
  }, [assetSymbol, getBySymbol])
  const normalizedRecipientAddress = recipientAddress.trim()
  const assetAmountValue = useMemo(() => {
    const parsedAmount = Number.parseFloat(amount)
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return null
    }

    if (amountMode === 'asset') {
      return parsedAmount
    }

    if (!assetPrice || assetPrice <= 0) {
      return null
    }

    return parsedAmount / assetPrice
  }, [amount, amountMode, assetPrice])
  const usdAmountValue = useMemo(() => {
    const parsedAmount = Number.parseFloat(amount)
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return null
    }

    if (amountMode === 'usd') {
      return parsedAmount
    }

    if (!assetPrice || assetPrice <= 0) {
      return null
    }

    return parsedAmount * assetPrice
  }, [amount, amountMode, assetPrice])

  const isRecipientAddressValid =
    !isSepoliaSend || normalizedRecipientAddress.length === 0 || isAddress(normalizedRecipientAddress)
  const canSend = normalizedRecipientAddress.length > 0 && assetAmountValue !== null && isRecipientAddressValid
  const isTransferBusy =
    isSending ||
    isWalletPromptPending ||
    isConfirmingTransfer ||
    submittedTransfer !== null

  const clearAddressSelections = () => {
    setSelectedSavedWalletId(null)
    setSelectedContactId(null)
    setSelectedWalletId(null)
  }

  const handleSelectSavedWallet = (walletId: Id<'user_crypto_wallets'>) => {
    const wallet = availableSavedWallets.find((item) => item.id === walletId)

    setSendError(null)
    setSelectedSavedWalletId(walletId)
    setSelectedContactId(null)
    setSelectedWalletId(null)
    setRecipientAddress(wallet?.address ?? '')
  }

  const handleSelectContact = (contactId: Id<'contacts'>) => {
    const contact = availableContacts.find((item) => item.id === contactId)
    const firstWallet =
      contact?.walletAddresses.find((walletAddress) => matchesContactWalletNetwork(walletAddress, network)) ?? null

    setSendError(null)
    setSelectedSavedWalletId(null)
    setSelectedContactId(contactId)
    setSelectedWalletId(firstWallet?.id ?? null)
    setRecipientAddress(firstWallet?.address ?? '')
  }

  const handleAddressChange = (value: string) => {
    setSendError(null)
    clearAddressSelections()
    setRecipientAddress(value)
  }

  const handlePasteAddress = async () => {
    const pastedText = await paste()
    if (!pastedText) {
      return
    }

    setSendError(null)
    clearAddressSelections()
    setRecipientAddress(pastedText.trim())
  }

  const handleSelectAsset = (value: string) => {
    setSendError(null)
    setSelectedAsset(value as SendAsset)
  }

  const handleAmountChange = (value: string) => {
    setSendError(null)
    setAmount(value)
  }

  const handleToggleAmountMode = (nextMode: AmountMode) => {
    if (nextMode === amountMode) {
      return
    }

    const parsedAmount = Number.parseFloat(amount)
    if (Number.isFinite(parsedAmount) && parsedAmount > 0 && assetPrice && assetPrice > 0) {
      const convertedAmount = nextMode === 'usd' ? parsedAmount * assetPrice : parsedAmount / assetPrice
      setAmount(formatAmountValue(convertedAmount, nextMode === 'usd' ? 2 : assetFractionDigits))
    }

    setSendError(null)
    setAmountMode(nextMode)
  }

  const ensureSepoliaWalletReady = async () => {
    if (!isEvmWalletConnected) {
      await openAppKit({
        view: 'Connect',
        namespace: 'eip155'
      })
      return false
    }

    if (caipNetwork?.chainNamespace !== 'eip155' || chainId !== SEPOLIA_CHAIN_ID) {
      await switchAppKitNetwork(sepoliaNetwork)

      if (chainId !== SEPOLIA_CHAIN_ID) {
        await switchChainAsync({ chainId: SEPOLIA_CHAIN_ID })
      }
    }

    return true
  }

  const handleSend = async () => {
    if (!canSend || assetAmountValue === null) return

    setIsSending(true)
    setDidSend(false)
    setSendError(null)
    try {
      const formattedAmount = formatAmountValue(assetAmountValue, assetFractionDigits)
      if (Number.parseFloat(formattedAmount) <= 0) {
        throw new Error(`${assetSymbol} amount is too small.`)
      }

      if (isSepoliaSend) {
        if (!isAddress(normalizedRecipientAddress)) {
          throw new Error('Enter a valid EVM recipient address.')
        }

        const walletReady = await ensureSepoliaWalletReady()
        if (!walletReady) {
          setIsSending(false)
          return
        }

        if (!isSepoliaStableAsset(assetSymbol)) {
          throw new Error('Sepolia sends currently support USDC and USDT.')
        }

        const tokenConfig = sepoliaStableTokenConfig[assetSymbol]
        if (!tokenConfig.isSupportedChain(SEPOLIA_CHAIN_ID)) {
          throw new Error(`${assetSymbol} is not supported on Sepolia.`)
        }

        const tokenAddress = tokenConfig.getAddress(SEPOLIA_CHAIN_ID)
        if (!tokenAddress) {
          throw new Error(`${assetSymbol} contract address is not configured for Sepolia.`)
        }

        const hash = await writeContractAsync({
          abi: ERC20_TRANSFER_ABI,
          address: tokenAddress,
          functionName: 'transfer',
          args: [normalizedRecipientAddress as Address, parseUnits(formattedAmount, 6)],
          chainId: SEPOLIA_CHAIN_ID
        })

        setSubmittedTransfer({
          address: normalizedRecipientAddress,
          amount: formattedAmount,
          assetSymbol,
          contactId: selectedContact?.id,
          hash,
          walletAddressId: selectedWallet?.id
        })
        return
      }

      await createTransaction({
        address: normalizedRecipientAddress,
        amount: formattedAmount,
        contactId: selectedContact?.id,
        network: networkLabel,
        walletAddressId: selectedWallet?.id
      })
      setDidSend(true)
      clearAddressSelections()
      setRecipientAddress('')
      setAmount('')
      setAmountMode('asset')
      window.setTimeout(() => setDidSend(false), 2500)
    } catch (error) {
      setSendError(getErrorMessage(error))
      if (isSepoliaSend) {
        setSubmittedTransfer(null)
        setIsSending(false)
      }
    } finally {
      if (!isSepoliaSend) {
        setIsSending(false)
      }
    }
  }

  useEffect(() => {
    if (!submittedTransfer || !transferReceipt || transferReceipt.blockNumber === undefined) {
      return
    }

    if (recordingHashRef.current === submittedTransfer.hash) {
      return
    }

    if (transferReceipt.status !== 'success') {
      setSendError('Transaction reverted on Sepolia.')
      setSubmittedTransfer(null)
      setIsSending(false)
      return
    }

    recordingHashRef.current = submittedTransfer.hash
    void (async () => {
      try {
        await createTransaction({
          address: submittedTransfer.address,
          amount: submittedTransfer.amount,
          contactId: submittedTransfer.contactId,
          network: networkLabel,
          note: `${submittedTransfer.assetSymbol} transfer confirmed on ${networkLabel}. Hash: ${submittedTransfer.hash}`,
          walletAddressId: submittedTransfer.walletAddressId
        })

        setDidSend(true)
        setSelectedSavedWalletId(null)
        setSelectedContactId(null)
        setSelectedWalletId(null)
        setRecipientAddress('')
        setAmount('')
        setAmountMode('asset')
        window.setTimeout(() => setDidSend(false), 2500)
      } catch (error) {
        setSendError(`Transfer confirmed, but the transaction record was not saved: ${getErrorMessage(error)}`)
      } finally {
        recordingHashRef.current = null
        setSubmittedTransfer(null)
        setIsSending(false)
      }
    })()
  }, [createTransaction, networkLabel, submittedTransfer, transferReceipt])

  if (contacts === undefined || savedWallets === undefined) {
    return <LoadingCard />
  }

  const addressSourceLabel = selectedContact
    ? `Filled from ${selectedContact.name}${selectedWallet?.label ? ` • ${selectedWallet.label}` : ''}`
    : selectedSavedWallet
      ? `Filled from ${selectedSavedWallet.walletName}`
      : null
  const addressHelperLabel = !isRecipientAddressValid
    ? 'Enter a valid EVM recipient address.'
    : (pasteError?.message ??
      addressSourceLabel ??
      `Select a saved wallet or contact, or paste a ${networkLabel.toLowerCase()} destination.`)
  const amountHelperLabel =
    amountMode === 'asset'
      ? usdAmountValue !== null
        ? `≈ ${usdFormatter.format(usdAmountValue)}`
        : assetPrice
          ? `Enter ${assetSymbol.toLowerCase()} amount`
          : 'USD quote unavailable'
      : assetAmountValue !== null
        ? `≈ ${formatAmountValue(assetAmountValue, assetFractionDigits)} ${assetSymbol}`
        : `USD mode requires a live ${assetSymbol} quote`
  const sepoliaWalletLabel = isSepoliaSend
    ? isEvmWalletConnected && evmWalletAddress
      ? `Source wallet ${shortenAddress(evmWalletAddress)}${
          chainId === SEPOLIA_CHAIN_ID ? ' on Sepolia' : ' will switch to Sepolia before sending'
        }`
      : 'Connect an EVM wallet to send Sepolia USDC or USDT.'
    : null
  const sendStatusLabel =
    sendError ??
    (didSend
      ? `${assetSymbol} transfer confirmed and saved.`
      : submittedTransfer
        ? `Waiting for Sepolia confirmation: ${shortenAddress(submittedTransfer.hash)}`
        : sepoliaWalletLabel)
  const sendStatusClassName = sendError
    ? 'text-red-500'
    : didSend
      ? 'text-[#26a269]'
      : 'text-foreground/65'
  const sendButtonLabel = isWalletPromptPending
    ? 'Confirm in wallet'
    : isConfirmingTransfer || submittedTransfer
      ? 'Confirming…'
      : isSending
        ? 'Sending…'
        : isSepoliaSend && !isEvmWalletConnected
          ? 'Connect wallet'
          : `Send ${assetSymbol}`

  return (
    <Card className='overflow-hidden rounded-[24.01px] border-foreground/50 bg-foreground/40'>
      <CardHeader className='border-b border-foreground/15 px-6'>
        <CardTitle className='flex items-center justify-between'>
          <div className='flex items-center gap-3 text-[1.35rem]'>
            <Icon name={sendNetworkIcons[network]} className='size-6' />
            <span>Send {networkLabel}</span>
          </div>
          <div className='flex items-center space-x-4'>
            <Select
              disabled={availableSavedWallets.length === 0}
              value={selectedSavedWallet?.id}
              onValueChange={(value) => handleSelectSavedWallet(value as Id<'user_crypto_wallets'>)}>
              <SelectTrigger className='min-w-40'>
                <SelectValue placeholder='My Wallets' />
              </SelectTrigger>
              <SelectContent className='border-foreground/15'>
                {availableSavedWallets.length === 0 ? (
                  <SelectItem value='no-wallets' disabled>
                    No saved {networkLabel.toLowerCase()} wallets
                  </SelectItem>
                ) : (
                  availableSavedWallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.walletName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Select
              disabled={availableContacts.length === 0}
              value={selectedContact?.id}
              onValueChange={(value) => handleSelectContact(value as Id<'contacts'>)}>
              <SelectTrigger className='min-w-40'>
                <SelectValue placeholder='Contacts' />
              </SelectTrigger>
              <SelectContent className='border-foreground/15'>
                {availableContacts.length === 0 ? (
                  <SelectItem value='no-contacts' disabled>
                    No {networkLabel.toLowerCase()} contacts
                  </SelectItem>
                ) : (
                  availableContacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-6 px-6'>
        <div className='grid gap-2'>
          <label htmlFor='address' className='text-base font-medium'>
            Address
          </label>
          <div className='relative'>
            <Input
              id='address'
              value={recipientAddress}
              onChange={(event) => handleAddressChange(event.target.value)}
              placeholder='Paste or select an address'
              className='h-14 rounded-xl border border-background/40 pr-20 font-mono text-[16px]!'
            />
            <button
              type='button'
              onClick={() => void handlePasteAddress()}
              disabled={isPasting}
              className='absolute inset-y-2 right-2 rounded-lg border border-background/30 px-3 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors hover:bg-background/6 disabled:cursor-not-allowed disabled:opacity-60'>
              {isPasting ? 'Pasting' : pasted ? 'Pasted' : 'Paste'}
            </button>
          </div>
          <p className='text-sm text-foreground/65'>
            {addressHelperLabel}
          </p>
        </div>

        <div className='grid gap-2'>
          <div className='flex items-center justify-between gap-4'>
            <label htmlFor='amount' className='text-base font-medium'>
              Amount
            </label>
            <div className='flex items-center gap-2'>
              {assetOptions.length > 1 ? (
                <Select value={assetSymbol} onValueChange={handleSelectAsset} disabled={isTransferBusy}>
                  <SelectTrigger className='h-10 min-w-24 rounded-xl'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='border-foreground/15'>
                    {assetOptions.map((asset) => (
                      <SelectItem key={asset} value={asset}>
                        {asset}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
              <div className='flex items-center rounded-xl border border-background/20 p-1'>
                <button
                  type='button'
                  onClick={() => handleToggleAmountMode('asset')}
                  className={`rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
                    amountMode === 'asset'
                      ? 'bg-background text-white dark:bg-white dark:text-background'
                      : 'text-foreground/60'
                  }`}>
                  {assetSymbol}
                </button>
                <button
                  type='button'
                  onClick={() => handleToggleAmountMode('usd')}
                  disabled={assetPrice === null}
                  className={`rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    amountMode === 'usd'
                      ? 'bg-background text-white dark:bg-white dark:text-background'
                      : 'text-foreground/60'
                  }`}>
                  USD
                </button>
              </div>
            </div>
          </div>
          <Input
            id='amount'
            inputMode='decimal'
            value={amount}
            onChange={(event) => handleAmountChange(event.target.value)}
            placeholder={amountMode === 'asset' ? `0.00 ${assetSymbol}` : '$0.00'}
            className='h-14 rounded-xl border border-background/40 font-mono text-[16px]!'
          />
          <p className='text-sm text-foreground/65'>{amountHelperLabel}</p>
        </div>

        <Button
          type='button'
          onClick={() => void handleSend()}
          disabled={!canSend || isTransferBusy}
          className='h-14 w-full gap-2 rounded-xl bg-accent text-white hover:bg-[#28201c] disabled:opacity-40'>
          {isTransferBusy ? <Loader2 className='size-4 animate-spin' /> : <ArrowUpRight className='size-4' />}
          {sendButtonLabel}
        </Button>
        {sendStatusLabel ? <p className={`text-sm ${sendStatusClassName}`}>{sendStatusLabel}</p> : null}
      </CardContent>

      <CardFooter className='hidden border-t border-black/5 px-6 py-5 sm:px-7'>
        {didSend ? (
          <p className='text-xs uppercase tracking-[0.24em] text-[#26a269]'>Transaction saved successfully</p>
        ) : (
          <p className='text-xs uppercase tracking-[0.24em] text-[#8b7c6e]'>
            {availableContacts.length} {networkLabel.toLowerCase()} contact{availableContacts.length !== 1 ? 's' : ''}{' '}
            available
          </p>
        )}
      </CardFooter>
    </Card>
  )
}

interface SendPanelProps {
  network: SendNetwork
}

export const SendPanel = ({ network }: SendPanelProps) => {
  return (
    <>
      <AuthLoading>
        <LoadingCard />
      </AuthLoading>
      <Unauthenticated>
        <SignedOutCard />
      </Unauthenticated>
      <Authenticated>
        <SendPanelContent network={network} />
      </Authenticated>
    </>
  )
}
