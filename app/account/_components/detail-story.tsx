import { cn } from '@/lib/utils'

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
  description: string
  metrics?: DetailMetric[]
  points?: DetailPoint[]
  note: string
}

function DetailStat({ label, value }: DetailMetric) {
  return (
    <div className='rounded-[24px] border border-black/8 bg-white/80 p-4 shadow-[0_12px_40px_rgba(63,42,20,0.06)] dark:border-white/10 dark:bg-white/3 dark:shadow-none'>
      <p className='font-mono text-[10px] uppercase tracking-[0.28em] text-[#7f7368] dark:text-white/40'>{label}</p>
      <p className='mt-3 text-2xl font-semibold tracking-[-0.05em] text-[#18120f] dark:text-white'>{value}</p>
    </div>
  )
}

export const DetailStory = ({ eyebrow, title, description, metrics = [], points = [], note }: DetailStoryProps) => {
  return (
    <section className='flex h-full min-w-screen flex-1 flex-col bg-[#fbf7ef] dark:bg-[#050505] lg:min-w-120'>
      <div className='border-b border-black/8 px-6 py-5 dark:border-white/10'>
        <p className='font-mono text-[10px] uppercase tracking-[0.32em] text-[#7f7368] dark:text-white/38'>{eyebrow}</p>
        <h2 className='mt-3 font-ct text-[2rem] leading-none tracking-[-0.06em] text-[#18120f] dark:text-white'>
          {title}
        </h2>
        <p className='mt-3 max-w-2xl text-sm leading-6 text-[#675d53] dark:text-white/58'>{description}</p>
      </div>

      <div className='grid flex-1 gap-4 overflow-y-auto p-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]'>
        <div className='space-y-4'>
          {metrics.length > 0 ? (
            <div className={cn('grid gap-3', metrics.length > 2 ? 'sm:grid-cols-3' : 'sm:grid-cols-2')}>
              {metrics.map((metric) => (
                <DetailStat key={`${metric.label}-${metric.value}`} label={metric.label} value={metric.value} />
              ))}
            </div>
          ) : null}

          {points.length > 0 ? (
            <div className='grid gap-3'>
              {points.map((point) => (
                <article
                  key={point.title}
                  className='rounded-[26px] border border-black/8 bg-white/72 p-5 shadow-[0_12px_36px_rgba(63,42,20,0.05)] dark:border-white/10 dark:bg-white/3 dark:shadow-none'>
                  <h3 className='text-[1rem] font-medium tracking-[-0.03em] text-[#18120f] dark:text-white'>
                    {point.title}
                  </h3>
                  <p className='mt-2 text-sm leading-6 text-[#675d53] dark:text-white/56'>{point.description}</p>
                </article>
              ))}
            </div>
          ) : null}
        </div>

        <aside className='rounded-[28px] border border-black/8 bg-white/68 p-5 shadow-[0_12px_36px_rgba(63,42,20,0.05)] dark:border-white/10 dark:bg-white/3 dark:shadow-none'>
          <p className='font-mono text-[10px] uppercase tracking-[0.32em] text-[#7f7368] dark:text-white/38'>
            Operating note
          </p>
          <p className='mt-4 text-sm leading-6 text-[#675d53] dark:text-white/58'>{note}</p>
        </aside>
      </div>
    </section>
  )
}
