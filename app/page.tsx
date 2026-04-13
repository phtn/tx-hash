import { HeroSection } from '@/components/hero-section'
import { LastLine } from '@/components/last-line'
import { LinksSection } from '@/components/links-sections'
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
        <LinksSection />
      </main>
    </div>
  )
}
