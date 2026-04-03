'use client'

import { cn } from '@/lib/utils'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { SectionHeader } from './section-header'

gsap.registerPlugin(ScrollTrigger)

const coverageItems = [
  {
    label: 'CORE',
    title: 'Card Payments',
    note: 'Accept debit and credit card payments through connected gateways and processors from one integration layer.'
  },
  {
    label: 'WEB3',
    title: 'Web3',
    note: 'Extend checkout with digital-asset payment options for customers operating in crypto-native commerce flows.'
  },
  {
    label: 'Crypto Commerce',
    title: 'Crypto Commerce',
    note: 'Support account-based payment methods for businesses that need direct transfer and settlement flexibility.'
  },
  {
    label: 'WALLET',
    title: 'E-Wallets',
    note: 'Offer familiar wallet experiences that match customer preference and improve local conversion performance.'
  }

  // {
  //   label: 'ROUTE',
  //   title: 'Provider Routing',
  //   note: 'Present the right payment option by geography, currency, transaction context, or business rules.'
  // }
]

export function SignalsSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    if (!sectionRef.current || !cursorRef.current) return

    const section = sectionRef.current
    const cursor = cursorRef.current

    const handleMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      gsap.to(cursor, {
        x: x,
        y: y,
        duration: 0.5,
        ease: 'power3.out'
      })
    }

    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)

    section.addEventListener('mousemove', handleMouseMove)
    section.addEventListener('mouseenter', handleMouseEnter)
    section.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      section.removeEventListener('mousemove', handleMouseMove)
      section.removeEventListener('mouseenter', handleMouseEnter)
      section.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !cardsRef.current) return

    const ctx = gsap.context(() => {
      // Header slide in from left
      gsap.fromTo(
        headerRef.current,
        { x: -60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      )

      const cards = cardsRef.current?.querySelectorAll('article')
      if (cards) {
        gsap.fromTo(
          cards,
          { x: -100, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id='signals' ref={sectionRef} className='relative py-32 pl-6 md:pl-28'>
      <div
        ref={cursorRef}
        className={cn(
          'pointer-events-none absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 z-50',
          'transition-opacity duration-300',
          isHovering ? 'opacity-100' : 'opacity-0'
        )}>
        <motion.div
          animate={{ rotate: '360deg' }}
          transition={{ repeat: Number.MAX_SAFE_INTEGER, duration: 2.5, ease: 'easeInOut' }}
          className='w-6 h-6 rounded-full border border-accent border-dashed bg-card/40 shadow-inner'
        />
      </div>

      {/* Section header */}
      <SectionHeader title='Global Coverage' tag='Payments' id='01' ref={headerRef} />

      {/* Horizontal scroll container */}
      <div
        ref={(el) => {
          scrollRef.current = el
          cardsRef.current = el
        }}
        className='flex gap-8 overflow-x-auto pb-8 pr-12 scrollbar-hide'
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {coverageItems.map((signal, index) => (
          <SignalCard key={index} signal={signal} index={index} />
        ))}
      </div>
    </section>
  )
}

function SignalCard({ signal, index }: { signal: { label: string; title: string; note: string }; index: number }) {
  return (
    <article
      className={cn(
        'group relative shrink-0 w-96',
        'transition-transform duration-500 ease-out',
        'hover:-translate-y-2'
      )}>
      {/* Card with paper texture effect */}
      <div className='relative dark:bg-card bg-white border dark:border-border/50 md:border-t md:border-l md:border-r-0 md:border-b-0 p-8'>
        {/* Top torn edge effect */}
        <div className='absolute -top-px left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent' />

        {/* Issue number - editorial style */}
        <div className='flex items-baseline justify-between mb-8'>
          <span className='font-ios text-[8px] uppercase tracking-[0.3em] text-foreground/60'>
            <span className='opacity-50 text-xs font-light capitalize'></span> {String(index + 1).padStart(2, '0')}
          </span>
          <span className='font-ios text-[8px] uppercase tracking-[0.2em] dark:text-slate-500'>{signal.label}</span>
        </div>

        {/* Title */}
        <h3 className='font-ct text-xl tracking-wider mb-4 group-hover:text-accent transition-colors duration-300'>
          {signal.title}
        </h3>

        {/* Divider line */}
        <div className='w-12 h-px bg-accent/60 mb-6 group-hover:bg-border/60 group-hover:w-full transition-all duration-500' />

        {/* Description */}
        <p className='font-cm text-xs text-foreground/45 text-balance leading-relaxed tracking-wide'>{signal.note}</p>

        {/* Bottom right corner fold effect */}
        <div className='absolute bottom-0 right-0 w-6 h-6 overflow-hidden'>
          <div className='absolute bottom-0 right-0 w-8 h-8 bg-background rotate-45 translate-x-4 translate-y-4 border-t border-l group-hover:border-l-2 border-accent/10' />
        </div>
      </div>

      {/* Shadow/depth layer */}
      <div className='absolute inset-0 -z-10 translate-x-px translate-y-px bg-accent/20 blur-[1.5px] rounded-ee-[23.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
    </article>
  )
}
