import { Icon } from '@/lib/icons'

export const AccountBalance = () => {
  return (
    <div className='relative z-10 rounded-[16px] border border-[#171310] bg-[#171310] p-5 text-white shadow-[0_20px_40px_rgba(20,15,12,0.1)]'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <p className='font-okx font-semibold text-xs text-white tracking-wider'>Your Balance</p>
          <p className='mt-1 text-[2rem] leading-none font-okx font-medium tracking-wider'>$3,460,348</p>
        </div>

        <div className='mt-2 grid size-12 place-items-center rounded-full bg-white/6'>
          <div className='grid size-7 place-items-center rounded-full text-[#17110f] shadow-sm'>
            <Icon name='add-money-circle' className='size-6 text-ring' />
          </div>
        </div>
      </div>

      <div className='flex items-end justify-between w-full h-16'>
        <div className='w-full' />
        <div className='flex items-center justify-center w-fit whitespace-nowrap text-[0.78rem] font-semibold text-[#18200f] shadow-[0_8px_20px_rgba(164,217,77,0.3)] p-1 rounded-[4px]'>
          <Icon name='add-user' className='size-5 text-ring ' />
        </div>
      </div>
    </div>
  )
}
