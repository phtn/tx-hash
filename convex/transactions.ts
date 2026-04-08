import { ConvexError, v } from 'convex/values'

import { mutation } from './_generated/server'
import { ensureCurrentUser } from './users'

export const createTransaction = mutation({
  args: {
    contactId: v.id('contacts'),
    walletAddressId: v.id('contact_wallet_addresses'),
    network: v.string(),
    address: v.string(),
    amount: v.string(),
    note: v.optional(v.string()),
  },
  returns: v.id('transactions'),
  handler: async (ctx, args) => {
    const currentUserId = await ensureCurrentUser(ctx)

    const contact = await ctx.db.get(args.contactId)
    if (!contact || contact.userId !== currentUserId) {
      throw new ConvexError('Contact not found.')
    }

    const walletAddress = await ctx.db.get(args.walletAddressId)
    if (!walletAddress || walletAddress.userId !== currentUserId) {
      throw new ConvexError('Wallet address not found.')
    }

    const amount = args.amount.trim()
    if (!amount) {
      throw new ConvexError('Amount is required.')
    }

    const note = args.note?.trim() || undefined

    return await ctx.db.insert('transactions', {
      userId: currentUserId,
      contactId: args.contactId,
      walletAddressId: args.walletAddressId,
      network: args.network,
      address: args.address,
      amount,
      note,
      createdAt: Date.now(),
    })
  },
})
