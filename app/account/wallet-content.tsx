'use client'

import { AccountBalance } from './account-balance'
import { AccountProfile } from './account-content'

export const WalletContent = ({ profile }: { profile: AccountProfile }) => {
  return (
    <section className='w-full space-y-0'>
      <div className=''>
        <AccountBalance />
      </div>
    </section>
  )
}
