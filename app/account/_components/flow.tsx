import { Icon } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

export interface FlowNode {
  id: string
  label: string
  eyebrow: string
  description: string
  badge?: string
  content?: ReactNode
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
        'flex h-full w-120 min-w-120 flex-col border-r border-black/8 bg-[#f7f1e7]/92 dark:border-background dark:bg-[#020202] xl:w-140 xl:min-w-140',
        {
          'xl:w-125 xl:min-w-125': level === 0,
          'xl:w-125  xl:min-w-125': level === 1
        }
      )}>
      <div
        className={cn('flex items-center justify-between border-b border-black/8 px-6 h-10 dark:border-background', {
          'bg-accent': level === 0,
          'bg-accent/70': level === 1
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
          className={cn('size-4 dark:text-background', { 'dark:text-white': level === 1 })}
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
                  'group flex w-full items-start justify-between gap-4 px-4 py-4 text-left border-px',
                  isActive
                    ? 'border-black dark:border-background bg-[#18120f] text-white shadow-[0_16px_40px_rgba(24,18,15,0.18)] dark:bg-white/8 dark:shadow-none'
                    : 'border-black/8 bg-white/74 text-[#18120f] hover:border-black/15 hover:bg-white dark:border-white/10 dark:bg-white/3 dark:text-white/88 dark:hover:border-white/16 dark:hover:bg-white/6'
                )}>
                <div className='min-w-0 space-y-2'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <span
                      className={cn(
                        'font-mono text-[10px] uppercase tracking-[0.28em]',
                        isActive ? 'text-white/54' : 'text-[#8b7c6e] dark:text-white/38'
                      )}>
                      {level === 0 ? item.eyebrow : item.label}
                    </span>
                    {item.badge ? (
                      <span
                        className={cn(
                          'rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.24em]',
                          isActive
                            ? 'border-white/20 bg-white/10 text-white/86'
                            : 'border-black/10 bg-white text-[#675d53] dark:border-white/10 dark:bg-white/4 dark:text-white/56'
                        )}>
                        {item.badge}
                      </span>
                    ) : null}
                  </div>

                  <div>
                    <p className={cn('text-[1rem] font-medium tracking-[-0.03em] hidden', { flex: level === 0 })}>
                      {item.label}
                    </p>
                    <p
                      className={cn(
                        'mt-1 text-sm leading-6',
                        isActive ? 'text-white/64' : 'text-[#675d53] dark:text-white/54'
                      )}>
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className='flex shrink-0 items-center justify-center rounded-full'>
                  <Icon name='chevron-right-light' className={cn('size-10', { 'text-accent': isActive })} />
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
