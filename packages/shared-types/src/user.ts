// ──────────────────────────────────────────────
// User & Role Types
// ──────────────────────────────────────────────

export type UserRole = 'admin' | 'host' | 'viewer'

export interface UserProfile {
  id: string
  email: string
  displayName: string
  role: UserRole
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface AuthTokenPayload {
  sub: string // user id
  email: string
  role: UserRole
  iat: number
  exp: number
}
