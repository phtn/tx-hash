export interface AccountProfile {
  displayName: string
  email: string | null
  photoURL: string | null
  uid: string
  provider: string
  authTime: string
  emailVerified: boolean
}
