import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface EmbeddedDetailProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
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
    <section className={cn('flex h-full min-w-0 flex-1 flex-col bg-card dark:bg-background/30', className)}>
      <div className='border-b border-black/8 px-6 py-4 dark:border-background dark:bg-accent/40'>
        <p className='font-mono text-[10px] uppercase tracking-[0.30em] text-[#7f7368] dark:text-white/60'>{eyebrow}</p>
        <h2 className='mt-4 font-ct text-3xl leading-none text-[#18120f] dark:text-white'>{title}</h2>
        {/*<p className='mt-3 max-w-2xl text-sm leading-6 text-[#675d53] dark:text-white/58'>{description}</p>*/}
      </div>

      <div className={cn('flex-1 overflow-y-auto p-10', bodyClassName)}>{children}</div>
    </section>
  )
}
