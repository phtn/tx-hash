import { ConvexError, v } from 'convex/values'
import type { UserIdentity } from 'convex/server'

import type { Doc } from './_generated/dataModel'
import { mutation, query, type MutationCtx, type QueryCtx } from './_generated/server'

const userViewValidator = v.object({
  id: v.id('users'),
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
})

function trimOrNull(value: string | null | undefined) {
  if (value === undefined || value === null) {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function userToView(user: Doc<'users'>) {
  return {
    id: user._id,
    tokenIdentifier: user.tokenIdentifier,
    subject: user.subject,
    issuer: user.issuer,
    name: user.name,
    givenName: user.givenName,
    familyName: user.familyName,
    nickname: user.nickname,
    preferredUsername: user.preferredUsername,
    profileUrl: user.profileUrl,
    pictureUrl: user.pictureUrl,
    email: user.email,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

function identityToUserData(identity: UserIdentity, now: number) {
  return {
    tokenIdentifier: identity.tokenIdentifier,
    subject: identity.subject,
    issuer: identity.issuer,
    name: trimOrNull(identity.name),
    givenName: trimOrNull(identity.givenName),
    familyName: trimOrNull(identity.familyName),
    nickname: trimOrNull(identity.nickname),
    preferredUsername: trimOrNull(identity.preferredUsername),
    profileUrl: trimOrNull(identity.profileUrl),
    pictureUrl: trimOrNull(identity.pictureUrl),
    email: trimOrNull(identity.email),
    emailVerified: identity.emailVerified ?? null,
    createdAt: now,
    updatedAt: now,
  }
}

async function getCurrentIdentity(ctx: QueryCtx | MutationCtx) {
  return await ctx.auth.getUserIdentity()
}

async function getUserByTokenIdentifier(ctx: QueryCtx | MutationCtx, tokenIdentifier: string) {
  return await ctx.db
    .query('users')
    .withIndex('by_tokenIdentifier', (q) => q.eq('tokenIdentifier', tokenIdentifier))
    .unique()
}

async function upsertCurrentUser(ctx: MutationCtx) {
  const identity = await getCurrentIdentity(ctx)
  if (!identity) {
    throw new ConvexError('Unauthenticated.')
  }

  const existingUser = await getUserByTokenIdentifier(ctx, identity.tokenIdentifier)
  const now = Date.now()
  const userData = identityToUserData(identity, now)

  if (existingUser) {
    await ctx.db.patch(existingUser._id, {
      ...userData,
      createdAt: existingUser.createdAt,
    })
    return existingUser._id
  }

  return await ctx.db.insert('users', userData)
}

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await getCurrentIdentity(ctx)
  if (!identity) {
    return null
  }

  return await getUserByTokenIdentifier(ctx, identity.tokenIdentifier)
}

export const current = query({
  args: {},
  returns: v.union(v.null(), userViewValidator),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx)
    return user ? userToView(user) : null
  },
})

export const syncCurrentUser = mutation({
  args: {},
  returns: v.id('users'),
  handler: async (ctx) => {
    return await upsertCurrentUser(ctx)
  },
})

export async function requireCurrentUser(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx)
  if (!user) {
    throw new ConvexError('Authenticated user has not been synced yet.')
  }

  return user
}

export async function ensureCurrentUser(ctx: MutationCtx) {
  return await upsertCurrentUser(ctx)
}

export { userViewValidator }
