'use client'

import { ClassName } from '@/app/types'
import { Icon } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { Button } from '@base-ui/react/button'
import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'

interface ThemeToggleProps {
  className?: ClassName
}

export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const isDark = resolvedTheme === 'dark'
  if (!mounted) return null

  return (
    <Button
      type='button'
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn('inline-flex items-center justify-center outline-accent transition-colors', className)}>
      <Icon name='theme' className='m-auto size-4 text-accent' />
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
