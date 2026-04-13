import { Icon, IconName } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

export interface FlowNode {
  id: string
  label: string
  eyebrow: string
  description: string
  badge?: string
  content?: ReactNode
  icon?: IconName
  children?: FlowNode[]
}

interface FlowListColumnProps {
  eyebrow: string
  title: string
  description: string
  items: FlowNode[]
  activeId?: string
  level: number
  onSelect: (level: number, nodeId: string) => void
}

export const FlowListColumn = ({
  eyebrow,
  title,
  description,
  items,
  activeId,
  level,
  onSelect
}: FlowListColumnProps) => {
  return (
    <section
      className={cn(
        'flex h-full w-120 min-w-120 flex-col border-r border-white bg-linear-to-t from-card via-card/20 to-white dark:from-background/5 dark:via-background/10 dark:to-background/25 dark:border-background/50 xl:w-140 xl:min-w-140',
        {
          'xl:w-125 xl:min-w-125': level === 0,
          'xl:w-80 xl:min-w-80': level === 1
        }
      )}>
      <div
        className={cn('flex items-center justify-between border-b border-black/8 px-6 h-10 dark:border-background', {
          'bg-accent': level === 0,
          'bg-accent/90 dark:bg-accent/60': level === 1
        })}>
        <p
          className={cn(
            'font-mono font-medium text-[10px] uppercase tracking-[0.32em] text-[#7f7368] dark:text-white/38',
            {
              'text-white dark:text-background': level === 0,
              'text-white dark:text-white opacity-100': level === 1
            }
          )}>
          {title}
        </p>
        <Icon
          onClick={() => onSelect(level, '')}
          name='information-circle'
          className={cn('size-4 text-white dark:text-background', { 'dark:text-white': level === 1 })}
        />
      </div>

      <div className='flex-1 overflow-y-auto w-full'>
        <div className=''>
          {items.map((item) => {
            const isActive = activeId === item.id

            return (
              <button
                key={item.id}
                type='button'
                onClick={() => onSelect(level, item.id)}
                className={cn(
                  'group flex w-full items-center justify-between gap-4 pl-6 py-4 text-left border-y first:border-t-0 first:border-b-0 last:border-t-0 border-white dark:border-background outline-accent',
                  isActive
                    ? ' text-foreground bg-foreground/8 dark:bg-white/8 shadow-none'
                    : 'bg-white/50 text-[#18120f] hover:bg-foreground/2 dark:bg-white/3 dark:text-white/88 dark:hover:bg-white/6'
                )}>
                <div className={cn('flex items-center min-w-0', { 'gap-x-3': item.icon })}>
                  <div className='flex items-center'>
                    <div
                      className={cn(
                        'flex items-center font-semibold text-[10px]',
                        isActive ? 'text-foreground' : 'text-foreground/80 dark:text-white/38'
                      )}>
                      <span>{item.icon && <Icon name={item.icon} className='size-5' />}</span>
                      <span>{level === 0 || level === 1 ? null : item.label}</span>
                    </div>
                  </div>

                  <div>
                    <div
                      className={cn('items-center space-x-2 font-ct font-semibold text-base md:text-lg hidden', {
                        flex: level === 0 || level === 1
                      })}>
                      <span>{item.label}</span>
                      {item.badge ? (
                        <span
                          className={cn(
                            'rounded-[4.01px] border border-accent/80 px-2 h-5.5 flex items-center text-[9px] text-accent uppercase tracking-widest',
                            isActive ? 'bg-white/10' : 'bg-white dark:bg-white/4 dark:text-white/56'
                          )}>
                          {item.badge}
                        </span>
                      ) : null}
                    </div>
                    <p
                      className={cn(
                        'hidden mt-1 text-sm leading-6',
                        isActive ? 'text-foreground/80' : 'text-foreground/60 dark:text-white/54'
                      )}>
                      {level === 1 ? null : item.description}
                    </p>
                  </div>
                </div>

                <div className='flex shrink-0 items-center justify-center rounded-full'>
                  <Icon
                    name='chevron-right-light'
                    className={cn('size-10 opacity-60', { 'text-accent opacity-100': isActive })}
                  />
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
