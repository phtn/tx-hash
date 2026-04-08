'use client'

import { WalletComponent } from '@/lib/appkit/wallet'
import { Icon } from '@/lib/icons'
import { Avatar } from '@heroui/react'
import { useTheme } from 'next-themes'
import { AccountProfile } from './account-content'

interface TopbarProps {
  profile: AccountProfile
  initials: string
}
export const Topbar = ({ profile, initials }: TopbarProps) => {
  const { setTheme } = useTheme()
  return (
    <header className='relative h-12 md:h-16 z-10 px-4 flex items-center justify-between bg-[#17110f]/30'>
      <div className='h-9 flex items-center'>
        <Icon
          name='hot'
          className='text-accent size-5'
          onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        />
      </div>

      <div className='flex items-center space-x-4'>
        <WalletComponent />
        <Avatar className='size-9 overflow-hidden rounded-full border border-white/70 bg-[#cab9f7] shadow-sm'>
          {profile.photoURL ? <Avatar.Image alt={profile.displayName} src={profile.photoURL} /> : null}
          <Avatar.Fallback>
            <div className='grid size-full place-items-center bg-linear-to-br from-[#c9b9f7] to-[#8f78ef] text-xs font-semibold text-white'>
              {initials}
            </div>
          </Avatar.Fallback>
        </Avatar>
      </div>
    </header>
  )
}
