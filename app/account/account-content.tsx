'use client'

import { snakey } from '@/components/pixel-grid'
import { ThemeToggle } from '@/components/theme-toggle'
import { CurrentUserAvatar } from '@/components/user-avatar'
import { Icon } from '@/lib/icons'
import { Tabs } from '@base-ui/react/tabs'
import { parseAsArrayOf, parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { PixelGrid } from 'three-px-react'
import { ACTION_TABS, type ActionTab } from '../account/_components/action-tabs'
import { SidebarItem } from '../account/_components/sidebar-items'
import { ActionTabFlow } from '../account/_components/tab-flow'
import type { AccountProfile } from '../account/types'
import { Topbar } from './_components/topbar'

export type { AccountProfile } from '../account/types'

interface AccountContentProps {
  profile: AccountProfile
}

const DEFAULT_TAB_ID = ACTION_TABS[0]?.id ?? ''
const TAB_IDS = ACTION_TABS.map((tab) => tab.id)

const accountSearchParams = {
  tab: parseAsStringLiteral(TAB_IDS).withDefault(DEFAULT_TAB_ID),
  path: parseAsArrayOf(parseAsString, '.').withDefault([])
}

const getTabById = (tabId: string) => ACTION_TABS.find((tab) => tab.id === tabId)

const getValidPath = (tab: ActionTab | undefined, path: string[]) => {
  if (!tab) return []

  const validPath: string[] = []
  let currentNodes = tab.nodes

  for (const nodeId of path) {
    const node = currentNodes.find((item) => item.id === nodeId)
    if (!node) break

    validPath.push(nodeId)
    currentNodes = node.children ?? []
    if (currentNodes.length === 0) break
  }

  return validPath
}

export const AccountContent = ({ profile }: AccountContentProps) => {
  return (
    <NuqsAdapter>
      <AccountContentInner profile={profile} />
    </NuqsAdapter>
  )
}

const AccountContentInner = ({ profile }: AccountContentProps) => {
  const [{ tab: activeTab, path }, setAccountParams] = useQueryStates(accountSearchParams, {
    history: 'push',
    shallow: true,
    scroll: false,
    clearOnDefault: true
  })

  const activeTabConfig = getTabById(activeTab)
  const activePath = getValidPath(activeTabConfig, path)

  const handleTabChange = (tabId: string) => {
    if (tabId === activeTab) return
    void setAccountParams({ tab: tabId, path: [] })
  }

  const handleFlowSelect = (tabId: string, level: number, nodeId: string) => {
    const currentPath = tabId === activeTab ? activePath : []
    const isActiveSelection = currentPath[level] === nodeId
    const nextPath = isActiveSelection ? currentPath.slice(0, level) : [...currentPath.slice(0, level), nodeId]

    void setAccountParams({ tab: tabId, path: nextPath })
  }

  return (
    <div className='relative h-dvh min-h-0 w-screen overflow-hidden text-[#18120f] dark:bg-card/50 dark:text-white'>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,124,51,0.18),transparent_34%),radial-gradient(circle_at_85%_18%,rgba(24,18,15,0.08),transparent_22%),linear-gradient(to_bottom,rgba(24,18,15,0.05)_1px,transparent_1px)] bg-size-[auto,auto,100%_100%] opacity-100 dark:bg-[radial-gradient(circle_at_top_left,rgba(255,124,51,0.14),transparent_34%),radial-gradient(circle_at_85%_18%,rgba(255,255,255,0.08),transparent_22%),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)]' />
      <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(24,18,15,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,18,15,0.06)_1px,transparent_1px)] bg-size-[72px_72px] opacity-25 mask-[linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)]' />

      <Tabs.Root
        value={activeTab}
        onValueChange={handleTabChange}
        className='relative grid h-full min-h-0 w-full overflow-hidden sm:grid-cols-[72px_minmax(0,1fr)] lg:grid-cols-[160px_minmax(160px,1fr)]'>
        <Tabs.List>
          <aside className='sticky top-0 hidden h-screen border-r border-foreground/20 dark:border-background bg-card/90 px-4 py-0 dark:bg-card md:flex md:flex-col md:justify-between'>
            <div className='space-y-0 w-full'>
              <button
                aria-label='Go home'
                className='size-10 flex items-center justify-center translate-x-3 rounded-[18px] text-accent outline-accent'>
                <Icon name='hot' className='size-5' />
              </button>
              <nav className='space-y-1 w-full'>
                {ACTION_TABS.map((item) => (
                  <Tabs.Tab key={item.id} value={item.id} className='rounded-full outline-accent'>
                    <SidebarItem key={item.label} {...item} active={activeTab === item.id} />
                  </Tabs.Tab>
                ))}
              </nav>
            </div>

            <div className='space-x-4 flex items-center w-full h-20'>
              <CurrentUserAvatar profile={profile} className='aspect-square' />
              <ThemeToggle className='size-10 rounded-full border border-black/10 bg-white/70 dark:border-white/10 dark:bg-white/3' />
              <div>
                <PixelGrid animation={snakey} color='white' />
              </div>
            </div>
          </aside>
        </Tabs.List>
        <div className='min-h-0 min-w-0 w-full overflow-hidden'>
          <Topbar />
          {ACTION_TABS.map((tab) => (
            <Tabs.Panel key={tab.id} value={tab.id} className='min-h-0 w-full overflow-hidden outline-none'>
              <main className='min-h-0 min-w-0 w-full flex-1 overflow-hidden'>
                <div className='h-[calc(100dvh-56px)] min-h-0 w-full overflow-hidden'>
                  <ActionTabFlow
                    tab={tab}
                    path={tab.id === activeTab ? activePath : []}
                    onSelect={(level, nodeId) => handleFlowSelect(tab.id, level, nodeId)}
                  />
                </div>
              </main>
            </Tabs.Panel>
          ))}
        </div>
      </Tabs.Root>
    </div>
  )
}
