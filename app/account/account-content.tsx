'use client'

import { ThemeToggle } from '@/components/theme-toggle'
import { CurrentUserAvatar } from '@/components/user-avatar'
import { Icon } from '@/lib/icons'
import { Tabs } from '@base-ui/react/tabs'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ACTION_TABS } from '../account/_components/action-tabs'
import { SidebarItem } from '../account/_components/sidebar-items'
import { ActionTabFlow } from '../account/_components/tab-flow'
import type { AccountProfile } from '../account/types'
import { Topbar } from './_components/topbar'

export type { AccountProfile } from '../account/types'

interface AccountContentProps {
  profile: AccountProfile
}

export const AccountContent = ({ profile }: AccountContentProps) => {
  const pathname = usePathname()
  const route = pathname.split('/').pop()

  const [activeTab, setActiveTab] = useState(ACTION_TABS[0]?.id ?? '')
  const [pathsByTab, setPathsByTab] = useState<Record<string, string[]>>({})

  const handleFlowSelect = (tabId: string, level: number, nodeId: string) => {
    setPathsByTab((current) => {
      const currentPath = current[tabId] ?? []
      const isActiveSelection = currentPath[level] === nodeId
      const nextPath = isActiveSelection ? currentPath.slice(0, level) : [...currentPath.slice(0, level), nodeId]

      return {
        ...current,
        [tabId]: nextPath
      }
    })
  }
  return (
    <div className='relative min-h-screen w-screen overflow-hidden bg-[#f7f1e7] text-[#18120f] dark:bg-[#050505] dark:text-white'>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,124,51,0.18),transparent_34%),radial-gradient(circle_at_85%_18%,rgba(24,18,15,0.08),transparent_22%),linear-gradient(to_bottom,rgba(24,18,15,0.05)_1px,transparent_1px)] bg-size:auto,auto,100%_100% opacity-100 dark:bg-[radial-gradient(circle_at_top_left,rgba(255,124,51,0.14),transparent_34%),radial-gradient(circle_at_85%_18%,rgba(255,255,255,0.08),transparent_22%),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)]' />
      <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(24,18,15,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,18,15,0.06)_1px,transparent_1px)] bg-size:72px_72px opacity-25 mask-[linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)]' />

      <Tabs.Root
        value={activeTab}
        onValueChange={setActiveTab}
        className='relative grid min-h-screen w-full sm:grid-cols-[72px_minmax(0,1fr)] lg:grid-cols-[220px_minmax(220px,1fr)]'>
        <Tabs.List>
          <aside className='sticky top-0 hidden h-screen border-r border-black/10 bg-[#fbf7ef]/86 px-4 py-4 dark:border-white/10 dark:bg-card md:flex md:flex-col md:justify-between'>
            <div className='space-y-4 w-full'>
              <button
                aria-label='Go home'
                className='size-12 flex items-center justify-center translate-x-3 rounded-[18px] text-accent outline-accent'>
                <Icon name='hot' className='size-7' />
              </button>
              <nav className='space-y-2 pt-6 w-full'>
                {ACTION_TABS.map((item) => (
                  <Tabs.Tab key={item.id} value={item.id} className='rounded-full outline-accent outine-1'>
                    <SidebarItem key={item.label} {...item} active={activeTab === item.id} />
                  </Tabs.Tab>
                ))}
              </nav>
            </div>

            <div className='space-x-4 flex items-center w-full h-20'>
              <div className='size-16 rounded-full border border-accent bg-white/70 dark:border-white/10 dark:bg-white/3'>
                <CurrentUserAvatar profile={profile} className='h-full w-auto aspect-square' />
              </div>
              <ThemeToggle className='size-10 rounded-full border border-black/10 bg-white/70 dark:border-white/10 dark:bg-white/3' />
            </div>
          </aside>
        </Tabs.List>
        {ACTION_TABS.map((tab) => (
          <Tabs.Panel key={tab.id} value={tab.id} className='w-full overflow-hidden'>
            <main className='min-w-0 flex-1'>
              <Topbar />
              <div className='w-full space-y-6'>
                <ActionTabFlow
                  tab={tab}
                  path={pathsByTab[tab.id] ?? []}
                  onSelect={(level, nodeId) => handleFlowSelect(tab.id, level, nodeId)}
                />
              </div>
            </main>
          </Tabs.Panel>
        ))}
      </Tabs.Root>
    </div>
  )
}
