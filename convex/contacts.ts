import { ConvexError, v } from 'convex/values'

import type { Doc } from './_generated/dataModel'
import { mutation, query, type MutationCtx, type QueryCtx } from './_generated/server'
import { ensureCurrentUser, getCurrentUser } from './users'

const walletAddressViewValidator = v.object({
  id: v.id('contact_wallet_addresses'),
  contactId: v.id('contacts'),
  network: v.string(),
  label: v.union(v.string(), v.null()),
  address: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
})

const contactViewValidator = v.object({
  id: v.id('contacts'),
  name: v.string(),
  email: v.union(v.string(), v.null()),
  notes: v.union(v.string(), v.null()),
  createdAt: v.number(),
  updatedAt: v.number(),
  walletAddresses: v.array(walletAddressViewValidator),
})

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

function contactToView(contact: Doc<'contacts'>, walletAddresses: Doc<'contact_wallet_addresses'>[]) {
  return {
    id: contact._id,
    name: contact.name,
    email: contact.email,
    notes: contact.notes,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
    walletAddresses: walletAddresses
      .slice()
      .sort((left, right) => {
        const networkCompare = left.network.localeCompare(right.network, undefined, {
          sensitivity: 'base',
        })

        if (networkCompare !== 0) {
          return networkCompare
        }

        return right.createdAt - left.createdAt
      })
      .map((walletAddress) => ({
        id: walletAddress._id,
        contactId: walletAddress.contactId,
        network: walletAddress.network,
        label: walletAddress.label,
        address: walletAddress.address,
        createdAt: walletAddress.createdAt,
        updatedAt: walletAddress.updatedAt,
      })),
  }
}

async function getIdentity(ctx: QueryCtx | MutationCtx) {
  return await ctx.auth.getUserIdentity()
}

async function requireOwnedContact(ctx: MutationCtx, contactId: Doc<'contacts'>['_id']) {
  const currentUserId = await ensureCurrentUser(ctx)
  const contact = await ctx.db.get(contactId)

  if (!contact || contact.userId !== currentUserId) {
    throw new ConvexError('Contact not found.')
  }

  return contact
}

async function requireOwnedWalletAddress(
  ctx: MutationCtx,
  walletAddressId: Doc<'contact_wallet_addresses'>['_id'],
) {
  const currentUserId = await ensureCurrentUser(ctx)
  const walletAddress = await ctx.db.get(walletAddressId)

  if (!walletAddress || walletAddress.userId !== currentUserId) {
    throw new ConvexError('Wallet address not found.')
  }

  return walletAddress
}

export const list = query({
  args: {},
  returns: v.array(contactViewValidator),
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx)
    if (!currentUser) {
      return []
    }

    const contacts = await ctx.db
      .query('contacts')
      .withIndex('by_userId', (q) => q.eq('userId', currentUser._id))
      .collect()

    const walletAddresses = await ctx.db
      .query('contact_wallet_addresses')
      .withIndex('by_userId', (q) => q.eq('userId', currentUser._id))
      .collect()

    const walletAddressesByContactId = new Map<Doc<'contacts'>['_id'], Doc<'contact_wallet_addresses'>[]>()

    for (const walletAddress of walletAddresses) {
      const currentWalletAddresses = walletAddressesByContactId.get(walletAddress.contactId)
      if (currentWalletAddresses) {
        currentWalletAddresses.push(walletAddress)
      } else {
        walletAddressesByContactId.set(walletAddress.contactId, [walletAddress])
      }
    }

    return contacts
      .slice()
      .sort((left, right) => {
        const nameCompare = left.name.localeCompare(right.name, undefined, {
          sensitivity: 'base',
        })

        if (nameCompare !== 0) {
          return nameCompare
        }

        return right.createdAt - left.createdAt
      })
      .map((contact) => contactToView(contact, walletAddressesByContactId.get(contact._id) ?? []))
  },
})

export const createContact = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.union(v.string(), v.null())),
    notes: v.optional(v.union(v.string(), v.null())),
  },
  returns: v.id('contacts'),
  handler: async (ctx, args) => {
    const currentUserId = await ensureCurrentUser(ctx)
    const now = Date.now()
    const name = trimRequired(args.name, 'Contact name')

    return await ctx.db.insert('contacts', {
      userId: currentUserId,
      name,
      email: trimOptional(args.email) ?? null,
      notes: trimOptional(args.notes) ?? null,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const updateContact = mutation({
  args: {
    contactId: v.id('contacts'),
    name: v.string(),
    email: v.optional(v.union(v.string(), v.null())),
    notes: v.optional(v.union(v.string(), v.null())),
  },
  returns: v.id('contacts'),
  handler: async (ctx, args) => {
    const contact = await requireOwnedContact(ctx, args.contactId)
    const now = Date.now()
    const patch: Partial<Pick<Doc<'contacts'>, 'name' | 'email' | 'notes' | 'updatedAt'>> = {
      name: trimRequired(args.name, 'Contact name'),
      updatedAt: now,
    }

    if (args.email !== undefined) {
      patch.email = trimOptional(args.email) ?? null
    }

    if (args.notes !== undefined) {
      patch.notes = trimOptional(args.notes) ?? null
    }

    await ctx.db.patch(contact._id, patch)
    return contact._id
  },
})

export const deleteContact = mutation({
  args: {
    contactId: v.id('contacts'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const contact = await requireOwnedContact(ctx, args.contactId)

    const walletAddresses = await ctx.db
      .query('contact_wallet_addresses')
      .withIndex('by_contactId', (q) => q.eq('contactId', contact._id))
      .collect()

    for (const walletAddress of walletAddresses) {
      await ctx.db.delete(walletAddress._id)
    }

    await ctx.db.delete(contact._id)
    return null
  },
})

export const addWalletAddress = mutation({
  args: {
    contactId: v.id('contacts'),
    network: v.string(),
    address: v.string(),
    label: v.optional(v.union(v.string(), v.null())),
  },
  returns: v.id('contact_wallet_addresses'),
  handler: async (ctx, args) => {
    const contact = await requireOwnedContact(ctx, args.contactId)
    const now = Date.now()

    return await ctx.db.insert('contact_wallet_addresses', {
      userId: contact.userId,
      contactId: contact._id,
      network: trimRequired(args.network, 'Network'),
      address: trimRequired(args.address, 'Wallet address'),
      label: trimOptional(args.label) ?? null,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const updateWalletAddress = mutation({
  args: {
    walletAddressId: v.id('contact_wallet_addresses'),
    network: v.string(),
    address: v.string(),
    label: v.optional(v.union(v.string(), v.null())),
  },
  returns: v.id('contact_wallet_addresses'),
  handler: async (ctx, args) => {
    const walletAddress = await requireOwnedWalletAddress(ctx, args.walletAddressId)
    const now = Date.now()
    const patch: Partial<
      Pick<Doc<'contact_wallet_addresses'>, 'network' | 'address' | 'label' | 'updatedAt'>
    > = {
      network: trimRequired(args.network, 'Network'),
      address: trimRequired(args.address, 'Wallet address'),
      updatedAt: now,
    }

    if (args.label !== undefined) {
      patch.label = trimOptional(args.label) ?? null
    }

    await ctx.db.patch(walletAddress._id, patch)
    return walletAddress._id
  },
})

export const deleteWalletAddress = mutation({
  args: {
    walletAddressId: v.id('contact_wallet_addresses'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const walletAddress = await requireOwnedWalletAddress(ctx, args.walletAddressId)
    await ctx.db.delete(walletAddress._id)
    return null
  },
})

export { contactViewValidator, walletAddressViewValidator }
