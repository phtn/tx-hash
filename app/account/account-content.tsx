import { getInitials } from '@/lib/utils'
import { Avatar, Card } from '@heroui/react'
import Link from 'next/link'
import { SignOutButton } from './sign-out-button'
import { WalletContent } from './wallet-content'

export interface AccountProfile {
  displayName: string
  email: string | null
  photoURL: string | null
  uid: string
  provider: string
  authTime: string
  emailVerified: boolean
}

interface AccountContentProps {
  profile: AccountProfile
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-[22px] border border-black/5 bg-white/60 p-4 shadow-[0_10px_30px_rgba(63,42,20,0.06)]'>
      <p className='font-mono text-[9px] uppercase tracking-[0.32em] text-[#7f7368]'>{label}</p>
      <p className='mt-2 text-sm leading-6 tracking-[-0.02em] text-[#191412]'>{value}</p>
    </div>
  )
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-center justify-between gap-4 rounded-[20px] border border-white/10 bg-white/5 px-4 py-3'>
      <span className='font-mono text-[9px] uppercase tracking-[0.32em] text-white/55'>{label}</span>
      <span className='text-right text-sm leading-5 tracking-[-0.02em] text-white'>{value}</span>
    </div>
  )
}

export const AccountContent = ({ profile }: AccountContentProps) => {
  const initials = getInitials(profile.displayName, profile.email)

  return (
    <main className='relative min-h-screen overflow-hidden bg-[#d8d1c4] text-[#1f1812]'>
      <WalletContent profile={profile} />
      <div className='grid grid-cols-2 gap-6'>
        <SignOutButton />
      </div>
      <div className='relative mx-auto hidden _flex min-h-screen w-full max-w-6xl flex-col items-center gap-8'>
        <section className='grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]'>
          <Card className='overflow-hidden rounded-[36px] border border-white/70 bg-[#f6f1e8] shadow-[0_30px_90px_rgba(63,42,20,0.15)]'>
            <Card.Header className='flex items-start justify-between gap-4 border-b border-black/5 p-6 sm:p-7'>
              <div>
                <p className='font-mono text-[10px] uppercase tracking-[0.35em] text-[#8b7c6e]'>Authenticated</p>
                <Card.Title className='font-ct mt-3 text-[2rem] leading-none tracking-[-0.06em] text-[#18120f] sm:text-[2.35rem]'>
                  Hello, {profile.displayName}
                </Card.Title>
                <Card.Description className='mt-3 max-w-xl text-sm leading-6 text-[#675d53]'>
                  Your account is protected by a Firebase session cookie created after Google sign-in.
                </Card.Description>
              </div>

              <Avatar className='size-16 overflow-hidden rounded-full border border-white/80 bg-[#cab9f7] shadow-sm'>
                {profile.photoURL ? <Avatar.Image alt={profile.displayName} src={profile.photoURL} /> : null}
                <Avatar.Fallback>
                  <div className='grid size-full place-items-center bg-gradient-to-br from-[#c9b9f7] to-[#8f78ef] text-sm font-semibold text-white'>
                    {initials}
                  </div>
                </Avatar.Fallback>
              </Avatar>
            </Card.Header>

            <div className='grid gap-4 p-6 sm:grid-cols-2 sm:p-7'>
              <InfoTile label='Email' value={profile.email ?? 'Not provided'} />
              <InfoTile label='Provider' value={profile.provider} />
              <InfoTile label='UID' value={profile.uid} />
              <InfoTile label='Verified' value={profile.emailVerified ? 'Email verified' : 'Email not verified'} />
            </div>

            <Card.Footer className='flex flex-col gap-4 border-t border-black/5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7'>
              <div>
                <p className='text-sm font-medium tracking-[-0.02em] text-[#18120f]'>
                  Signed in since {profile.authTime}
                </p>
                <p className='mt-1 text-sm text-[#675d53]'>Only Google sign-in is enabled for now.</p>
              </div>

              <div className='flex items-center gap-3'>
                <Link
                  href='/'
                  className='inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white/70 px-4 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#4b4139] shadow-sm transition-transform duration-200 hover:-translate-y-0.5'>
                  Home
                </Link>
              </div>
            </Card.Footer>
          </Card>

          <Card className='overflow-hidden rounded-[36px] border border-white/10 bg-[#17110f] text-white shadow-[0_30px_90px_rgba(30,20,15,0.28)]'>
            <Card.Header className='p-6 sm:p-7'>
              <p className='font-mono text-[10px] uppercase tracking-[0.35em] text-white/55'>Session</p>
              <Card.Title className='mt-3 text-[1.75rem] leading-tight tracking-[-0.05em]'>
                Server-verified access
              </Card.Title>
              <Card.Description className='mt-3 text-sm leading-6 text-white/72'>
                This page only renders after Firebase Admin verifies the session cookie on the server.
              </Card.Description>
            </Card.Header>

            <div className='grid gap-3 px-6 pb-6 sm:px-7'>
              <StatusRow label='Cookie' value='txhash-session' />
              <StatusRow label='Check' value='verifySessionCookie(..., true)' />
              <StatusRow label='Provider' value='Google only' />
              <StatusRow label='Boundary' value='HTTP-only and server enforced' />
            </div>
          </Card>
        </section>
      </div>
    </main>
  )
}
