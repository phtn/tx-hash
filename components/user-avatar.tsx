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
    <Avatar
      className={cn('size-9 overflow-hidden rounded-full border border-white/70 bg-[#cab9f7] shadow-sm', className)}>
      {profile.photoURL ? <Avatar.Image alt={profile.displayName ?? initials} src={profile.photoURL} /> : null}
      <Avatar.Fallback>
        <div className='grid size-full place-items-center bg-linear-to-br from-[#c9b9f7] to-[#8f78ef] text-xs font-semibold text-white'>
          {initials}
        </div>
      </Avatar.Fallback>
    </Avatar>
  )
}

export const CurrentUserAvatar = ({ profile }: { profile: AccountProfile }) => {
  return <UserAvatar profile={profile} className='size-7' />
}
