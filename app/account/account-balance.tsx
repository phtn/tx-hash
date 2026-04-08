import { Icon } from '@/lib/icons'

export const AccountBalance = () => {
  return (
    <div className='relative z-10 h-40 p-5 text-white border-b'>
      <div className='flex items-start justify-between gap-4'>
        <div className='-translate-y-1 space-y-4'>
          <p className='font-okx text-xs text-white tracking-widest'>Balance</p>
          <p className='text-[28px] md:text-[2rem] leading-none font-okx font-medium tracking-wider'>$69,348.24</p>
        </div>

        <div className='grid size-12 place-items-center rounded-full bg-white/0'>
          <div className='grid size-10 place-items-center rounded-full'>
            <Icon name='add-money-circle' className='size-8 text-ring' />
          </div>
        </div>
      </div>

      <div className='hidden _flex items-end justify-between w-full h-16'>
        <div className='w-full' />
        <div className='flex items-center justify-center w-fit whitespace-nowrap text-[0.78rem] font-semibold text-[#18200f] shadow-[0_8px_20px_rgba(164,217,77,0.3)] p-1 rounded-[4px]'>
          <Icon name='add-user' className='size-5 text-ring ' />
        </div>
      </div>
    </div>
  )
}
