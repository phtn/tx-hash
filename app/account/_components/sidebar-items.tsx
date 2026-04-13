import { Icon, type IconName } from '@/lib/icons'
import { cn } from '@/lib/utils'

interface SidebarItemProps {
  label: string
  icon: IconName
  active?: boolean
}

export const SidebarItem = ({ label, icon, active = false }: SidebarItemProps) => {
  return (
    <div onClick={undefined} className={cn('group flex w-full items-center gap-3 px-3 py-3 text-left')}>
      <div
        className={cn('flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-6 group-hover:bg-black/5 dark:group-hover:bg-white/5', {
          'bg-black/8 dark:bg-white/10': active
        })}>
        <span
          className={cn(
            'grid size-10 shrink-0 place-items-center rounded-full bg-white/70 transition-colors dark:bg-card',
            active ? 'text-accent' : 'text-[#675d53] group-hover:bg-white dark:text-white/62 dark:group-hover:bg-card'
          )}>
          <Icon name={icon} className='size-6' />
        </span>
        <span className='font-ct hidden text-2xl xl:block'>{label}</span>
      </div>
    </div>
  )
}
