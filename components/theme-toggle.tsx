'use client'

import { MoonStar, SunMedium } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  if (!mounted) return null

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type='button'
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className='fixed right-4 top-4 z-1100 inline-flex items-center gap-2 border border-border/70 bg-background/80 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-foreground backdrop-blur-sm transition-colors duration-200 hover:border-accent hover:text-accent md:right-8 md:top-8'
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      {isDark ? <SunMedium className='size-4' /> : <MoonStar className='size-4' />}
      <span>{isDark ? 'Light' : 'Dark'}</span>
    </button>
  )
}
