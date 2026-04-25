import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ReactNode, useState } from 'react'

interface EmbeddedDetailProps {
  eyebrow: string
  description?: string
  children?: ReactNode
  title?: string
  bodyClassName?: string
  className?: string
  action?: ReactNode
  actionBody?: ReactNode
}

export const EmbeddedDetail = ({
  eyebrow,
  title,
  children,
  bodyClassName,
  className,
  action,
  actionBody
}: EmbeddedDetailProps) => {
  const [showAction, setShowAction] = useState(false)
  return (
    <section className={cn('flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-accent', className)}>
      <div className='shrink-0 '>
        <p className='font-poly text-[10px] border-b border-black/8 dark:border-background px-6 flex items-center h-10 uppercase tracking-wider text-background'>
          {eyebrow}
        </p>
        {title && (
          <div className='flex items-center justify-between px-6 bg-card dark:bg-card'>
            <h2 className='h-18 flex items-center font-ct text-xl leading-none text-[#18120f] dark:text-white'>
              {title}
            </h2>
            {action && actionBody && (
              <Button onClick={() => setShowAction(!showAction)} className=''>
                {showAction ? 'Cancel' : action}
              </Button>
            )}
          </div>
        )}
        {/*<p className='mt-3 max-w-2xl text-sm leading-6 text-[#675d53] dark:text-white/58'>{description}</p>*/}
      </div>

      <div className={cn('min-h-0 flex-1 overflow-y-auto overscroll-contain bg-card px-6', bodyClassName)}>
        {showAction ? actionBody : children}
      </div>
    </section>
  )
}
