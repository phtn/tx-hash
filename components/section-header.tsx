import { Ref } from 'react'

interface SectionHeaderProps {
  title: string
  tag: string
  id: string
  ref: Ref<HTMLDivElement>
}

export const SectionHeader = ({ title, tag, id, ref }: SectionHeaderProps) => {
  return (
    <div ref={ref} className='mb-16 pr-6 md:pr-12'>
      <span className='font-ios font-semibold text-[9px] uppercase tracking-[0.35em] text-accent'>
        <span className='font-extrabold text-foreground opacity-70'>{id}</span>{' '}
        <span className='px-2 opacity-50 text-slate-500'>/</span> {tag}
      </span>
      <h2 className='mt-4 font-ct text-5xl md:text-6xl tracking-tight text-secondary-foreground'>{title}</h2>
    </div>
  )
}
