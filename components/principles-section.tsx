'use client'

import { HighlightText } from '@/components/highlight-text'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'
import { SectionHeader } from './section-header'

gsap.registerPlugin(ScrollTrigger)

const principles = [
  {
    number: 'A',
    titleParts: [
      { text: 'UNIFIED ', highlight: false },
      { text: 'PAYMENT ACCESS', highlight: true }
    ],
    description: 'Activate cards, crypto/Web3, e-wallets, and bank transfers from one operating layer.',
    align: 'left'
  },
  {
    number: 'B',
    titleParts: [
      { text: 'MULTI-PROVIDER ', highlight: false },
      { text: 'CONNECTIVITY', highlight: true }
    ],
    description:
      'Connect payment gateways and processors once, then expand or change providers with less engineering overhead.',
    align: 'right'
  },
  {
    number: 'C',
    titleParts: [
      { text: 'FLEXIBLE CHECKOUT ', highlight: false },
      { text: 'ORCHESTRATION', highlight: true }
    ],
    description:
      'Tailor payment options by customer preference, geography, supported currency, or transaction context.',
    align: 'left'
  },
  {
    number: 'D',
    titleParts: [
      { text: 'FUTURE-READY ', highlight: false },
      { text: 'SCALABILITY', highlight: true }
    ],
    description:
      'Support growth through a SaaS model built for new markets, new rails, and evolving commerce behavior.',
    align: 'right'
  }
] as const

export function PrinciplesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const principlesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !principlesRef.current) return

    const ctx = gsap.context(() => {
      // Header slide in
      gsap.from(headerRef.current, {
        x: -60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      })

      // Each principle slides in from its aligned side
      const articles = principlesRef.current?.querySelectorAll('article')
      articles?.forEach((article, index) => {
        const isRight = principles[index].align === 'right'
        gsap.from(article, {
          x: isRight ? 80 : -80,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: article,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id='principles' className='relative py-32 pl-6 md:pl-28 pr-6 md:pr-12'>
      {/* Section header */}
      <SectionHeader title='Core Technologies' tag='capabilities' id='03' ref={headerRef} />

      {/* Staggered principles */}
      <div ref={principlesRef} className='space-y-24 md:space-y-32'>
        {principles.map((principle, index) => (
          <article
            key={index}
            className={`flex flex-col ${
              principle.align === 'right' ? 'items-end text-right' : 'items-start text-left'
            }`}>
            {/* Annotation label */}
            <span className='font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4'>
              {principle.number} / {principle.titleParts[0].text.split(' ')[0]}
            </span>

            <h3 className='font-display font-semibold text-4xl md:text-6xl lg:text-7xl tracking-tight leading-none'>
              {principle.titleParts.map((part, i) =>
                part.highlight ? (
                  <HighlightText key={i} parallaxSpeed={0.6}>
                    {part.text}
                  </HighlightText>
                ) : (
                  <span className='' key={i}>
                    {part.text}
                  </span>
                )
              )}
            </h3>

            {/* Description */}
            <p className='mt-6 max-w-md font-mono text-sm text-muted-foreground leading-relaxed'>
              {principle.description}
            </p>

            {/* Decorative line */}
            <div className={`mt-8 h-px bg-border w-24 md:w-48 ${principle.align === 'right' ? 'mr-0' : 'ml-0'}`} />
          </article>
        ))}
      </div>
    </section>
  )
}
