'use client'

import { AccountProfile } from '@/app/account/account-content'
import { ClassName } from '@/app/types'
import { cn, getInitials } from '@/lib/utils'
import { Avatar } from '@heroui/react'

type UserAvatarProps = {
  profile: AccountProfile
  className?: ClassName
}

export const UserAvatar = ({ profile, className }: UserAvatarProps) => {
  const initials = getInitials(profile.displayName, profile.email)
  return (
    <Avatar className={cn('size-8 rounded-full bg-accent', className)}>
      {profile.photoURL ? <Avatar.Image alt={profile.displayName ?? initials} src={profile.photoURL} /> : null}
      <Avatar.Fallback className='flex items-center justify-center size-8 font-bold text-background text-sm'>
        {initials}
      </Avatar.Fallback>
    </Avatar>
  )
}

export const CurrentUserAvatar = ({ profile, className }: { profile: AccountProfile; className?: ClassName }) => {
  return <UserAvatar profile={profile} className={cn('', className)} />
}
