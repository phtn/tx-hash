'use client'

import { AuthLoading, Authenticated, Unauthenticated, useMutation, useQuery } from 'convex/react'
import { BookUser, Loader2, Plus, Search, Trash2, WalletCards } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/convex/_generated/api'
import type { Doc } from '@/convex/_generated/dataModel'
import { useCurrentConvexUser } from '@/hooks/use-current-convex-user'
import { cn } from '@/lib/utils'

type ContactDraft = {
  name: string
  email: string
  notes: string
}

type WalletDraft = {
  network: string
  address: string
  label: string
}

const emptyContactDraft: ContactDraft = {
  name: '',
  email: '',
  notes: ''
}

const emptyWalletDraft: WalletDraft = {
  network: '',
  address: '',
  label: ''
}

function toOptionalString(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function LoadingCard() {
  return (
    <Card className='overflow-hidden border-white/70 bg-[#f6f2eb]'>
      <CardHeader className='space-y-3 border-b border-black/5 p-6 sm:p-7'>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-10 w-10' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-40' />
            <Skeleton className='h-3 w-64' />
          </div>
        </div>
      </CardHeader>
      <CardContent className='grid gap-4 p-6 sm:grid-cols-2 sm:p-7'>
        <Skeleton className='h-24 rounded-2xl' />
        <Skeleton className='h-24 rounded-2xl' />
        <Skeleton className='h-24 rounded-2xl sm:col-span-2' />
      </CardContent>
    </Card>
  )
}

function SignedOutState() {
  return (
    <Card className='overflow-hidden rounded-[30px] border-white/70 bg-[#f6f2eb] shadow-[0_22px_72px_rgba(63,42,20,0.12)]'>
      <CardHeader className='space-y-3 border-b border-black/5 p-6 sm:p-7'>
        <CardTitle className='flex items-center gap-3 text-[1.35rem] tracking-[-0.04em] text-[#18120f]'>
          <BookUser className='size-5 text-[#7f7368]' />
          Address book
        </CardTitle>
        <CardDescription className='max-w-xl text-sm leading-6 text-[#675d53]'>
          Sign in to create contacts and attach wallet addresses to each one.
        </CardDescription>
      </CardHeader>
      <CardContent className='p-6 sm:p-7'>
        <p className='text-sm leading-6 text-[#675d53]'>
          The address book is tied to the currently authenticated Firebase account.
        </p>
      </CardContent>
    </Card>
  )
}

function CurrentUserLoadingState() {
  return <LoadingCard />
}

function AddressBookContent() {
  const { currentUser, isLoading: isCurrentUserLoading } = useCurrentConvexUser()
  const contacts = useQuery(api.contacts.list)
  const createContact = useMutation(api.contacts.createContact)
  const updateContact = useMutation(api.contacts.updateContact)
  const deleteContact = useMutation(api.contacts.deleteContact)
  const addWalletAddress = useMutation(api.contacts.addWalletAddress)
  const deleteWalletAddress = useMutation(api.contacts.deleteWalletAddress)

  const [search, setSearch] = useState('')
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [contactDraft, setContactDraft] = useState<ContactDraft>(emptyContactDraft)
  const [walletDraft, setWalletDraft] = useState<WalletDraft>(emptyWalletDraft)
  const [isSavingContact, setIsSavingContact] = useState(false)
  const [isSavingWallet, setIsSavingWallet] = useState(false)

  const sortedContacts = useMemo(() => {
    if (!contacts) {
      return []
    }

    return [...contacts].sort((left, right) => right.updatedAt - left.updatedAt)
  }, [contacts])

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) {
      return sortedContacts
    }

    return sortedContacts.filter((contact) => {
      const haystack = [contact.name, contact.email ?? '', contact.notes ?? ''].join(' ').toLowerCase()
      return haystack.includes(query)
    })
  }, [search, sortedContacts])

  const selectedContact = useMemo(
    () => sortedContacts.find((contact) => contact.id === selectedContactId) ?? null,
    [selectedContactId, sortedContacts]
  )

  useEffect(() => {
    if (isCreating) {
      setContactDraft(emptyContactDraft)
      setWalletDraft(emptyWalletDraft)
      return
    }

    if (!selectedContact) {
      setContactDraft(emptyContactDraft)
      setWalletDraft(emptyWalletDraft)
      return
    }

    setContactDraft({
      name: selectedContact.name,
      email: selectedContact.email ?? '',
      notes: selectedContact.notes ?? ''
    })
    setWalletDraft(emptyWalletDraft)
  }, [isCreating, selectedContact])

  useEffect(() => {
    if (isCreating || selectedContactId || sortedContacts.length === 0) {
      return
    }

    setSelectedContactId(sortedContacts[0].id)
  }, [isCreating, selectedContactId, sortedContacts])

  const walletAddresses = useMemo(() => {
    const wallets = selectedContact?.walletAddresses ?? []
    return [...wallets].sort((left, right) => right.updatedAt - left.updatedAt)
  }, [selectedContact])

  const handleNewContact = () => {
    setIsCreating(true)
    setSelectedContactId(null)
    setContactDraft(emptyContactDraft)
    setWalletDraft(emptyWalletDraft)
  }

  const handleSelectContact = (contactId: string) => {
    setIsCreating(false)
    setSelectedContactId(contactId)
  }

  const handleSaveContact = async () => {
    const name = contactDraft.name.trim()
    if (!name) {
      return
    }

    const payload = {
      name,
      email: toOptionalString(contactDraft.email),
      notes: toOptionalString(contactDraft.notes)
    }

    setIsSavingContact(true)
    try {
      if (isCreating || !selectedContact) {
        await createContact(payload)
        setIsCreating(false)
      } else {
        await updateContact({
          contactId: selectedContact.id,
          ...payload
        })
      }
    } finally {
      setIsSavingContact(false)
    }
  }

  const handleDeleteContact = async () => {
    if (!selectedContact) {
      return
    }

    setIsSavingContact(true)
    try {
      await deleteContact({ contactId: selectedContact.id })
      setSelectedContactId(null)
      setIsCreating(false)
    } finally {
      setIsSavingContact(false)
    }
  }

  const handleAddWalletAddress = async () => {
    if (!selectedContact) {
      return
    }

    const network = walletDraft.network.trim()
    const address = walletDraft.address.trim()
    if (!network || !address) {
      return
    }

    setIsSavingWallet(true)
    try {
      await addWalletAddress({
        contactId: selectedContact.id,
        network,
        address,
        label: toOptionalString(walletDraft.label)
      })
      setWalletDraft(emptyWalletDraft)
    } finally {
      setIsSavingWallet(false)
    }
  }

  const handleDeleteWalletAddress = async (walletAddressId: Doc<'contact_wallet_addresses'>['_id']) => {
    await deleteWalletAddress({ walletAddressId })
  }

  if (isCurrentUserLoading || contacts === undefined) {
    return <LoadingCard />
  }

  return (
    <div className='grid gap-6 _xl:grid-cols-[0.78fr_1.22fr]'>
      <Card className='overflow-hidden rounded-[30px] border-white/70 bg-[#f6f2eb] shadow-[0_22px_72px_rgba(63,42,20,0.12)]'>
        <CardHeader className='space-y-3 border-b border-black/5 p-6 sm:p-7'>
          <div className='flex items-start justify-between gap-4'>
            <div className='space-y-2'>
              <CardTitle className='flex items-center gap-3 text-[1.35rem] tracking-[-0.04em] text-[#18120f]'>
                <BookUser className='size-5 text-[#7f7368]' />
                Address book
              </CardTitle>
              <CardDescription className='max-w-md text-sm leading-6 text-[#675d53]'>
                {currentUser?.name ?? currentUser?.email ?? 'Your'} contacts and wallet addresses live here.
              </CardDescription>
            </div>
            <Button
              type='button'
              onClick={handleNewContact}
              className='gap-2 rounded-full bg-[#18120f] px-4 text-white hover:bg-[#28201c]'>
              <Plus className='size-4' />
              New contact
            </Button>
          </div>

          <div className='relative'>
            <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#a19384]' />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder='Search contacts'
              className='h-11 rounded-full border-black/10 bg-white/75 pl-9 shadow-[0_8px_24px_rgba(63,42,20,0.05)]'
            />
          </div>
        </CardHeader>

        <CardContent className='p-0'>
          <ScrollArea className='h-[26rem]'>
            <div className='space-y-2 p-4 sm:p-5'>
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => {
                  const isSelected = selectedContact?.id === contact.id && !isCreating

                  return (
                    <button
                      key={contact.id}
                      type='button'
                      onClick={() => handleSelectContact(contact.id)}
                      className={cn(
                        'w-full rounded-[24px] border px-4 py-4 text-left transition-all duration-200',
                        isSelected
                          ? 'border-[#18120f] bg-[#18120f] text-white shadow-[0_16px_40px_rgba(24,18,15,0.18)]'
                          : 'border-black/8 bg-white/75 text-[#18120f] hover:-translate-y-0.5 hover:border-black/15 hover:bg-white'
                      )}>
                      <div className='flex items-start justify-between gap-4'>
                        <div className='space-y-1'>
                          <p className='text-[1rem] font-medium tracking-[-0.02em]'>{contact.name}</p>
                          <p className={cn('text-sm', isSelected ? 'text-white/72' : 'text-[#675d53]')}>
                            {contact.email ?? 'No email saved'}
                          </p>
                        </div>
                        <Badge
                          variant='outline'
                          className={cn(
                            'rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.24em]',
                            isSelected
                              ? 'border-white/20 bg-white/10 text-white'
                              : 'border-black/10 bg-white text-[#675d53]'
                          )}>
                          {contact.walletAddresses.length} wallets
                        </Badge>
                      </div>
                    </button>
                  )
                })
              ) : search.trim() ? (
                <div className='rounded-[24px] border border-dashed border-black/10 bg-white/65 p-6 text-sm leading-6 text-[#675d53]'>
                  No contacts match <span className='font-medium text-[#18120f]'>{search.trim()}</span>.
                </div>
              ) : (
                <div className='rounded-[24px] border border-dashed border-black/10 bg-white/65 p-6 text-sm leading-6 text-[#675d53]'>
                  Create your first contact to start tracking wallet addresses.
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className='overflow-hidden rounded-[30px] border-white/70 bg-[#f6f2eb] shadow-[0_22px_72px_rgba(63,42,20,0.12)]'>
        <CardHeader className='space-y-3 border-b border-black/5 p-6 sm:p-7'>
          <div className='flex items-start justify-between gap-4'>
            <div className='space-y-2'>
              <CardTitle className='text-[1.35rem] tracking-[-0.04em] text-[#18120f]'>
                {isCreating ? 'New contact' : selectedContact ? 'Edit contact' : 'Contact details'}
              </CardTitle>
              <CardDescription className='max-w-lg text-sm leading-6 text-[#675d53]'>
                Add people once, then attach the wallet addresses you want to reuse for payments.
              </CardDescription>
            </div>
            {selectedContact && !isCreating ? (
              <Button
                type='button'
                variant='outline'
                onClick={handleDeleteContact}
                disabled={isSavingContact}
                className='gap-2 rounded-full border-black/10 bg-white/80 px-4 text-[#7b322f] hover:bg-[#fff7f5]'>
                {isSavingContact ? <Loader2 className='size-4 animate-spin' /> : <Trash2 className='size-4' />}
                Delete
              </Button>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className='space-y-6 p-6 sm:p-7'>
          <div className='grid gap-4'>
            <div className='grid gap-2'>
              <label className='text-[10px] font-medium uppercase tracking-[0.28em] text-[#7f7368]'>Name</label>
              <Input
                value={contactDraft.name}
                onChange={(event) => setContactDraft((current) => ({ ...current, name: event.target.value }))}
                placeholder='Ada Lovelace'
                className='h-11 rounded-2xl border-black/10 bg-white/80 shadow-[0_8px_24px_rgba(63,42,20,0.05)]'
              />
            </div>

            <div className='grid gap-2 sm:grid-cols-2'>
              <div className='grid gap-2'>
                <label className='text-[10px] font-medium uppercase tracking-[0.28em] text-[#7f7368]'>Email</label>
                <Input
                  value={contactDraft.email}
                  onChange={(event) => setContactDraft((current) => ({ ...current, email: event.target.value }))}
                  placeholder='ada@example.com'
                  className='h-11 rounded-2xl border-black/10 bg-white/80 shadow-[0_8px_24px_rgba(63,42,20,0.05)]'
                />
              </div>

              <div className='grid gap-2'>
                <label className='text-[10px] font-medium uppercase tracking-[0.28em] text-[#7f7368]'>Action</label>
                <Button
                  type='button'
                  onClick={handleSaveContact}
                  disabled={isSavingContact || !contactDraft.name.trim()}
                  className='h-11 rounded-2xl bg-[#18120f] px-5 text-white hover:bg-[#28201c]'>
                  {isSavingContact ? 'Saving...' : isCreating || !selectedContact ? 'Create contact' : 'Save changes'}
                </Button>
              </div>
            </div>

            <div className='grid gap-2'>
              <label className='text-[10px] font-medium uppercase tracking-[0.28em] text-[#7f7368]'>Notes</label>
              <Textarea
                value={contactDraft.notes}
                onChange={(event) => setContactDraft((current) => ({ ...current, notes: event.target.value }))}
                placeholder='Add payment context, preferred rails, or a short reminder.'
                className='min-h-28 rounded-[22px] border-black/10 bg-white/80 shadow-[0_8px_24px_rgba(63,42,20,0.05)]'
              />
            </div>
          </div>

          <Separator className='bg-black/8' />

          <div className='space-y-4'>
            <div className='flex items-center justify-between gap-4'>
              <div>
                <h3 className='text-[1.02rem] font-medium tracking-[-0.03em] text-[#18120f]'>Wallet addresses</h3>
                <p className='mt-1 text-sm leading-6 text-[#675d53]'>
                  Store any network-specific destinations you want available for this contact.
                </p>
              </div>
              <Badge variant='outline' className='rounded-full border-black/10 bg-white px-2.5 py-1 text-[#675d53]'>
                <WalletCards className='mr-1 size-3.5' />
                {walletAddresses.length}
              </Badge>
            </div>

            <div className='grid gap-3 rounded-[24px] border border-black/8 bg-white/65 p-4 shadow-[0_8px_24px_rgba(63,42,20,0.04)]'>
              <div className='grid gap-3 md:grid-cols-[0.9fr_1.1fr]'>
                <Input
                  value={walletDraft.network}
                  onChange={(event) => setWalletDraft((current) => ({ ...current, network: event.target.value }))}
                  placeholder='Network, e.g. Ethereum'
                  className='h-11 rounded-2xl border-black/10 bg-white/80'
                />
                <Input
                  value={walletDraft.label}
                  onChange={(event) => setWalletDraft((current) => ({ ...current, label: event.target.value }))}
                  placeholder='Label, e.g. Main treasury'
                  className='h-11 rounded-2xl border-black/10 bg-white/80'
                />
              </div>

              <Input
                value={walletDraft.address}
                onChange={(event) => setWalletDraft((current) => ({ ...current, address: event.target.value }))}
                placeholder='0x...'
                className='h-11 rounded-2xl border-black/10 bg-white/80 font-mono text-[0.82rem]'
              />

              <div className='flex flex-wrap items-center justify-between gap-3'>
                <p className='text-xs leading-5 text-[#7f7368]'>
                  Add the address after filling the network and destination fields.
                </p>
                <Button
                  type='button'
                  onClick={handleAddWalletAddress}
                  disabled={
                    isSavingWallet || !selectedContact || !walletDraft.network.trim() || !walletDraft.address.trim()
                  }
                  className='gap-2 rounded-full bg-[#18120f] px-4 text-white hover:bg-[#28201c]'>
                  {isSavingWallet ? <Loader2 className='size-4 animate-spin' /> : <Plus className='size-4' />}
                  Add wallet address
                </Button>
              </div>
            </div>

            {selectedContact ? (
              walletAddresses.length > 0 ? (
                <div className='space-y-3'>
                  {walletAddresses.map((wallet) => (
                    <div
                      key={wallet.id}
                      className='rounded-[22px] border border-black/8 bg-white/80 p-4 shadow-[0_8px_20px_rgba(63,42,20,0.04)]'>
                      <div className='flex items-start justify-between gap-4'>
                        <div className='space-y-2'>
                          <div className='flex flex-wrap items-center gap-2'>
                            <Badge
                              variant='outline'
                              className='rounded-full border-black/10 bg-[#18120f] px-2.5 py-1 text-[10px] uppercase tracking-[0.24em] text-white'>
                              {wallet.network}
                            </Badge>
                            {wallet.label ? (
                              <span className='text-[0.76rem] uppercase tracking-[0.22em] text-[#7f7368]'>
                                {wallet.label}
                              </span>
                            ) : null}
                          </div>
                          <p className='font-mono text-[0.82rem] leading-6 text-[#18120f]'>{wallet.address}</p>
                        </div>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon-sm'
                          onClick={() => void handleDeleteWalletAddress(wallet.id)}
                          className='rounded-full text-[#7b322f] hover:bg-[#fff3f1] hover:text-[#5d1f1c]'>
                          <Trash2 className='size-4' />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='rounded-[24px] border border-dashed border-black/10 bg-white/65 p-6 text-sm leading-6 text-[#675d53]'>
                  No wallet addresses attached yet.
                </div>
              )
            ) : (
              <div className='rounded-[24px] border border-dashed border-black/10 bg-white/65 p-6 text-sm leading-6 text-[#675d53]'>
                Select a contact or create a new one to start adding wallet addresses.
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className='border-t border-black/5 px-6 py-5 sm:px-7'>
          <p className='text-xs uppercase tracking-[0.24em] text-[#8b7c6e]'>
            {sortedContacts.length} contacts • {walletAddresses.length} wallets on the current contact
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export function AddressBook() {
  return (
    <>
      <AuthLoading>
        <CurrentUserLoadingState />
      </AuthLoading>
      <Unauthenticated>
        <SignedOutState />
      </Unauthenticated>
      <Authenticated>
        <AddressBookContent />
      </Authenticated>
    </>
  )
}
