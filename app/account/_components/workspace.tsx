import { ActionTabs } from '../action-tabs'

export const Workspace = () => {
  return (
    <div
      id='workspace'
      className='overflow-hidden rounded-[34px] border border-white/10 bg-white/2.5 shadow-[0_26px_80px_rgba(0,0,0,0.34)]'>
      <div className='flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6'>
        <div>
          <p className='font-mono text-[10px] uppercase tracking-[0.36em] text-white/34'>Workspace</p>
          <h2 className='mt-2 text-xl font-medium tracking-[-0.03em] text-white'>Nested account controls</h2>
        </div>
        <p className='hidden text-sm text-white/48 md:block'>
          The main pane stays on screen while the side rail collapses on smaller widths.
        </p>
      </div>

      <div className='h-168 min-h-168 xl:h-[calc(100vh-20rem)]'>
        <ActionTabs />
      </div>
    </div>
  )
}
