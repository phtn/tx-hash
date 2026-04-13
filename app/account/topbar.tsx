'use client'

import { Wallet } from '@/lib/appkit/wallet'
import { useRouter } from 'next/navigation'

export const Topbar = () => {
  const router = useRouter()
  return (
    <header className='relative z-10 flex items-center justify-between border-b border-black/8 bg-white/65 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/3 sm:px-6'>
      <button
        type='button'
        onClick={() => router.push('/')}
        className='flex items-center gap-3 text-left transition-transform duration-200 hover:-translate-y-0.5'>
        <span className='hidden sm:block'>
          {/*<span className='block font-mono text-[9px] uppercase tracking-[0.38em] text-[#7f7368] dark:text-white/38'>
            Account
          </span>*/}
          <span className='mt-1 block font-ct font-medium text-sm text-[#18120f] dark:text-white'>
            Trusted Workspace
          </span>
        </span>
      </button>
      <div className='flex items-center'>
        <Wallet />
      </div>
    </header>
  )
}
