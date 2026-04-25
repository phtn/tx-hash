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
    <section className={cn('flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-accent', className)}>
      <div className='shrink-0 border-b border-black/8 dark:border-background'>
        <p className='font-poly text-[10px] px-6 flex items-center h-10 uppercase tracking-wider text-background border-b border-card'>
          {eyebrow}
        </p>
        {title && (
          <h2 className='h-18 flex items-center px-6 font-ct text-xl leading-none text-[#18120f] dark:text-white bg-card dark:bg-card'>
            {title}
          </h2>
        )}
        {/*<p className='mt-3 max-w-2xl text-sm leading-6 text-[#675d53] dark:text-white/58'>{description}</p>*/}
      </div>

      <div className={cn('min-h-0 flex-1 overflow-y-auto overscroll-contain bg-card p-10', bodyClassName)}>
        {children}
      </div>
    </section>
  )
}
