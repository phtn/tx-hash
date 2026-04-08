'use client'

import { Icon } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { Button } from '@base-ui/react/button'
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
    <Button
      type='button'
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <Icon name='hot' className={cn('text-accent size-4 m-auto', {})} />
    </Button>
  )
}

export const HomeThemeToggle = () => {
  return (
    <div className='fixed right-4 top-4 z-1100 inline-flex items-center justify-center text-background font-mono text-xs uppercase tracking-[0.24em] transition-colors duration-200 hover:text-accent md:right-8 md:top-8 size-6'>
      <ThemeToggle />
    </div>
  )
}
