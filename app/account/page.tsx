import { getFirebaseAdminAuth } from '@/lib/firebase/admin'
import { firebaseSessionCookieName } from '@/lib/firebase/session'
import { type DecodedIdToken } from 'firebase-admin/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AccountContent, type AccountProfile } from './account-content'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function formatAuthTime(authTime: number) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(authTime * 1000))
}

function toAccountProfile(decodedToken: DecodedIdToken): AccountProfile {
  const provider = decodedToken.firebase?.sign_in_provider === 'google.com' ? 'Google' : 'Unknown'
  const displayName = decodedToken.name?.trim() || decodedToken.email?.trim() || 'Google user'

  return {
    displayName,
    email: decodedToken.email ?? null,
    photoURL: decodedToken.picture ?? null,
    uid: decodedToken.uid,
    provider,
    authTime: formatAuthTime(decodedToken.auth_time),
    emailVerified: Boolean(decodedToken.email_verified)
  }
}

export default async function AccountPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(firebaseSessionCookieName)?.value

  if (!sessionCookie) {
    redirect('/')
  }

  let auth: ReturnType<typeof getFirebaseAdminAuth> | null

  try {
    auth = getFirebaseAdminAuth()
  } catch {
    redirect('/')
  }

  if (!auth) {
    redirect('/')
  }

  let decodedToken: DecodedIdToken

  try {
    decodedToken = await auth.verifySessionCookie(sessionCookie, true)
  } catch {
    redirect('/')
  }

  return <AccountContent profile={toAccountProfile(decodedToken)} />
}
