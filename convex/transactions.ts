import { ConvexError, v } from 'convex/values'

import { mutation } from './_generated/server'
import { ensureCurrentUser } from './users'

export const createTransaction = mutation({
  args: {
    address: v.string(),
    amount: v.string(),
    contactId: v.optional(v.id('contacts')),
    network: v.string(),
    note: v.optional(v.string()),
    walletAddressId: v.optional(v.id('contact_wallet_addresses')),
  },
  returns: v.id('transactions'),
  handler: async (ctx, args) => {
    const currentUserId = await ensureCurrentUser(ctx)
    const address = args.address.trim()
    const amount = args.amount.trim()
    const network = args.network.trim()
    const note = args.note?.trim() || undefined

    if (!address) {
      throw new ConvexError('Address is required.')
    }

    if (!network) {
      throw new ConvexError('Network is required.')
    }

    if (!amount) {
      throw new ConvexError('Amount is required.')
    }

    if (args.contactId !== undefined) {
      const contact = await ctx.db.get(args.contactId)
      if (!contact || contact.userId !== currentUserId) {
        throw new ConvexError('Contact not found.')
      }
    }

    if (args.walletAddressId !== undefined) {
      const walletAddress = await ctx.db.get(args.walletAddressId)
      if (!walletAddress || walletAddress.userId !== currentUserId) {
        throw new ConvexError('Wallet address not found.')
      }

      if (args.contactId !== undefined && walletAddress.contactId !== args.contactId) {
        throw new ConvexError('Wallet address does not belong to the selected contact.')
      }

      if (walletAddress.address !== address) {
        throw new ConvexError('Address does not match the selected wallet address.')
      }
    }

    return await ctx.db.insert('transactions', {
      userId: currentUserId,
      network,
      address,
      amount,
      createdAt: Date.now(),
      ...(args.contactId !== undefined ? { contactId: args.contactId } : {}),
      ...(args.walletAddressId !== undefined ? { walletAddressId: args.walletAddressId } : {}),
      ...(note !== undefined ? { note } : {}),
    })
  },
})
