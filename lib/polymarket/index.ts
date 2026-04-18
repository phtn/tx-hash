import 'server-only'

import {
  Chain,
  ClobClient,
  OrderType,
  Side,
  type ApiKeyCreds,
  type OpenOrderParams,
  type TickSize,
  type TradeParams,
} from '@polymarket/clob-client-v2'
import { Wallet } from 'ethers'

const POLYMARKET_HOST = 'https://clob.polymarket.com'
const PRIVATE_KEY_PATTERN = /^0x[0-9a-fA-F]{64}$/

type ClobClientOptions = ConstructorParameters<typeof ClobClient>[0]
type ClobSigner = NonNullable<ClobClientOptions['signer']>
type ClobTypedDataDomain = Record<string, unknown>
type ClobTypedDataTypes = Record<string, Array<{ name: string; type: string }>>
type ClobTypedDataValue = Record<string, unknown>

export type PolymarketClientConfig = {
  host?: string
  privateKey?: string
  useServerTime?: boolean
  throwOnError?: boolean
}

export type PolymarketAuthenticatedClientConfig = PolymarketClientConfig & {
  creds?: ApiKeyCreds | null
}

export type PolymarketLimitOrderInput = {
  tokenId: string
  price: number
  side: Side
  size: number
  tickSize?: TickSize
  orderType?: OrderType.GTC | OrderType.GTD
  postOnly?: boolean
}

export type PolymarketMarketOrderInput = {
  tokenId: string
  amount: number
  side: Side
  price?: number
  tickSize?: TickSize
  orderType?: OrderType.FOK | OrderType.FAK
}

function readEnv(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim()

    if (value) {
      return value
    }
  }

  return undefined
}

function readPrivateKey(privateKey = readEnv('POLYMARKET_PRIVATE_KEY', 'EP')) {
  if (!privateKey) {
    throw new Error('Missing POLYMARKET_PRIVATE_KEY (or legacy EP) environment variable.')
  }

  const normalizedPrivateKey = privateKey.trim()

  if (!PRIVATE_KEY_PATTERN.test(normalizedPrivateKey)) {
    throw new Error('POLYMARKET_PRIVATE_KEY (or legacy EP) must be a 0x-prefixed 32-byte private key.')
  }

  return normalizedPrivateKey
}

function createEthersV6ClobSigner(privateKey?: string): ClobSigner {
  const wallet = new Wallet(readPrivateKey(privateKey))

  return {
    getAddress: () => wallet.getAddress(),
    _signTypedData: (
      domain: ClobTypedDataDomain,
      types: ClobTypedDataTypes,
      value: ClobTypedDataValue
    ) => wallet.signTypedData(domain, types, value),
  }
}

export function readPolymarketApiCredentialsFromEnv(): ApiKeyCreds | null {
  const key = readEnv('POLYMARKET_API_KEY', 'POLYMARKET_CLOB_API_KEY', 'CLOB_API_KEY')
  const secret = readEnv('POLYMARKET_API_SECRET', 'POLYMARKET_CLOB_SECRET', 'CLOB_SECRET')
  const passphrase = readEnv(
    'POLYMARKET_API_PASSPHRASE',
    'POLYMARKET_API_PASS_PHRASE',
    'POLYMARKET_CLOB_PASSPHRASE',
    'CLOB_PASSPHRASE',
    'CLOB_PASS_PHRASE'
  )

  if (!key && !secret && !passphrase) {
    return null
  }

  if (!key || !secret || !passphrase) {
    throw new Error(
      'Incomplete Polymarket API credentials. Set POLYMARKET_API_KEY, POLYMARKET_API_SECRET, and POLYMARKET_API_PASSPHRASE.'
    )
  }

  return { key, secret, passphrase }
}

export function createPolymarketPublicClient({
  host = POLYMARKET_HOST,
  throwOnError = true,
}: Pick<PolymarketClientConfig, 'host' | 'throwOnError'> = {}) {
  return new ClobClient({
    host,
    chain: Chain.POLYGON,
    throwOnError,
  })
}

export function createPolymarketL1Client({
  host = POLYMARKET_HOST,
  privateKey,
  useServerTime = true,
  throwOnError = true,
}: PolymarketClientConfig = {}) {
  return new ClobClient({
    host,
    chain: Chain.POLYGON,
    signer: createEthersV6ClobSigner(privateKey),
    useServerTime,
    throwOnError,
  })
}

export function createPolymarketAuthenticatedClient({
  creds = readPolymarketApiCredentialsFromEnv(),
  host = POLYMARKET_HOST,
  privateKey,
  useServerTime = true,
  throwOnError = true,
}: PolymarketAuthenticatedClientConfig = {}) {
  if (!creds) {
    throw new Error(
      'Missing Polymarket API credentials. Run createOrDerivePolymarketApiKey() once, then store key, secret, and passphrase in env.'
    )
  }

  return new ClobClient({
    host,
    chain: Chain.POLYGON,
    signer: createEthersV6ClobSigner(privateKey),
    creds,
    useServerTime,
    throwOnError,
  })
}

export async function createOrDerivePolymarketApiKey(nonce?: number, config?: PolymarketClientConfig) {
  return createPolymarketL1Client(config).createOrDeriveApiKey(nonce)
}

export async function getPolymarketMarkets(nextCursor?: string) {
  return createPolymarketPublicClient().getSimplifiedMarkets(nextCursor)
}

export async function getPolymarketSamplingMarkets(nextCursor?: string) {
  return createPolymarketPublicClient().getSamplingMarkets(nextCursor)
}

export async function getPolymarketMarket(conditionId: string) {
  return createPolymarketPublicClient().getMarket(conditionId)
}

export async function getPolymarketOrderBook(tokenId: string) {
  return createPolymarketPublicClient().getOrderBook(tokenId)
}

export async function getPolymarketPrice(tokenId: string, side: Side) {
  return createPolymarketPublicClient().getPrice(tokenId, side)
}

export async function getPolymarketSpread(tokenId: string) {
  return createPolymarketPublicClient().getSpread(tokenId)
}

export async function getPolymarketOpenOrders(params?: OpenOrderParams) {
  return createPolymarketAuthenticatedClient().getOpenOrders(params)
}

export async function getPolymarketTrades(params?: TradeParams) {
  return createPolymarketAuthenticatedClient().getTrades(params)
}

export async function postPolymarketLimitOrder({
  tokenId,
  price,
  side,
  size,
  tickSize = '0.01',
  orderType = OrderType.GTC,
  postOnly,
}: PolymarketLimitOrderInput) {
  return createPolymarketAuthenticatedClient().createAndPostOrder(
    {
      tokenID: tokenId,
      price,
      side,
      size,
    },
    { tickSize },
    orderType,
    postOnly
  )
}

export async function postPolymarketMarketOrder({
  tokenId,
  amount,
  side,
  price,
  tickSize = '0.01',
  orderType = OrderType.FOK,
}: PolymarketMarketOrderInput) {
  return createPolymarketAuthenticatedClient().createAndPostMarketOrder(
    {
      tokenID: tokenId,
      amount,
      side,
      price,
      orderType,
    },
    { tickSize },
    orderType
  )
}

export { Chain, OrderType, Side }
