import { ColophonSection } from '@/components/colophon-section'
import { HeroSection } from '@/components/hero-section'
import { LastLine } from '@/components/last-line'
import { PrinciplesSection } from '@/components/principles-section'
import { SideNav } from '@/components/side-nav'
import { SignalsSection } from '@/components/signals-section'
import { ThemeToggle } from '@/components/theme-toggle'
import { WorkSection } from '@/components/work-section'

export default function Page() {
  return (
    <main className='relative min-h-screen'>
      <SideNav />
      <ThemeToggle />
      <div className='grid-bg fixed inset-0 opacity-1' aria-hidden='true' />

      <div className='relative z-10'>
        <HeroSection />
        <SignalsSection />
        <WorkSection />
        <PrinciplesSection />
        <LastLine />
        <ColophonSection />
      </div>
    </main>
  )
}
