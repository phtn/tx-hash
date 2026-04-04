'use client'

import { AddressBook } from '@/app/account/address-book'
import { Icon } from '@/lib/icons'
import { IconName } from '@/lib/icons/types'
import { cn } from '@/lib/utils'
import { Tabs } from '@base-ui/react/tabs'
import { ReactNode, useMemo } from 'react'

interface ActionTab {
  id: string
  label: string
  icon: IconName
  tone: string
  iconTone: string
  panel?: ReactNode
}

export const ActionTabs = () => {
  const tabs = useMemo(
    () =>
      [
        {
          id: 'receive',
          label: 'Receive',
          icon: 'money-receive-circle',
          tone: 'bg-emerald-100/1 backdrop-blur-xl text-slate-800',
          iconTone: 'bg-white/0'
        },
        {
          id: 'swap',
          label: 'Swap',
          icon: 'money-send',
          tone: 'bg-slate-100/1 backdrop-blur-xl text-slate-800',
          iconTone: 'bg-white/0'
        },
        {
          id: 'send',
          label: 'Send',
          icon: 'money-send-square',
          tone: 'bg-blue-100/1 backdrop-blur-xl dark:text-accent text-slate-800',
          iconTone: 'bg-white/0'
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
    <Tabs.Root className='relative flex min-w-0 w-full max-w-full flex-col gap-4 sm:gap-0 z-10'>
      <div className='w-full overflow-x-auto md:px-3 sm:mx-0 sm:px-0'>
        <Tabs.List
          aria-label='action-bar'
          className='relative z-0 flex w-max min-w-full flex-nowrap gap-4 overflow-visible p-2 md:gap-4 md:px-0'>
          {tabs.map((tab) => (
            <Tabs.Tab
              key={tab.id}
              value={tab.id}
              className={cn('flex h-16 w-18 flex-col items-center justify-center rounded-[10px] px-4', tab.tone)}>
              <Icon name={tab.icon} className='size-6' />
            </Tabs.Tab>
          ))}
          <Tabs.Indicator className='absolute top-1/2 z-[-1] h-14 w-14 _w-(--active-tab-width) translate-x-(--active-tab-left) -translate-y-1/2 bg-linear-to-r from-foreground/10 via-foreground/15 to-foreground/10 dark:via-slate-600 dark:to-dark-table transition-all duration-350 ease-out rounded-full blur-[2px]' />
        </Tabs.List>
      </div>
      {tabs.map((tab) => (
        <Tabs.Panel className='pt-4' key={tab.id} value={tab.id}>
          {tab.panel ?? <p>{tab.label}</p>}
        </Tabs.Panel>
      ))}
    </Tabs.Root>
  )
}
