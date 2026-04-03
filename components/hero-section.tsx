'use client'

import { AnimatedNoise } from '@/components/animated-noise'
import { BitmapChevron } from '@/components/bitmap-chevron'
import { ScrambleTextOnHover } from '@/components/scramble-text'
import { SplitFlapAudioProvider, SplitFlapMuteToggle, SplitFlapText } from '@/components/split-flap-text'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'

gsap.registerPlugin(ScrollTrigger)

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

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

  return (
    <section ref={sectionRef} id='hero' className='relative min-h-screen flex items-center pl-6 md:pl-28 pr-6 md:pr-12'>
      <AnimatedNoise opacity={0.02} />

      {/* Left vertical labels */}
      <div className='absolute left-3 md:left-6 top-1/2 -translate-y-1/2'>
        <span className='font-mono text-[6px] uppercase tracking-[0.5em] text-muted-foreground -rotate-90 origin-left block whitespace-nowrap'>
          ⏺⏺⏺
        </span>
      </div>

      {/* Main content */}
      <div ref={contentRef} className='flex-1 w-full'>
        <SplitFlapAudioProvider>
          <div className='relative'>
            <SplitFlapText text='tx*hash' speed={64} size='4rem' iconName='hot' />
            <div className='mt-4'>
              <SplitFlapMuteToggle />
            </div>
          </div>
        </SplitFlapAudioProvider>

        <h2 className='_text-[clamp(1rem,3vw,2rem)] my-2'>
          <span className='font-ct font-medium text-2xl tracking-wider'>Continuum</span>
        </h2>

        <p className='mt-2 max-w-md font-mono text-sm text-muted-foreground leading-relaxed'>
          The Time–space continuum warp is a metaphysical and physiological concept developed by John Whitman Ray
          (1931–2001), the founder of Body Electronics, a healing modality emphasizing self-regeneration through
          techniques such as point holding and consciousness elevation.
          {/*Launch cards, crypto/Web3,
                    e-wallets, and bank transfers without stitching together separate systems.*/}
        </p>

        <div className='mt-16 flex items-center gap-8'>
          <a
            href='#work'
            className='group inline-flex items-center gap-4 border border-foreground/20 px-6 py-3 font-mono text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-all duration-200'>
            <ScrambleTextOnHover text='Get Started' as='span' duration={0.6} />
            <BitmapChevron className='transition-transform duration-400 size-4 ease-in-out group-hover:rotate-45' />
          </a>
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
