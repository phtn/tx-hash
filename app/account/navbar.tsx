import { Icon, IconName } from '@/lib/icons'
import { useMemo } from 'react'

export const Navbar = () => {
  const menu = useMemo(
    () =>
      [
        { icon: 'add-user', active: true },
        { icon: 'arrow-right', active: false },
        { icon: 'add-money-circle', active: false },
        { icon: 'hot', active: false }
      ] as { icon: IconName; active: boolean }[],
    []
  )
  return (
    <nav className='relative z-10 mt-28 grid grid-cols-5 items-center gap-2 rounded-[22px] bg-white/65 px-3 py-3 shadow-[0_8px_24px_rgba(72,48,22,0.08)] backdrop-blur-sm'>
      {menu.map((item, index) => {
        return (
          <button
            key={index}
            type='button'
            className={`flex h-10 items-center justify-center rounded-[14px] transition-colors ${
              item.active ? 'bg-[#c7ee62] text-[#17110f]' : 'text-[#9f9183]'
            }`}>
            <Icon name={item.icon} className='size-5' strokeWidth={2} />
          </button>
        )
      })}
    </nav>
  )
}
