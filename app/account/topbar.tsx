'use client'

import { Wallet } from '@/lib/appkit/wallet'
import { Icon } from '@/lib/icons'
import { useRouter } from 'next/navigation'

export const Topbar = () => {
  const router = useRouter()
  return (
    <header className='relative h-12 md:h-20 z-10 px-4 md:px-9 flex items-center justify-between dark:bg-[#17110f]/30'>
      <div className='h-9 flex items-center'>
        <Icon name='hot' className='text-accent size-5' onClick={() => router.push('/')} />
      </div>
      <div className='flex items-center'>
        <Wallet />
      </div>
    </header>
  )
}
