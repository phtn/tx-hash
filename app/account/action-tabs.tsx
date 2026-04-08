'use client'

import { Icon } from '@/lib/icons'
import { IconName } from '@/lib/icons/types'
import { cn } from '@/lib/utils'
import { Tabs } from '@base-ui/react/tabs'
import { ReactNode, useMemo, useState } from 'react'

interface ActionTab {
  id: string
  label: string
  icon: IconName
  tone: string
  iconTone: string
  panel?: ReactNode
}

export const ActionTabs = () => {
  const [activeTab, setActiveTab] = useState('receive')
  const handleTabChange = (tab: string) => setActiveTab(tab)
  const tabs = useMemo(
    () =>
      [
        {
          id: 'receive',
          label: 'Receive',
          icon: 'money-receive-circle',
          tone: 'bg-slate-200/2 backdrop-blur-xl',
          iconTone: 'bg-white/0',
          panel: (
            <div className='flex items-center justify-center h-96 w-full bg-[#f6f2eb] dark:bg-[#222]/1'>Add Funds</div>
          )
        },
        {
          id: 'send',
          label: 'Send',
          icon: 'money-send-square',
          tone: 'bg-slate-200/2 backdrop-blur-xl',
          iconTone: 'bg-white/0',
          panel: (
            <div className='flex items-center justify-center h-96 w-full bg-[#f6f2eb] dark:bg-[#222]/1'>
              Send Crypto
            </div>
          )
        },
        {
          id: 'contacts',
          label: 'Contacts',
          icon: 'address-book',
          tone: 'bg-slate-200/1 backdrop-blur-xl',
          iconTone: 'bg-white/0',
          panel: (
            <div className='flex items-center justify-center h-96 w-full bg-[#f6f2eb] dark:bg-[#222]/1'>
              <div className='rounded-lg border p-2'>Contacts</div>
            </div>
          )
          // panel: <AddressBook />
        },
        {
          id: 'tx',
          label: 'Transactions',
          icon: 'transaction-history',
          tone: 'bg-slate-200/1 backdrop-blur-xl',
          iconTone: 'bg-white/0',
          panel: (
            <div className='flex items-center justify-center h-96 w-full bg-[#f6f2eb] dark:bg-[#222]/1'>
              Transaction History
            </div>
          )
        }
      ] as Array<ActionTab>,
    []
  )
  return (
    <Tabs.Root value={activeTab} onValueChange={handleTabChange} className='relative flex min-w-0 w-full h-full'>
      <div className='flex h-full w-96 border-r'>
        <Tabs.List aria-label='action-bar' className='relative z-0 flex flex-col overflow-hidden w-full'>
          {tabs.map((tab) => (
            <Tabs.Tab
              key={tab.id}
              value={tab.id}
              className={cn('flex items-center h-20 space-x-4! w-full pl-8 bg-slate-200/1 backdrop-blur-xl')}>
              <div className='size-10 rounded-lg flex items-center'>
                <Icon name={tab.icon} className='size-6 text-foreground/80' />
              </div>
              <span
                className={cn('font-ct font-semibold text-lg text-foreground/80 tracking-wide', {
                  'text-accent': tab.id === activeTab
                })}>
                {tab.label}
              </span>
            </Tabs.Tab>
          ))}
          <Tabs.Indicator
            className={cn(
              'absolute z-[-1] h-6 w-72 _w-(--active-tab-width) translate-y-(--active-tab-top) left-4 top-8 bg-linear-to-r from-foreground/10 via-foreground/15 to-foreground/10 dark:via-slate-600 dark:to-dark-table transition-all duration-200 ease-out rounded-full blur-xs opacity-80'
            )}
          />
        </Tabs.List>
      </div>
      {tabs.map((tab) => (
        <Tabs.Panel className='w-full bg-foreground/5 dark:bg-card' key={tab.id} value={tab.id}>
          {tab.panel ?? <p>{tab.label}</p>}
        </Tabs.Panel>
      ))}
    </Tabs.Root>
  )
}
