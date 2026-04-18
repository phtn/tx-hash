import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface EmbeddedDetailProps {
  eyebrow: string
  description?: string
  children?: ReactNode
  title?: string
  bodyClassName?: string
  className?: string
}

export const EmbeddedDetail = ({
  eyebrow,
  title,
  description,
  children,
  bodyClassName,
  className
}: EmbeddedDetailProps) => {
  return (
    <section
      className={cn(
        'flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-card dark:bg-background/30',
        className
      )}>
      <div className='shrink-0 border-b border-black/8 dark:border-background'>
        <p className='font-poly text-[8px] px-6 flex items-center h-10 uppercase tracking-[0.30em] text-[#7f7368] dark:text-white dark:bg-accent/40'>
          {eyebrow}
        </p>
        {title && (
          <h2 className='h-18 flex items-center px-6 font-ct text-3xl leading-none text-[#18120f] dark:text-white bg-foreground/8 dark:bg-white/8'>
            {title}
          </h2>
        )}
        {/*<p className='mt-3 max-w-2xl text-sm leading-6 text-[#675d53] dark:text-white/58'>{description}</p>*/}
      </div>

      <div className={cn('min-h-0 flex-1 overflow-y-auto overscroll-contain p-10', bodyClassName)}>{children}</div>
    </section>
  )
}
