import { ColophonSection } from '@/components/colophon-section'
import { HeroSection } from '@/components/hero-section'
import { LastLine } from '@/components/last-line'
import { SideNav } from '@/components/side-nav'
import { ThemeToggle } from '@/components/theme-toggle'
// tx-hash
export default function Page() {
  return (
    <main className='relative min-h-screen'>
      <SideNav />
      <ThemeToggle />
      <div className='relative z-10'>
        <HeroSection />
        <LastLine />
        <ColophonSection />
      </div>
    </main>
  )
}
