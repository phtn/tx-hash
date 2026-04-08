import { ColophonSection } from '@/components/colophon-section'
import { HeroSection } from '@/components/hero-section'
import { LastLine } from '@/components/last-line'
import { SideNav } from '@/components/side-nav'
import { HomeThemeToggle } from '@/components/theme-toggle'

export default function Page() {
  return (
    <div className='relative'>
      <SideNav />
      <HomeThemeToggle />
      <main className='relative z-10'>
        <HeroSection />
        <LastLine />
        <ColophonSection />
      </main>
    </div>
  )
}
