import { ThemeToggle } from '@/components/theme-toggle'
import { CurrentUserAvatar } from '@/components/user-avatar'
import { SignOutButton } from '../sign-out-button'
import { AccountProfile } from '../types'
import { FeatureCard } from './feature-card'
import { MetricPill } from './metric-pill'

interface OverviewProps {
  profile: AccountProfile
}

export const Overview = ({ profile }: OverviewProps) => {
  return (
    <article className='w-full overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,125,51,0.08),rgba(255,255,255,0.02))] shadow-[0_30px_100px_rgba(0,0,0,0.4)] backdrop-blur-xl'>
      <div className='w-full grid gap-0'>
        <div className='border-b border-white/10 p-6 sm:p-8 lg:p-10 xl:border-b-0 xl:border-r'>
          <div className='grid gap-0'>
            <div className='space-y-6 xl:pr-8'>
              <p className='font-mono text-[10px] uppercase tracking-[0.42em] text-[#ff8a46]'>Data Center</p>
              <h1 className='font-sans text-[clamp(3rem,4.4vw,4.75rem)] font-medium leading-[0.88] tracking-[-0.08em] text-white'>
                Train Smarter AI Powered by Trusted Data
              </h1>
              <p className='text-sm leading-7 text-white/58 sm:text-[0.98rem]'>
                A denser account shell built around the same visual language as the reference: dark surfaces, narrow
                accents, and clean separation between overview, controls, and detail.
              </p>
              <div className='flex flex-wrap items-center gap-3'>
                <a
                  href='#workspace'
                  className='inline-flex h-11 items-center justify-center rounded-[14px] border border-white/10 bg-white/6 px-4 text-xs font-medium uppercase tracking-[0.24em] text-white transition-transform duration-200 hover:-translate-y-0.5'>
                  Explore workspace
                </a>
                <div className='rounded-[14px] border border-white/10 bg-[#ff7d33]/10 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-[#ffb78f]'>
                  {profile.provider} verified
                </div>
              </div>
            </div>

            <div className='mt-8 grid gap-0 border-t border-white/10 xl:mt-0 xl:border-t-0 xl:border-l'>
              <div className='grid gap-0 sm:grid-cols-3 xl:grid-cols-3'>
                <FeatureCard
                  icon='wallet-add'
                  title='Data validation'
                  description='Eliminate noise and surface only the most important account signals.'
                />
                <div className='hidden border-l border-white/10 sm:block' />
                <FeatureCard
                  icon='transaction-history'
                  title='AI, data pipelines'
                  description='Keep account actions, trust state, and session data in one place.'
                />
                <div className='hidden border-l border-white/10 sm:block' />
                <FeatureCard
                  icon='add-money-circle'
                  title='Data integrity'
                  description='Maintain consistency across account surfaces and controls.'
                />
              </div>
            </div>
          </div>
        </div>

        <div className='grid gap-0 xl:grid-rows-[minmax(0,1fr)_auto]'>
          <div className='grid gap-0 border-b border-white/10 p-6 sm:p-8 lg:p-10 xl:grid-cols-[minmax(0,1fr)_minmax(16rem,0.8fr)]'>
            <div className='space-y-5 xl:pr-8'>
              <h2 className='max-w-[16rem] font-sans text-[clamp(2rem,2.4vw,2.8rem)] font-medium leading-[0.96] tracking-[-0.06em] text-white'>
                AI Data Validation That Drives Performance
              </h2>
              <p className='max-w-[24rem] text-sm leading-7 text-white/56'>
                Keep the path visible while you inspect account settings, funding routes, contacts, and transactions.
              </p>
              <a
                href='#workspace'
                className='inline-flex h-11 w-fit items-center justify-center rounded-[14px] border border-white/10 bg-white/5 px-4 text-xs font-medium uppercase tracking-[0.24em] text-white transition-transform duration-200 hover:-translate-y-0.5'>
                Continue
              </a>

              <div className='mt-8 space-y-0'>
                <div className='border-t border-white/10 py-4'>
                  <p className='text-sm font-medium tracking-[-0.02em] text-white'>Set your data standards</p>
                </div>
                <div className='border-t border-white/10 py-4'>
                  <p className='text-sm font-medium tracking-[-0.02em] text-white'>Detect and fix data issues</p>
                  <p className='mt-2 text-sm leading-6 text-white/50'>
                    Automatically identify errors, inconsistencies, and gaps across the account.
                  </p>
                </div>
                <div className='border-t border-white/10 py-4'>
                  <p className='text-sm font-medium tracking-[-0.02em] text-white'>Scale with confidence</p>
                </div>
              </div>
            </div>

            <div className='relative mt-6 min-h-112 overflow-hidden rounded-[28px] border border-white/10 xl:mt-0'>
              <div className='absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,125,51,0.48),transparent_28%),radial-gradient(circle_at_78%_38%,rgba(255,197,126,0.28),transparent_22%),linear-gradient(135deg,rgba(92,18,0,0.8),rgba(22,10,6,0.95)_50%,rgba(0,0,0,0.9))]' />
              <div className='absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size:28px_28px opacity-30' />

              <div className='relative mx-auto mt-10 w-full max-w-md rounded-[24px] border border-white/10 bg-black/45 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.38)] backdrop-blur-xl'>
                <div className='space-y-4 rounded-[20px] border border-white/10 bg-white/4 p-4'>
                  <div className='flex items-center justify-between'>
                    <p className='text-xs uppercase tracking-[0.28em] text-white/46'>Create Data Center</p>
                    <span className='rounded-full border border-white/10 bg-white/4 px-2 py-1 text-[10px] uppercase tracking-[0.24em] text-white/50'>
                      AI-powered
                    </span>
                  </div>
                  <div className='grid gap-3'>
                    <div className='rounded-4xl border border-white/10 bg-black/20 px-4 py-3'>
                      <p className='text-[10px] uppercase tracking-[0.24em] text-white/40'>Your name</p>
                    </div>
                    <div className='grid gap-3 sm:grid-cols-2'>
                      <div className='rounded-4xl border border-white/10 bg-black/20 px-4 py-3'>
                        <p className='text-[10px] uppercase tracking-[0.24em] text-white/40'>Role</p>
                      </div>
                      <div className='rounded-4xl border border-white/10 bg-black/20 px-4 py-3'>
                        <p className='text-[10px] uppercase tracking-[0.24em] text-white/40'>Agent</p>
                      </div>
                    </div>
                    <div className='rounded-4xl border border-white/10 bg-black/20 px-4 py-10'>
                      <p className='text-[10px] uppercase tracking-[0.24em] text-white/40'>
                        What do you want to improve?
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center justify-end gap-3 pt-2'>
                    <button
                      type='button'
                      className='rounded-3xl border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/58'>
                      Cancel
                    </button>
                    <button
                      type='button'
                      className='rounded-3xl bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-black'>
                      Create System
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='grid gap-0 border-t border-white/10 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]'>
            <div className='border-b border-white/10 p-6 sm:p-8 lg:p-10 xl:border-b-0 xl:border-r'>
              <div className='space-y-4'>
                <p className='font-mono text-[10px] uppercase tracking-[0.32em] text-white/36'>Current profile</p>
                <div className='flex items-center justify-between gap-4'>
                  <div>
                    <p className='text-lg font-medium tracking-[-0.02em] text-white'>{profile.displayName}</p>
                    <p className='mt-1 text-sm text-white/52'>
                      {profile.email ?? 'No email available'} · signed in {profile.authTime}
                    </p>
                  </div>
                  <div className='grid size-16 place-items-center rounded-[20px] border border-white/10 bg-white/3]'>
                    <CurrentUserAvatar profile={profile} />
                  </div>
                </div>
              </div>

              <div className='grid gap-3 pt-2'>
                <div className='border-t border-white/10 pt-4'>
                  <p className='text-sm font-medium tracking-[-0.02em] text-white'>UID</p>
                  <p className='mt-1 truncate text-sm text-white/48'>{profile.uid}</p>
                </div>
                <div className='border-t border-white/10 pt-4'>
                  <p className='text-sm font-medium tracking-[-0.02em] text-white'>Verification</p>
                  <p className='mt-1 text-sm text-white/48'>
                    {profile.emailVerified ? 'Email verified' : 'Email not verified'}
                  </p>
                </div>
              </div>

              <div className='grid gap-3 sm:grid-cols-3'>
                <MetricPill label='Session' value='Trusted' />
                <MetricPill label='Profile' value='Verified' />
                <MetricPill label='Workspace' value='Live' />
              </div>
            </div>
          </div>

          <div className='border-b border-white/10 p-6 sm:p-8 lg:p-10 xl:border-b-0 xl:border-r'>
            <div className='space-y-4'>
              <p className='font-mono text-[10px] uppercase tracking-[0.32em] text-white/36'>Workspace controls</p>
              <p className='text-sm leading-6 text-white/54'>
                Theme and session controls remain available without taking over the visual hierarchy.
              </p>
              <div className='grid gap-3 sm:grid-cols-2'>
                <div className='rounded-[22px] border border-white/10 bg-white/3 p-4'>
                  <p className='font-mono text-[9px] uppercase tracking-[0.34em] text-white/34'>Session</p>
                  <p className='mt-2 text-sm text-white/72'>HTTP-only cookie</p>
                </div>
                <div className='rounded-[22px] border border-white/10 bg-white/3 p-4'>
                  <p className='font-mono text-[9px] uppercase tracking-[0.34em] text-white/34'>Theme</p>
                  <div className='mt-2'>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
              <div className='pt-2'>
                <SignOutButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
