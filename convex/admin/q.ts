import { v } from 'convex/values'
import { query } from '../_generated/server'

export const getAdminByIdentifier = query({
  args: {
    identifier: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('admin_configs')
      .withIndex('by_identifier', (q) => q.eq('identifier', args.identifier))
      .first()
  },
})
