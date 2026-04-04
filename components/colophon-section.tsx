'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'
import { SectionHeader } from './section-header'

gsap.registerPlugin(ScrollTrigger)

export function ColophonSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // Header slide in
      if (headerRef.current) {
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
      }

      // Grid columns fade up with stagger
      if (gridRef.current) {
        const columns = gridRef.current.querySelectorAll(':scope > div')
        gsap.from(columns, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        })
      }

      // Footer fade in
      if (footerRef.current) {
        gsap.from(footerRef.current, {
          y: 20,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 95%',
            toggleActions: 'play none none reverse'
          }
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id='colophon'
      className='relative pt-32 pl-6 md:pl-28 pr-6 md:pr-12 border-t border-border/30'>
      {/* Section header */}
      <SectionHeader title='C-Layer' tag='SITEMAP' id='04' ref={headerRef} />

      {/* Multi-column layout */}
      <div ref={gridRef} className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 md:gap-12'>
        {/* Payment Methods */}
        <div className='col-span-1'>
          <ColumnHeader title='Payment Methods' />
          <ColumnItems items={[{ id: 'cards', name: 'Credit/Debit Cards' }]} />
        </div>

        {/* Alternative Rails */}
        <div className='col-span-1'>
          <ColumnHeader title='Alternative Rails' />
          <ColumnItems items={[{ id: 'cards', name: 'Credit/Debit Cards' }]} />
        </div>

        {/* Connectivity */}
        <div className='col-span-1'>
          <ColumnHeader title='Connectivity' />
          <ColumnItems
            items={[
              { id: 'multi-chain', name: 'Multi Chain' },
              { id: 'multi-coin', name: 'Multi Coin' },
              { id: 'multi-currency', name: 'Multi Currency' }
            ]}
          />
        </div>

        {/* Checkout Logic */}
        <div className='col-span-1'>
          <ColumnHeader title='Checkout' />
          <ColumnItems
            items={[
              { id: 'txhash-verification', name: 'Txhash verification' },
              { id: 'transaction-based', name: 'Transaction-based routing' }
            ]}
          />
        </div>

        {/* Business Impact */}
        <div className='col-span-1'>
          <ColumnHeader title='Business Impact' />
          <ColumnItems
            items={[
              { id: 'instant-payouts', name: 'Instant Payouts' },
              { id: 'multi-layer-security', name: 'Multi-Layer Security' }
            ]}
          />
        </div>

        {/* Ideal Fit */}
        <div className='col-span-1'>
          <ColumnHeader title='Ideal Fit' />
          <ColumnItems
            items={[
              { id: 'instant-payouts', name: 'Instant Payouts' },
              { id: 'ecommerce-marketplaces', name: 'E-commerce & marketplaces' }
            ]}
          />
        </div>
      </div>

      {/* Bottom copyright */}
      <div
        ref={footerRef}
        className='mt-24 pt-8 border-t border-border/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <p className='font-ios font-light text-xs text-muted-foreground uppercase tracking-widest'>
          © 2026 c-layer. All rights reserved.
        </p>
        <p className='font-ios font-light text-xs uppercase text-foreground/40 tracking-widest'>
          Designed to Scale Fast
        </p>
      </div>
    </section>
  )
}

const ColumnHeader = ({ title }: { title: string }) => {
  return (
    <h4 className='font-ios font-extrabold text-[9px] uppercase tracking-[0.25em] dark:text-border text-secondary-foreground mb-4'>
      {title}
    </h4>
  )
}

const ColumnItems = ({ items }: { items: { id: string; name: string }[] }) => {
  return (
    <ul className='space-y-2.5'>
      {items.map((item) => (
        <li key={item.id} className='font-ct font-medium text-xs text-foreground/80 tracking-widest'>
          {item.name}
        </li>
      ))}
    </ul>
  )
}
