import { ConvexError, v } from 'convex/values'

import type { Doc } from './_generated/dataModel'
import { mutation, query, type MutationCtx } from './_generated/server'
import { ensureCurrentUser, getCurrentUser } from './users'

const chainNamespaceValidator = v.union(v.literal('eip155'), v.literal('bip122'), v.literal('solana'), v.literal('other'))
const walletTypeValidator = v.union(
  v.literal('self_custody'),
  v.literal('hardware'),
  v.literal('exchange'),
  v.literal('custodial'),
  v.literal('smart_contract'),
  v.literal('watch_only'),
)
const addressTypeValidator = v.union(
  v.literal('personal'),
  v.literal('deposit'),
  v.literal('withdrawal'),
  v.literal('multisig'),
  v.literal('contract'),
  v.literal('unknown'),
)
const sourceValidator = v.union(v.literal('manual'), v.literal('wallet_connect'), v.literal('imported'), v.literal('system'))
const assetTypeValidator = v.union(v.literal('native'), v.literal('erc20'), v.literal('spl'), v.literal('brc20'), v.literal('other'))

const walletAssetInputValidator = v.object({
  assetKey: v.string(),
  symbol: v.string(),
  name: v.string(),
  assetType: assetTypeValidator,
  contractAddress: v.optional(v.union(v.string(), v.null())),
  decimals: v.optional(v.union(v.number(), v.null())),
  cmcId: v.optional(v.union(v.number(), v.null())),
  enabled: v.optional(v.boolean()),
  sortOrder: v.optional(v.number()),
})

const walletAssetViewValidator = v.object({
  assetKey: v.string(),
  symbol: v.string(),
  name: v.string(),
  assetType: assetTypeValidator,
  contractAddress: v.union(v.string(), v.null()),
  decimals: v.union(v.number(), v.null()),
  cmcId: v.union(v.number(), v.null()),
  enabled: v.boolean(),
  sortOrder: v.number(),
})

const walletViewValidator = v.object({
  id: v.id('user_crypto_wallets'),
  userId: v.id('users'),
  walletName: v.string(),
  description: v.union(v.string(), v.null()),
  tags: v.array(v.string()),
  address: v.string(),
  normalizedAddress: v.string(),
  chainNamespace: chainNamespaceValidator,
  networkKey: v.string(),
  networkName: v.string(),
  chainId: v.union(v.number(), v.null()),
  caipNetworkId: v.union(v.string(), v.null()),
  walletType: walletTypeValidator,
  addressType: addressTypeValidator,
  provider: v.union(v.string(), v.null()),
  source: sourceValidator,
  assets: v.array(walletAssetViewValidator),
  isPrimary: v.boolean(),
  isArchived: v.boolean(),
  isVerified: v.boolean(),
  verifiedAt: v.union(v.number(), v.null()),
  createdAt: v.number(),
  updatedAt: v.number(),
})

type ChainNamespace = 'bip122' | 'eip155' | 'other' | 'solana'
type WalletAssetInput = {
  assetKey: string
  symbol: string
  name: string
  assetType: 'brc20' | 'erc20' | 'native' | 'other' | 'spl'
  contractAddress?: string | null
  decimals?: number | null
  cmcId?: number | null
  enabled?: boolean
  sortOrder?: number
}

function trimRequired(value: string, label: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    throw new ConvexError(`${label} is required.`)
  }

  return trimmed
}

