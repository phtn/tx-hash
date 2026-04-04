'use client'

import { useConvexAuth, useQuery } from 'convex/react'

import { api } from '@/convex/_generated/api'

export function useCurrentConvexUser() {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth()
  const currentUser = useQuery(api.users.current)

  const isLoading =
    isAuthLoading || currentUser === undefined || (isAuthenticated && currentUser === null)

  return {
    currentUser: currentUser ?? null,
    isAuthenticated: isAuthenticated && currentUser !== null,
    isLoading,
  }
}
