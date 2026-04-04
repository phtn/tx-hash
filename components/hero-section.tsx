'use client'

import { AnimatedNoise } from '@/components/animated-noise'
import { ScrambleTextOnHover } from '@/components/scramble-text'
import { SplitFlapAudioProvider, SplitFlapMuteToggle, SplitFlapText } from '@/components/split-flap-text'
import { signInWithGoogle, signOutUser, useFirebaseUser } from '@/lib/firebase/auth'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { createFirebaseSession } from '@/lib/firebase/session'
import { Icon } from '@/lib/icons'
import { Button } from '@heroui/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

gsap.registerPlugin(ScrollTrigger)

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { isLoading, user } = useFirebaseUser()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [signInError, setSignInError] = useState<string | null>(null)

  useEffect(() => {
    if (!sectionRef.current || !contentRef.current) return

    const ctx = gsap.context(() => {
      gsap.to(contentRef.current, {
        y: -100,
        opacity: 0,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        }
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    router.prefetch('/account')
  }, [router])

  const handlePrimaryAction = async () => {
    if (user) {
      router.push('/account')
      return
    }

    setSignInError(null)
    setIsSigningIn(true)
    let didSignIn = false

    try {
      const credential = await signInWithGoogle()
      didSignIn = true
      await createFirebaseSession(await credential.user.getIdToken(true))
      router.push('/account')
    } catch (error) {
      if (didSignIn) {
        await signOutUser().catch(() => undefined)
      }

      setSignInError(error instanceof Error ? error.message : 'Google sign-in failed. Please try again.')
    } finally {
      setIsSigningIn(false)
    }
  }

  const signInLabel = isLoading
    ? 'Checking session...'
    : isSigningIn
      ? 'Connecting...'
      : user
        ? 'Open account'
        : 'Sign in with Google'

  return (
    <section ref={sectionRef} id='hero' className='relative min-h-screen flex items-center pl-6 md:pl-28 pr-6 md:pr-12'>
      <AnimatedNoise opacity={0.02} className='hidden' />

      {/* Left vertical labels */}
      <div className='absolute left-3 md:left-6 top-1/2 -translate-y-1/2'>
        <span className='font-mono text-[6px] uppercase tracking-[0.5em] text-muted-foreground -rotate-90 origin-left block whitespace-nowrap'>
          ⏺⏺⏺
        </span>
      </div>

      {/* Main content */}
      <div ref={contentRef} className='flex flex-col items-center flex-1 justify-center w-full'>
        <SplitFlapAudioProvider>
          <div className='relative'>
            <SplitFlapText text='tx*hash' speed={64} size='4rem' iconName='hot' />
            <div className='mt-4 hidden'>
              <SplitFlapMuteToggle />
            </div>
          </div>
        </SplitFlapAudioProvider>

        <div className='relative z-200 flex w-full flex-col items-center justify-center'>
          <Button
            type='button'
            variant='outline'
            isPending={isSigningIn}
            isDisabled={!isFirebaseConfigured || isSigningIn || isLoading}
            onPress={handlePrimaryAction}
            className='group inline-flex w-full max-w-[24rem] items-center justify-center gap-4 border border-accent/20 px-6 py-3 font-mono bg-accent text-background transition-all duration-200 text-base uppercase tracking-widest dark:bg-white dark:hover:border-accent hover:border-foreground dark:hover:bg-foreground hover:bg-foreground hover:text-white dark:hover:text-background'>
            <ScrambleTextOnHover text={signInLabel} as='span' duration={0.6} />
            <Icon name='arrow-right' className='size-4' />
            {/*<BitmapChevron className='transition-transform duration-400 size-4 ease-in-out group-hover:rotate-45' />*/}
          </Button>
          {!isFirebaseConfigured ? (
            <p className='mt-4 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground'>
              Firebase auth config is missing.
            </p>
          ) : null}
          {signInError ? (
            <p className='mt-2 max-w-sm text-center font-mono text-[10px] uppercase tracking-[0.24em] text-destructive'>
              {signInError}
            </p>
          ) : null}
          {/*<a
            href='#signals'
            className='font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-200'>
            Payment Coverage
          </a>*/}
        </div>
      </div>

      {/* Floating info tag */}
      <div className='absolute bottom-8 right-8 md:bottom-12 md:right-12'>
        <div className='border border-border px-3 py-1 font-cm text-[8px] lowercase tracking-widest text-muted-foreground'>
          cl_v.01
        </div>
      </div>
    </section>
  )
}
