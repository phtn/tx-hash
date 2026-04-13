import { ReactNode } from 'react'

interface EmbeddedDetailProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}

export const EmbeddedDetail = ({ eyebrow, title, description, children }: EmbeddedDetailProps) => {
  return (
    <section className='flex h-full w-full flex-1 flex-col bg-[#fbf7ef] dark:bg-background/30 xl:w-180'>
      <div className='border-b border-black/8 dark:bg-accent/40 flex items-center h-10 px-6 dark:border-background'>
        <p className='font-mono text-[10px] uppercase tracking-[0.32em] text-[#7f7368] dark:text-white'>{title}</p>
        {/*<h2 className='mt-3 font-ct text-[2rem] leading-none tracking-[-0.06em] text-[#18120f] dark:text-white'>
          {title}
        </h2>*/}
        {/*<p className='mt-3 max-w-2xl text-sm leading-6 text-[#675d53] dark:text-white/58'>{description}</p>*/}
      </div>

      <div className='flex-1 overflow-y-auto p-10'>{children}</div>
    </section>
  )
}