function trimOptional(value: string | null | undefined) {
  if (value === undefined || value === null) {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeKey(value: string, label: string) {
  return trimRequired(value, label).toLowerCase()
}

function normalizeAddress(address: string, chainNamespace: ChainNamespace) {
  const trimmedAddress = trimRequired(address, 'Wallet address')

  if (chainNamespace === 'eip155') {
    return trimmedAddress.toLowerCase()
  }

  return trimmedAddress
}

function normalizeTags(tags: string[] | undefined) {
  if (!tags) return []

  const normalizedTags: string[] = []
  const seenTags = new Set<string>()

  for (const tag of tags) {
    const normalizedTag = tag.trim().toLowerCase()
    if (!normalizedTag || seenTags.has(normalizedTag)) continue

    normalizedTags.push(normalizedTag)
    seenTags.add(normalizedTag)
  }

  return normalizedTags
}

function normalizeAssets(assets: WalletAssetInput[] | undefined) {
  if (!assets) return []

  const normalizedAssets = []
  const seenAssetKeys = new Set<string>()

  for (const [index, asset] of assets.entries()) {
    const assetKey = normalizeKey(asset.assetKey, 'Asset key')
    if (seenAssetKeys.has(assetKey)) {
      throw new ConvexError(`Duplicate asset "${assetKey}".`)
    }

    seenAssetKeys.add(assetKey)
    normalizedAssets.push({
      assetKey,
      symbol: trimRequired(asset.symbol, 'Asset symbol').toUpperCase(),
      name: trimRequired(asset.name, 'Asset name'),
      assetType: asset.assetType,
      contractAddress: trimOptional(asset.contractAddress) ?? null,
      decimals: asset.decimals ?? null,
      cmcId: asset.cmcId ?? null,
      enabled: asset.enabled ?? true,
      sortOrder: asset.sortOrder ?? index,
    })
  }

  return normalizedAssets.sort((left, right) => left.sortOrder - right.sortOrder)
}

function normalizeChainId(chainNamespace: ChainNamespace, chainId: number | null | undefined) {
  if (chainNamespace === 'eip155' && chainId == null) {
    throw new ConvexError('Chain ID is required for EVM wallets.')
  }

  return chainId ?? null
}

function walletToView(wallet: Doc<'user_crypto_wallets'>) {
  return {
    id: wallet._id,
    userId: wallet.userId,
    walletName: wallet.walletName,
    description: wallet.description,
    tags: wallet.tags,
    address: wallet.address,
    normalizedAddress: wallet.normalizedAddress,
    chainNamespace: wallet.chainNamespace,
    networkKey: wallet.networkKey,
    networkName: wallet.networkName,
    chainId: wallet.chainId,
    caipNetworkId: wallet.caipNetworkId,
    walletType: wallet.walletType,
    addressType: wallet.addressType,
    provider: wallet.provider,
    source: wallet.source,
    assets: wallet.assets,
    isPrimary: wallet.isPrimary,
    isArchived: wallet.isArchived,
    isVerified: wallet.isVerified,
    verifiedAt: wallet.verifiedAt,
    createdAt: wallet.createdAt,
    updatedAt: wallet.updatedAt,
  }
}

async function findDuplicateWallet(
  ctx: MutationCtx,
  userId: Doc<'users'>['_id'],
  networkKey: string,
  normalizedAddress: string,
) {
  return await ctx.db
    .query('user_crypto_wallets')
    .withIndex('by_user_network_address', (q) =>
      q.eq('userId', userId).eq('networkKey', networkKey).eq('normalizedAddress', normalizedAddress),
    )
    .first()
}

async function unsetPrimaryWallets(
  ctx: MutationCtx,
  userId: Doc<'users'>['_id'],
  networkKey: string,
  exceptWalletId?: Doc<'user_crypto_wallets'>['_id'],
) {
  const primaryWallets = await ctx.db
    .query('user_crypto_wallets')
    .withIndex('by_user_primary_network', (q) =>
      q.eq('userId', userId).eq('networkKey', networkKey).eq('isPrimary', true),
    )
    .collect()

  for (const wallet of primaryWallets) {
    if (wallet._id === exceptWalletId) continue
    await ctx.db.patch(wallet._id, {
      isPrimary: false,
      updatedAt: Date.now(),
    })
  }
}

async function requireOwnedWallet(ctx: MutationCtx, walletId: Doc<'user_crypto_wallets'>['_id']) {
  const currentUserId = await ensureCurrentUser(ctx)
  const wallet = await ctx.db.get(walletId)

  if (!wallet || wallet.userId !== currentUserId) {
    throw new ConvexError('Wallet not found.')
  }

  return wallet
}

export const list = query({
  args: {
    includeArchived: v.optional(v.boolean()),
    networkKey: v.optional(v.string()),
  },
  returns: v.array(walletViewValidator),
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx)
    if (!currentUser) {
      return []
    }

    let wallets: Doc<'user_crypto_wallets'>[]

    if (args.networkKey) {
      const networkKey = normalizeKey(args.networkKey, 'Network')
      wallets = await ctx.db
        .query('user_crypto_wallets')
        .withIndex('by_user_network', (q) => q.eq('userId', currentUser._id).eq('networkKey', networkKey))
        .collect()
    } else {
      wallets = await ctx.db
        .query('user_crypto_wallets')
        .withIndex('by_userId', (q) => q.eq('userId', currentUser._id))
        .collect()
    }

    return wallets
      .filter((wallet) => args.includeArchived || !wallet.isArchived)
      .slice()
      .sort((left, right) => {
        if (left.isPrimary !== right.isPrimary) {
          return left.isPrimary ? -1 : 1
        }

        const nameCompare = left.walletName.localeCompare(right.walletName, undefined, {
          sensitivity: 'base',
        })

        if (nameCompare !== 0) {
          return nameCompare
        }

        return right.createdAt - left.createdAt
      })
      .map(walletToView)
  },
})

