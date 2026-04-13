'use client'

import { AuthLoading, Authenticated, Unauthenticated, useMutation, useQuery } from 'convex/react'
import { ArrowUpRight, Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { Icon, IconName } from '@/lib/icons'
import { cn } from '@/lib/utils'

function truncateAddress(address: string) {
  if (address.length <= 16) return address
  return `${address.slice(0, 8)}…${address.slice(-6)}`
}

function LoadingCard() {
  return (
    <Card className='overflow-hidden rounded-[30px] border-white/70 bg-[#f6f2eb] shadow-[0_22px_72px_rgba(63,42,20,0.12)]'>
      <CardHeader className='space-y-3 border-b border-black/5 p-6 sm:p-7'>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-10 w-10 rounded-2xl' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-3 w-56' />
          </div>
        </div>
      </CardHeader>
      <CardContent className='grid gap-4 p-6 sm:p-7'>
        <Skeleton className='h-11 rounded-2xl' />
        <Skeleton className='h-11 rounded-2xl' />
        <Skeleton className='h-11 rounded-2xl' />
      </CardContent>
    </Card>
  )
}

function SignedOutCard() {
  return (
    <Card className='overflow-hidden rounded-[30px] border-white/70 bg-[#f6f2eb] shadow-[0_22px_72px_rgba(63,42,20,0.12)]'>
      <CardHeader className='space-y-3 border-b border-black/5 p-6 sm:p-7'>
        <CardTitle className='flex items-center gap-3 text-[1.35rem] tracking-[-0.04em] text-[#18120f]'>
          <ArrowUpRight className='size-5 text-[#7f7368]' />
          Send
        </CardTitle>
        <CardDescription className='max-w-xl text-sm leading-6 text-[#675d53]'>
          Sign in to send to your saved contacts.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

const SendPanelContent = ({ network }: { network: 'eth' | 'sol' | 'btc' }) => {
  const contacts = useQuery(api.contacts.list)
  const createTransaction = useMutation(api.transactions.createTransaction)

  const [selectedContactId, setSelectedContactId] = useState<Id<'contacts'> | null>(null)
  const [selectedWalletId, setSelectedWalletId] = useState<Id<'contact_wallet_addresses'> | null>(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [didSend, setDidSend] = useState(false)

  const selectedContact = useMemo(
    () => contacts?.find((c) => c.id === selectedContactId) ?? null,
    [contacts, selectedContactId]
  )

  const selectedWallet = useMemo(
    () => selectedContact?.walletAddresses.find((w) => w.id === selectedWalletId) ?? null,
    [selectedContact, selectedWalletId]
  )

  const canSend = selectedContactId !== null && selectedWalletId !== null && amount.trim().length > 0

  const handleSelectContact = (id: Id<'contacts'>) => {
    setSelectedContactId(id)
    setSelectedWalletId(null)
  }

  const handleSend = async () => {
    if (!canSend || !selectedWallet) return

    setIsSending(true)
    try {
      await createTransaction({
        contactId: selectedContactId!,
        walletAddressId: selectedWalletId!,
        network: selectedWallet.network,
        address: selectedWallet.address,
        amount: amount.trim(),
        note: note.trim() || undefined
      })
      setDidSend(true)
      setSelectedContactId(null)
      setSelectedWalletId(null)
      setAmount('')
      setNote('')
      setTimeout(() => setDidSend(false), 2500)
    } finally {
      setIsSending(false)
    }
  }

  if (contacts === undefined) {
    return <LoadingCard />
  }

  return (
    <Card className='overflow-hidden rounded-[24px] border-white/70 bg-[#f6f2eb] shadow-[0_22px_72px_rgba(63,42,20,0.12)]'>
      <CardHeader className='border-b border-black/5 px-6'>
        <CardTitle className='flex items-center gap-3 text-[1.35rem] tracking-[-0.04em] text-[#18120f]'>
          <Icon name={network as IconName} className='size-6 text-indigo-500' />
          Send {network}
        </CardTitle>
        <CardDescription className='hidden max-w-xl text-sm leading-6 text-[#675d53]'>
          Pick a contact and wallet address, enter an amount, and send.
        </CardDescription>
      </CardHeader>

      <CardContent className='space-y-6 px-6'>
        {/* Recipient */}
        <div className='space-y-3'>
          <label className='text-[10px] font-medium uppercase tracking-[0.28em] text-[#7f7368]'>Recipient</label>
          {contacts.length === 0 ? (
            <div className='rounded-[8px] border border-dashed border-black/15 bg-white/65 dark:bg-card/10 p-4 text-sm leading-6 text-[#675d53]'>
              No contacts yet. Add one in the Contacts tab first.
            </div>
          ) : (
            <ScrollArea className='h-44'>
              <div className='space-y-2 pr-1'>
                {contacts.map((contact) => {
                  const isSelected = contact.id === selectedContactId

                  return (
                    <button
                      key={contact.id}
                      type='button'
                      onClick={() => handleSelectContact(contact.id)}
                      className={cn(
                        'w-full rounded-[22px] border px-4 py-3 text-left transition-all duration-200',
                        isSelected
                          ? 'border-[#18120f] bg-[#18120f] text-white shadow-[0_16px_40px_rgba(24,18,15,0.18)]'
                          : 'border-black/8 bg-white/75 text-[#18120f] hover:-translate-y-0.5 hover:border-black/15 hover:bg-white'
                      )}>
                      <div className='flex items-center justify-between gap-4'>
                        <div>
                          <p className='text-[0.92rem] font-medium tracking-[-0.02em]'>{contact.name}</p>
                          {contact.email ? (
                            <p className={cn('text-xs mt-0.5', isSelected ? 'text-white/60' : 'text-[#8b7c6e]')}>
                              {contact.email}
                            </p>
                          ) : null}
                        </div>
                        <Badge
                          variant='outline'
                          className={cn(
                            'rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.24em]',
                            isSelected
                              ? 'border-white/20 bg-white/10 text-white'
                              : 'border-black/10 bg-white text-[#675d53]'
                          )}>
                          {contact.walletAddresses.length}w
                        </Badge>
                      </div>
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Wallet address picker */}
        {selectedContact ? (
          <>
            <div className='space-y-3'>
              <label className='text-[10px] font-medium uppercase tracking-[0.28em] text-[#7f7368]'>
                Wallet address
              </label>
              {selectedContact.walletAddresses.length === 0 ? (
                <div className='rounded-[24px] border border-dashed border-black/10 bg-white/65 p-5 text-sm leading-6 text-[#675d53]'>
                  This contact has no wallet addresses saved.
                </div>
              ) : (
                <div className='space-y-2'>
                  {selectedContact.walletAddresses.map((wallet) => {
                    const isSelected = wallet.id === selectedWalletId

                    return (
                      <button
                        key={wallet.id}
                        type='button'
                        onClick={() => setSelectedWalletId(wallet.id)}
                        className={cn(
                          'w-full rounded-[22px] border px-4 py-3 text-left transition-all duration-200',
                          isSelected
                            ? 'border-[#18120f] bg-[#18120f] text-white shadow-[0_16px_40px_rgba(24,18,15,0.18)]'
                            : 'border-black/8 bg-white/75 text-[#18120f] hover:-translate-y-0.5 hover:border-black/15 hover:bg-white'
                        )}>
                        <div className='flex items-start justify-between gap-4'>
                          <div className='space-y-1.5'>
                            <div className='flex flex-wrap items-center gap-2'>
                              <Badge
                                variant='outline'
                                className={cn(
                                  'rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.24em]',
                                  isSelected
                                    ? 'border-white/20 bg-white/10 text-white'
                                    : 'border-black/10 bg-white text-[#675d53]'
                                )}>
                                {wallet.network}
                              </Badge>
                              {wallet.label ? (
                                <span
                                  className={cn(
                                    'text-[0.74rem] uppercase tracking-[0.2em]',
                                    isSelected ? 'text-white/60' : 'text-[#8b7c6e]'
                                  )}>
                                  {wallet.label}
                                </span>
                              ) : null}
                            </div>
                            <p
                              className={cn(
                                'font-mono text-[0.8rem] leading-5',
                                isSelected ? 'text-white/85' : 'text-[#18120f]'
                              )}>
                              {truncateAddress(wallet.address)}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        ) : null}

        {/* Amount + note */}
        <Separator className='bg-black/8' />
        <div className='grid gap-4'>
          <div className='grid gap-2'>
            <label className='text-[10px] font-medium uppercase tracking-[0.28em] text-[#7f7368]'>Amount</label>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder='0.00'
              className='h-14 rounded-[8px] border-black/10 bg-white/80 font-mono text-[16px]!'
            />
          </div>

          <div className='grid gap-2'>
            <label className='text-[10px] font-medium uppercase tracking-[0.28em] text-[#7f7368]'>
              Note <span className='normal-case tracking-normal text-[#a19384]'>(optional)</span>
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder='Payment for...'
              className='min-h-20 rounded-[8px] border-black/10 bg-white/80 shadow-[0_8px_24px_rgba(63,42,20,0.05)]'
            />
          </div>

          <Button
            type='button'
            onClick={() => void handleSend()}
            disabled={!canSend || isSending}
            className='h-14 w-full gap-2 rounded-[8px] bg-accent text-white hover:bg-[#28201c] disabled:opacity-40'>
            {isSending ? <Loader2 className='size-4 animate-spin' /> : <ArrowUpRight className='size-4' />}
            {isSending ? 'Sending…' : 'Send'}
          </Button>
        </div>
      </CardContent>

      <CardFooter className='border-t border-black/5 px-6 py-5 sm:px-7'>
        {didSend ? (
          <p className='text-xs uppercase tracking-[0.24em] text-[#26a269]'>Transaction saved successfully</p>
        ) : (
          <p className='text-xs uppercase tracking-[0.24em] text-[#8b7c6e]'>
            {contacts.length} contact{contacts.length !== 1 ? 's' : ''} available
          </p>
        )}
      </CardFooter>
    </Card>
  )
}

interface SendPanelProps {
  network: 'eth' | 'sol' | 'btc'
}

export const SendPanel = ({ network }: SendPanelProps) => {
  return (
    <>
      <AuthLoading>
        <LoadingCard />
      </AuthLoading>
      <Unauthenticated>
        <SignedOutCard />
      </Unauthenticated>
      <Authenticated>
        <SendPanelContent network={network} />
      </Authenticated>
    </>
  )
}
