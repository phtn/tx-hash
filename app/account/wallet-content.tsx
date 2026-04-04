import { Icon, IconName } from '@/lib/icons'
import { getInitials } from '@/lib/utils'
import { Avatar, Card } from '@heroui/react'
import { Bell, Bitcoin, Compass, CreditCard, Heart, Home, WalletCards } from 'lucide-react'
import { AccountBalance } from './account-balance'
import { AccountProfile } from './account-content'
import { ActionTabs } from './action-tabs'

export const WalletContent = ({ profile }: { profile: AccountProfile }) => {
  const firstName = profile.displayName.split(' ')[0] || profile.displayName
  const initials = getInitials(profile.displayName, profile.email)

  return (
    <section className='w-full space-y-0'>
      <div className='grid gap-6 lg:grid-cols-2'>
        <Card className='relative h-[calc(100lvh-27px)] overflow-hidden border-0 shadow-none p-4 md:p-6 _shadow-[0_30px_90px_rgba(63,42,20,0.15)]'>
          <header className='relative z-10 flex items-center justify-between'>
            <div>
              <Avatar className='size-9 overflow-hidden rounded-full border border-white/70 bg-[#cab9f7] shadow-sm'>
                {profile.photoURL ? <Avatar.Image alt={profile.displayName} src={profile.photoURL} /> : null}
                <Avatar.Fallback>
                  <div className='grid size-full place-items-center bg-linear-to-br from-[#c9b9f7] to-[#8f78ef] text-xs font-semibold text-white'>
                    {initials}
                  </div>
                </Avatar.Fallback>
              </Avatar>
            </div>

            <div className='flex items-center gap-2'>
              <div className='relative grid size-10 place-items-center text-[#25211d]'>
                <Bell className='size-5' strokeWidth={2} />
                <span className='absolute right-0.5 top-0.5 size-2.5 rounded-full bg-[#ff4f8a] ring-2 ring-[#f5efe6]' />
              </div>

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

          <div className='absolute right-1.5 md:right-3.5 top-20 md:top-23 h-34 w-12 rounded-[16px] bg-pnk pointer-events-none' />
          <AccountBalance />
          <ActionTabs />

          <div className='hidden relative z-10 mt-0 _grid grid-cols-4 gap-3 sm:gap-4 w-full'>
            {[].map((action: { label: string; icon: string; tone: string; iconTone: string }) => {
              return (
                <button
                  key={action.label}
                  type='button'
                  className={`flex min-h-[50.01px] px-4 flex-col items-center justify-center gap-1 rounded-[10px] w-full ${action.tone}`}>
                  <span className={`grid size-8 place-items-center ${action.iconTone}`}>
                    <Icon name={action.icon as IconName} className='size-7' strokeWidth={2} />
                  </span>
                  <span className='hidden sm:flex text-[0.78rem] font-okx font-normal tracking-[-0.02em]'>
                    {action.label}
                  </span>
                </button>
              )
            })}
          </div>

          <div className='hidden relative h-full z-10 mt-7 space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-[1.05rem] font-semibold tracking-[-0.03em]'>Transaction</h3>
            </div>

            <div className='space-y-3'>
              {[
                { name: 'Matteo', symbol: '€100', delta: '-0.04%', icon: WalletCards },
                { name: 'Biction', symbol: '$300', delta: '-0.04%', icon: Bitcoin },
                { name: 'Solana', symbol: '$900', delta: '-0.04%', icon: CreditCard }
              ].map((item) => {
                const ItemIcon = item.icon

                return (
                  <div key={item.name} className='flex items-center justify-between gap-4'>
                    <div className='flex items-center gap-3'>
                      <div className='grid size-11 place-items-center rounded-[14px] bg-[#17110f] text-white shadow-[0_12px_24px_rgba(24,18,15,0.18)]'>
                        <ItemIcon className='size-5' strokeWidth={2.1} />
                      </div>

                      <div>
                        <p className='text-sm font-medium tracking-[-0.02em]'>{item.name}</p>
                        <p className='text-xs text-[#8a7d71]'>Aug 25, 2022</p>
                      </div>
                    </div>

                    <div className='text-right'>
                      <p className='text-sm font-semibold tracking-[-0.02em]'>{item.symbol}</p>
                      <p className='text-xs text-[#8a7d71]'>{item.delta}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        <Card className='hidden relative overflow-hidden rounded-[38px] bg-[#f6f2eb] p-6 shadow-[0_30px_90px_rgba(63,42,20,0.15)] ring-1 ring-white/70 sm:p-7'>
          <header className='relative z-10 flex items-center justify-between'>
            <button
              type='button'
              className='grid size-10 place-items-center rounded-full text-[#231d18] transition-colors hover:bg-black/5'>
              {/*<Grid2X2 className='size-5' strokeWidth={2} />*/}
            </button>

            <div className='relative grid size-10 place-items-center text-[#231d18]'>
              <Bell className='size-5' strokeWidth={2} />
              <span className='absolute right-0.5 top-0.5 size-2.5 rounded-full bg-[#ff4f8a] ring-2 ring-[#f6f2eb]' />
            </div>
          </header>

          <div className='relative z-10 mt-8 rounded-[28px] bg-[#c9f36b] p-5 text-[#1d1b14] shadow-[0_20px_45px_rgba(161,215,72,0.24)]'>
            <p className='text-xs font-semibold tracking-[0.01em] text-[#2f351c]'>Your Balance</p>
            <p className='mt-1 text-[2.85rem] leading-none font-medium tracking-[-0.08em]'>$3,460,348</p>

            <button
              type='button'
              className='mt-5 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-[0.76rem] font-medium text-[#25231d] shadow-sm'>
              <span className='size-2.5 rounded-full bg-[#26c281]' />
              <span>BEP-20</span>
              {/*<ChevronDown className='size-3.5' strokeWidth={2.2} />*/}
            </button>
          </div>

          <div className='relative z-10 mt-8 space-y-4'>
            <h3 className='text-[1.05rem] font-semibold tracking-[-0.03em]'>
              Ever ETH <span className='font-normal text-[#8e8175]'>Swap</span>
            </h3>

            <div className='space-y-3'>
              <div>
                <p className='mb-2 text-[0.8rem] font-medium text-[#6c6157]'>From:</p>
                <div className='rounded-[18px] border border-[#dfd8cf] bg-[#f8f5ef] px-4 py-3 shadow-[0_6px_18px_rgba(51,34,20,0.05)]'>
                  <div className='flex items-center justify-between gap-4'>
                    <span className='text-[1rem] font-semibold tracking-[-0.03em]'>4325</span>
                    <button type='button' className='inline-flex items-center gap-1 text-[0.82rem] font-semibold'>
                      <span>USDT</span>
                      {/*<ChevronDown className='size-4' strokeWidth={2.2} />*/}
                    </button>
                  </div>
                </div>
                <p className='mt-2 text-[0.72rem] text-[#9c8f83]'>1 BTC = 25839.80 USD</p>
              </div>

              <div className='flex justify-end'>
                <button
                  type='button'
                  className='grid size-10 place-items-center rounded-full bg-[#ff4f8a] text-white shadow-[0_10px_26px_rgba(255,79,138,0.26)]'>
                  <Icon name='arrow-right' className='size-4 -rotate-45' strokeWidth={2.2} />
                </button>
              </div>

              <div>
                <p className='mb-2 text-[0.8rem] font-medium text-[#6c6157]'>To:</p>
                <div className='rounded-[18px] border border-[#dfd8cf] bg-[#f8f5ef] px-4 py-3 shadow-[0_6px_18px_rgba(51,34,20,0.05)]'>
                  <div className='flex items-center justify-between gap-4'>
                    <span className='text-[1rem] font-semibold tracking-[-0.03em]'>0.14</span>
                    <button type='button' className='inline-flex items-center gap-1 text-[0.82rem] font-semibold'>
                      <span>BTC</span>
                      <Icon name='arrow-right' className='size-4' strokeWidth={2.2} />
                    </button>
                  </div>
                </div>
                <p className='mt-2 text-[0.72rem] text-[#9c8f83]'>We use midmarket rates</p>
              </div>
            </div>
          </div>

          <div className='relative z-10 mt-8 rounded-[18px] bg-[#ece8d8] p-2 shadow-[0_10px_30px_rgba(67,52,32,0.08)]'>
            <button
              type='button'
              className='flex w-full items-center justify-between rounded-[14px] bg-white/85 px-4 py-3 text-[#201a14] shadow-[0_4px_12px_rgba(66,46,21,0.08)]'>
              <span className='grid size-8 place-items-center rounded-xl bg-[#f7f5ef]'>
                {/*<Check className='size-4' strokeWidth={2.4} />*/}
              </span>
              <span className='text-[0.95rem] font-medium tracking-[-0.02em]'>Exchange</span>
              <Icon name='arrow-right' className='size-5 text-[#95897f]' strokeWidth={2.2} />
            </button>
          </div>

          <nav className='relative z-10 mt-8 grid grid-cols-5 items-center gap-2 rounded-[22px] px-3 py-3'>
            {[
              { icon: Home, active: false },
              { icon: CreditCard, active: false },
              // { icon: ArrowRightLeft, active: true },
              { icon: Heart, active: false },
              { icon: Compass, active: false }
            ].map((item, index) => {
              const NavIcon = item.icon

              return (
                <button
                  key={index}
                  type='button'
                  className={`flex h-10 items-center justify-center rounded-[14px] transition-colors ${
                    item.active ? 'bg-[#c7ee62] text-[#17110f]' : 'text-[#9f9183]'
                  }`}>
                  <NavIcon className='size-5' strokeWidth={2} />
                </button>
              )
            })}
          </nav>
        </Card>
      </div>
    </section>
  )
}
