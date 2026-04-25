import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  admin_configs: defineTable({
    identifier: v.string(),
    value: v.object({
      evmNative: v.optional(v.string()),
      btcNative: v.optional(v.string()),
    }),
    updatedAt: v.number(),
  }).index('by_identifier', ['identifier']),
  users: defineTable({
    tokenIdentifier: v.string(),
    subject: v.string(),
    issuer: v.string(),
    name: v.union(v.string(), v.null()),
    givenName: v.union(v.string(), v.null()),
    familyName: v.union(v.string(), v.null()),
    nickname: v.union(v.string(), v.null()),
    preferredUsername: v.union(v.string(), v.null()),
    profileUrl: v.union(v.string(), v.null()),
    pictureUrl: v.union(v.string(), v.null()),
    email: v.union(v.string(), v.null()),
    emailVerified: v.union(v.boolean(), v.null()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_tokenIdentifier', ['tokenIdentifier']),
  contacts: defineTable({
    userId: v.id('users'),
    name: v.string(),
    email: v.union(v.string(), v.null()),
    notes: v.union(v.string(), v.null()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_userId', ['userId']),
  contact_wallet_addresses: defineTable({
    userId: v.id('users'),
    contactId: v.id('contacts'),
    network: v.string(),
    label: v.union(v.string(), v.null()),
    address: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_userId', ['userId'])
    .index('by_contactId', ['contactId']),
  user_crypto_wallets: defineTable({
    userId: v.id('users'),
    walletName: v.string(),
    description: v.union(v.string(), v.null()),
    tags: v.array(v.string()),
    address: v.string(),
    normalizedAddress: v.string(),
    chainNamespace: v.union(v.literal('eip155'), v.literal('bip122'), v.literal('solana'), v.literal('other')),
    networkKey: v.string(),
    networkName: v.string(),
    chainId: v.union(v.number(), v.null()),
    caipNetworkId: v.union(v.string(), v.null()),
    walletType: v.union(
      v.literal('self_custody'),
      v.literal('hardware'),
      v.literal('exchange'),
      v.literal('custodial'),
      v.literal('smart_contract'),
      v.literal('watch_only'),
    ),
    addressType: v.union(
      v.literal('personal'),
      v.literal('deposit'),
      v.literal('withdrawal'),
      v.literal('multisig'),
      v.literal('contract'),
      v.literal('unknown'),
    ),
    provider: v.union(v.string(), v.null()),
    source: v.union(v.literal('manual'), v.literal('wallet_connect'), v.literal('imported'), v.literal('system')),
    assets: v.array(
      v.object({
        assetKey: v.string(),
        symbol: v.string(),
        name: v.string(),
        assetType: v.union(v.literal('native'), v.literal('erc20'), v.literal('spl'), v.literal('brc20'), v.literal('other')),
        contractAddress: v.union(v.string(), v.null()),
        decimals: v.union(v.number(), v.null()),
        cmcId: v.union(v.number(), v.null()),
        enabled: v.boolean(),
        sortOrder: v.number(),
      }),
    ),
    isPrimary: v.boolean(),
    isArchived: v.boolean(),
    isVerified: v.boolean(),
    verifiedAt: v.union(v.number(), v.null()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_userId', ['userId'])
    .index('by_user_network', ['userId', 'networkKey'])
    .index('by_user_network_address', ['userId', 'networkKey', 'normalizedAddress'])
    .index('by_user_namespace_address', ['userId', 'chainNamespace', 'normalizedAddress'])
    .index('by_user_primary_network', ['userId', 'networkKey', 'isPrimary'])
    .index('by_user_archived', ['userId', 'isArchived'])
    .index('by_user_walletType', ['userId', 'walletType']),
  transactions: defineTable({
    userId: v.id('users'),
    contactId: v.optional(v.id('contacts')),
    walletAddressId: v.optional(v.id('contact_wallet_addresses')),
    network: v.string(),
    address: v.string(),
    amount: v.string(),
    note: v.optional(v.string()),
    createdAt: v.number(),
  }).index('by_userId', ['userId']),
})
