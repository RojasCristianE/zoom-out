import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile } from '@zoom-out/shared-types'

interface AuthState {
  user: UserProfile | null
  token: string | null
  setAuth: (user: UserProfile, token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      isAuthenticated: () => !!get().token && !!get().user,
    }),
    {
      name: 'zoom-out-auth',
    },
  ),
)
