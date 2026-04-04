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
})