export const get = query({
  args: {
    walletId: v.id('user_crypto_wallets'),
  },
  returns: v.union(v.null(), walletViewValidator),
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx)
    if (!currentUser) {
      return null
    }

    const wallet = await ctx.db.get(args.walletId)
    if (!wallet || wallet.userId !== currentUser._id) {
      return null
    }

    return walletToView(wallet)
  },
})

export const createWallet = mutation({
  args: {
    walletName: v.string(),
    description: v.optional(v.union(v.string(), v.null())),
    tags: v.optional(v.array(v.string())),
    address: v.string(),
    chainNamespace: chainNamespaceValidator,
    networkKey: v.string(),
    networkName: v.string(),
    chainId: v.optional(v.union(v.number(), v.null())),
    caipNetworkId: v.optional(v.union(v.string(), v.null())),
    walletType: walletTypeValidator,
    addressType: addressTypeValidator,
    provider: v.optional(v.union(v.string(), v.null())),
    source: v.optional(sourceValidator),
    assets: v.optional(v.array(walletAssetInputValidator)),
    isPrimary: v.optional(v.boolean()),
    isArchived: v.optional(v.boolean()),
    isVerified: v.optional(v.boolean()),
    verifiedAt: v.optional(v.union(v.number(), v.null())),
  },
  returns: v.id('user_crypto_wallets'),
  handler: async (ctx, args) => {
    const currentUserId = await ensureCurrentUser(ctx)
    const now = Date.now()
    const walletName = trimRequired(args.walletName, 'Wallet name')
    const networkKey = normalizeKey(args.networkKey, 'Network')
    const address = trimRequired(args.address, 'Wallet address')
    const normalizedAddress = normalizeAddress(address, args.chainNamespace)
    const chainId = normalizeChainId(args.chainNamespace, args.chainId)
    const isPrimary = args.isPrimary ?? false
    const isVerified = args.isVerified ?? false

    const duplicateWallet = await findDuplicateWallet(ctx, currentUserId, networkKey, normalizedAddress)
    if (duplicateWallet) {
      throw new ConvexError('This wallet address is already saved for this network.')
    }

    if (isPrimary) {
      await unsetPrimaryWallets(ctx, currentUserId, networkKey)
    }

    return await ctx.db.insert('user_crypto_wallets', {
      userId: currentUserId,
      walletName,
      description: trimOptional(args.description) ?? null,
      tags: normalizeTags(args.tags),
      address,
      normalizedAddress,
      chainNamespace: args.chainNamespace,
      networkKey,
      networkName: trimRequired(args.networkName, 'Network name'),
      chainId,
      caipNetworkId: trimOptional(args.caipNetworkId) ?? null,
      walletType: args.walletType,
      addressType: args.addressType,
      provider: trimOptional(args.provider) ?? null,
      source: args.source ?? 'manual',
      assets: normalizeAssets(args.assets),
      isPrimary,
      isArchived: args.isArchived ?? false,
      isVerified,
      verifiedAt: isVerified ? (args.verifiedAt ?? now) : null,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const updateWallet = mutation({
  args: {
    walletId: v.id('user_crypto_wallets'),
    walletName: v.optional(v.string()),
    description: v.optional(v.union(v.string(), v.null())),
    tags: v.optional(v.array(v.string())),
    address: v.optional(v.string()),
    chainNamespace: v.optional(chainNamespaceValidator),
    networkKey: v.optional(v.string()),
    networkName: v.optional(v.string()),
    chainId: v.optional(v.union(v.number(), v.null())),
    caipNetworkId: v.optional(v.union(v.string(), v.null())),
    walletType: v.optional(walletTypeValidator),
    addressType: v.optional(addressTypeValidator),
    provider: v.optional(v.union(v.string(), v.null())),
    source: v.optional(sourceValidator),
    assets: v.optional(v.array(walletAssetInputValidator)),
    isPrimary: v.optional(v.boolean()),
    isArchived: v.optional(v.boolean()),
    isVerified: v.optional(v.boolean()),
    verifiedAt: v.optional(v.union(v.number(), v.null())),
  },
  returns: v.id('user_crypto_wallets'),
  handler: async (ctx, args) => {
    const wallet = await requireOwnedWallet(ctx, args.walletId)
    const now = Date.now()
    const nextChainNamespace = args.chainNamespace ?? wallet.chainNamespace
    const nextNetworkKey = args.networkKey ? normalizeKey(args.networkKey, 'Network') : wallet.networkKey
    const nextAddress = args.address ? trimRequired(args.address, 'Wallet address') : wallet.address
    const nextNormalizedAddress = normalizeAddress(nextAddress, nextChainNamespace)
    const identityChanged = nextNetworkKey !== wallet.networkKey || nextNormalizedAddress !== wallet.normalizedAddress

    if (identityChanged) {
      const duplicateWallet = await findDuplicateWallet(ctx, wallet.userId, nextNetworkKey, nextNormalizedAddress)
      if (duplicateWallet && duplicateWallet._id !== wallet._id) {
        throw new ConvexError('This wallet address is already saved for this network.')
      }
    }

    const nextIsPrimary = args.isPrimary ?? wallet.isPrimary
    if (nextIsPrimary && (args.isPrimary || nextNetworkKey !== wallet.networkKey)) {
      await unsetPrimaryWallets(ctx, wallet.userId, nextNetworkKey, wallet._id)
    }

    const nextIsVerified = args.isVerified ?? wallet.isVerified
    const patch: Partial<
      Pick<
        Doc<'user_crypto_wallets'>,
        | 'walletName'
        | 'description'
        | 'tags'
        | 'address'
        | 'normalizedAddress'
        | 'chainNamespace'
        | 'networkKey'
        | 'networkName'
        | 'chainId'
        | 'caipNetworkId'
        | 'walletType'
        | 'addressType'
        | 'provider'
        | 'source'
        | 'assets'
        | 'isPrimary'
        | 'isArchived'
        | 'isVerified'
        | 'verifiedAt'
        | 'updatedAt'
      >
    > = {
      chainId: normalizeChainId(nextChainNamespace, args.chainId !== undefined ? args.chainId : wallet.chainId),
      chainNamespace: nextChainNamespace,
      address: nextAddress,
      normalizedAddress: nextNormalizedAddress,
      networkKey: nextNetworkKey,
      isPrimary: nextIsPrimary,
      isVerified: nextIsVerified,
      verifiedAt: nextIsVerified ? (args.verifiedAt ?? wallet.verifiedAt ?? now) : null,
      updatedAt: now,
    }

    if (args.walletName !== undefined) {
      patch.walletName = trimRequired(args.walletName, 'Wallet name')
    }

    if (args.description !== undefined) {
      patch.description = trimOptional(args.description) ?? null
    }

    if (args.tags !== undefined) {
      patch.tags = normalizeTags(args.tags)
    }

    if (args.networkName !== undefined) {
      patch.networkName = trimRequired(args.networkName, 'Network name')
    }

    if (args.caipNetworkId !== undefined) {
      patch.caipNetworkId = trimOptional(args.caipNetworkId) ?? null
    }

    if (args.walletType !== undefined) {
      patch.walletType = args.walletType
    }

    if (args.addressType !== undefined) {
      patch.addressType = args.addressType
    }

    if (args.provider !== undefined) {
      patch.provider = trimOptional(args.provider) ?? null
    }

    if (args.source !== undefined) {
      patch.source = args.source
    }

    if (args.assets !== undefined) {
      patch.assets = normalizeAssets(args.assets)
    }

    if (args.isArchived !== undefined) {
      patch.isArchived = args.isArchived
    }

    await ctx.db.patch(wallet._id, patch)
    return wallet._id
  },
})

export const setPrimaryWallet = mutation({
  args: {
    walletId: v.id('user_crypto_wallets'),
  },
  returns: v.id('user_crypto_wallets'),
  handler: async (ctx, args) => {
    const wallet = await requireOwnedWallet(ctx, args.walletId)
    await unsetPrimaryWallets(ctx, wallet.userId, wallet.networkKey, wallet._id)

    await ctx.db.patch(wallet._id, {
      isPrimary: true,
      updatedAt: Date.now(),
    })

    return wallet._id
  },
})

export const deleteWallet = mutation({
  args: {
    walletId: v.id('user_crypto_wallets'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const wallet = await requireOwnedWallet(ctx, args.walletId)
    await ctx.db.delete(wallet._id)
    return null
  },
})

export { walletAssetInputValidator, walletAssetViewValidator, walletViewValidator }
