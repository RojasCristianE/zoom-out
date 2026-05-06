import { edenTreaty } from '@elysiajs/eden'
import type { App } from '@zoom-out/api'
import { useAuthStore } from '@/store/auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export const api = edenTreaty<App>(API_URL, {
  $fetch: {
    headers: () => {
      const token = useAuthStore.getState().token
      return token ? { Authorization: `Bearer ${token}` } : {}
    },
  },
})
