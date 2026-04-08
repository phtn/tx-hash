'use client'

import { AddressBook } from '@/app/account/address-book'
import { SendPanel } from '@/app/account/send-panel'
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
  const [activeTab, setActiveTab] = useState('')
  const handleTabChange = (tab: string) => setActiveTab(tab)
  const tabs = useMemo(
    () =>
      [
        {
          id: 'receive',
          label: 'Receive',
          icon: 'money-receive-circle',
          tone: 'bg-emerald-100/1 backdrop-blur-xl text-slate-800',
          iconTone: 'bg-white/0',
          panel: <div className='h-96 w-full bg-neo rounded-[16.01px]' />
        },
        {
          id: 'send',
          label: 'Send',
          icon: 'money-send-square',
          tone: 'bg-blue-100/1 backdrop-blur-xl dark:text-accent text-slate-800',
          iconTone: 'bg-white/0',
          panel: <SendPanel />
        },
        {
          id: 'contacts',
          label: 'Contacts',
          icon: 'address-book',
          tone: 'bg-gray-100/1 backdrop-blur-xl text-gray-700',
          iconTone: 'bg-white/0',
          panel: <AddressBook />
        },
        {
          id: 'tx',
          label: 'Transactions',
          icon: 'transaction-history',
          tone: 'bg-gray-100/1 backdrop-blur-xl text-gray-700',
          iconTone: 'bg-white/0'
        }
      ] as Array<ActionTab>,
    []
  )
  return (
    <Tabs.Root value={activeTab} onValueChange={handleTabChange} className='relative flex min-w-0 w-full flex-col'>
      <div className='w-full flex items-center'>
        <Tabs.List aria-label='action-bar' className='relative z-0 flex flex-col overflow-visible w-full'>
          {tabs.map((tab) => (
            <Tabs.Tab
              key={tab.id}
              value={tab.id}
              className={cn('flex items-center space-x-4 w-full px-5 py-3', tab.tone)}>
              <div className='h-16 w-18 rounded-lg flex items-center'>
                <Icon name={tab.icon} className='size-8' />
              </div>
              <span className={cn('font-semibold text-foreground', { 'text-accent': tab.id === activeTab })}>
                {tab.label}
              </span>
            </Tabs.Tab>
          ))}
          <Tabs.Indicator
            className={cn(
              'absolute z-[-1] h-4 w-64 _w-(--active-tab-width) translate-y-(--active-tab-top) left-4 top-8 bg-linear-to-r from-foreground/10 via-foreground/15 to-foreground/10 dark:via-slate-600 dark:to-dark-table transition-all duration-200 ease-out rounded-full blur-xs opacity-40'
            )}
          />
        </Tabs.List>
      </div>
      {tabs.map((tab) => (
        <Tabs.Panel className='md:pt-4' key={tab.id} value={tab.id}>
          {tab.panel ?? <p>{tab.label}</p>}
        </Tabs.Panel>
      ))}
    </Tabs.Root>
  )
}
