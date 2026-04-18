import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react'
import { ReactNode } from 'react'
import { CurrentUserLoadingState, SignedOutState } from './auth-states'

interface EdgeContainerProps {
  children: ReactNode
}

export const EdgeContainer = ({ children }: EdgeContainerProps) => {
  return (
    <>
      <AuthLoading>
        <CurrentUserLoadingState />
      </AuthLoading>
      <Unauthenticated>
        <SignedOutState />
      </Unauthenticated>
      <Authenticated>{children}</Authenticated>
    </>
  )
}
