import { Icon, IconName } from '@/lib/icons'

interface FeatureCardProps {
  title: string
  description: string
  icon: IconName
}

export const FeatureCard = ({ title, description, icon }: FeatureCardProps) => {
  return (
    <article className='space-y-3 px-5 py-5'>
      <div className='grid size-9 place-items-center rounded-full border border-white/10 bg-white/4 text-accent'>
        <Icon name={icon} className='size-4' />
      </div>
      <p className='text-sm font-medium tracking-[-0.03em] text-white'>{title}</p>
      <p className='text-sm leading-6 text-white/50'>{description}</p>
    </article>
  )
}
