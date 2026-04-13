interface MetricPillProps {
  label: string
  value: string
}

export const MetricPill = ({ label, value }: MetricPillProps) => {
  return (
    <div className='rounded-[18px] border border-white/10 bg-white/3 px-4 py-3'>
      <p className='font-mono text-[9px] uppercase tracking-[0.34em] text-white/40'>{label}</p>
      <p className='mt-2 text-sm font-medium tracking-[-0.02em] text-white'>{value}</p>
    </div>
  )
}
