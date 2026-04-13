import { ReactNode } from 'react'

interface EmbeddedDetailProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}

export const EmbeddedDetail = ({ eyebrow, title, description, children }: EmbeddedDetailProps) => {
  return (
    <section className='flex h-full min-w-0 flex-1 flex-col bg-[#fbf7ef] dark:bg-[#050505] lg:min-w-136'>
      <div className='border-b border-black/8 px-6 py-5 dark:border-white/10'>
        <p className='font-mono text-[10px] uppercase tracking-[0.32em] text-[#7f7368] dark:text-white/38'>{eyebrow}</p>
        <h2 className='mt-3 font-ct text-[2rem] leading-none tracking-[-0.06em] text-[#18120f] dark:text-white'>
          {title}
        </h2>
        <p className='mt-3 max-w-2xl text-sm leading-6 text-[#675d53] dark:text-white/58'>{description}</p>
      </div>

      <div className='flex-1 overflow-y-auto p-6'>{children}</div>
    </section>
  )
}
