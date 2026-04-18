import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface DetailMetric {
  label: string
  value: string
}

interface DetailPoint {
  title: string
  description: string
}

interface DetailStoryProps {
  eyebrow: string
  title: string
  children?: ReactNode
  description?: string
  metrics?: DetailMetric[]
  points?: DetailPoint[]
  note?: string
}

function DetailStat({ label, value }: DetailMetric) {
  return (
    <div className='rounded-none border border-black/8 bg-white/80 p-4 shadow-[0_12px_40px_rgba(63,42,20,0.06)] dark:border-white/10 dark:bg-white/3 dark:shadow-none'>
      <p className='font-mono text-[10px] uppercase tracking-[0.28em] text-[#7f7368] dark:text-white/40'>{label}</p>
      <p className='mt-3 text-2xl font-semibold tracking-[-0.05em] text-[#18120f] dark:text-white'>{value}</p>
    </div>
  )
}

export const DetailStory = ({ eyebrow, title, children, metrics = [], points = [], note }: DetailStoryProps) => {
  return (
    <section className='flex h-full min-w-screen flex-1 flex-col bg-card dark:bg-card/80 lg:min-w-100'>
      <div className='border-b border-black/8 dark:border-background'>
        <p className='font-poly text-[8px] px-6 flex items-center border-b h-10 uppercase tracking-[0.30em] text-[#7f7368] dark:text-white dark:bg-accent/40'>
          {eyebrow}
        </p>

        <h2 className='h-18 flex items-center px-6 font-ct text-3xl leading-none text-[#18120f] dark:text-white bg-foreground/8 dark:bg-white/8'>
          {title}
        </h2>
        {/*<p className='mt-1 max-w-2xl text-sm leading-6 text-[#675d53] dark:text-white/58'>{description}</p>*/}
      </div>
      {children}
      <div className='grid grid-cols-1 w-full gap-4 overflow-y-auto p-4 '>
        <div className='space-y-4'>
          {metrics.length > 0 ? (
            <div className={cn('grid gap-3', metrics.length > 2 ? 'sm:grid-cols-3' : 'sm:grid-cols-2')}>
              {metrics.map((metric) => (
                <DetailStat key={`${metric.label}-${metric.value}`} label={metric.label} value={metric.value} />
              ))}
            </div>
          ) : null}

          {points.length > 0 ? (
            <div className='grid grid-cols-2 gap-3'>
              {points.map((point) => (
                <article
                  key={point.title}
                  className='rounded-none border border-black/8 bg-white/72 p-5 shadow-[0_12px_36px_rgba(63,42,20,0.05)] dark:border-white/10 dark:bg-white/3 dark:shadow-none'>
                  <h3 className='text-[1rem] font-medium tracking-[-0.03em] text-[#18120f] dark:text-white'>
                    {point.title}
                  </h3>
                  <p className='mt-2 text-sm leading-6 text-[#675d53] dark:text-white/56'>{point.description}</p>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
