import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Icon } from '@/lib/icons'

export function LoadingCard() {
  return (
    <Card className='overflow-hidden border-white/70 bg-[#f6f2eb]'>
      <CardHeader className='space-y-3 border-b border-black/5 p-6 sm:p-7'>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-10 w-10' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-40' />
            <Skeleton className='h-3 w-64' />
          </div>
        </div>
      </CardHeader>
      <CardContent className='grid gap-4 p-6 sm:grid-cols-2 sm:p-7'>
        <Skeleton className='h-24 rounded-2xl' />
        <Skeleton className='h-24 rounded-2xl' />
        <Skeleton className='h-24 rounded-2xl sm:col-span-2' />
      </CardContent>
    </Card>
  )
}

export function SignedOutState() {
  return (
    <Card className='overflow-hidden rounded-[30px] border-white/70 bg-[#f6f2eb] shadow-[0_22px_72px_rgba(63,42,20,0.12)]'>
      <CardHeader className='space-y-3 border-b border-black/5 p-6 sm:p-7'>
        <CardTitle className='flex items-center gap-3 text-[1.35rem] tracking-[-0.04em] text-[#18120f]'>
          <Icon name='roulette' className='size-5 text-[#7f7368]' />
          Signed Out
        </CardTitle>
        <CardDescription className='max-w-xl text-sm leading-6 text-[#675d53]'>
          Sign in to create contacts and attach wallet addresses to each one.
        </CardDescription>
      </CardHeader>
      <CardContent className='p-6 sm:p-7'>
        <p className='text-sm leading-6 text-[#675d53]'>
          The address book is tied to the currently authenticated Firebase account.
        </p>
      </CardContent>
    </Card>
  )
}

export function CurrentUserLoadingState() {
  return <LoadingCard />
}
