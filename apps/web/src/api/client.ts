import { edenTreaty } from '@elysiajs/eden'
import type { App } from '@zoom-out/api'
import { useAuthStore } from '@web/store/auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Usamos un Proxy para incluir dinámicamente el token en cada petición
const dynamicHeaders = new Proxy({} as Record<string, string>, {
  get(_target, prop: string | symbol) {
    if (typeof prop === 'string' && prop.toLowerCase() === 'authorization') {
      const token = useAuthStore.getState().token
      return token ? `Bearer ${token}` : undefined
    }
    return undefined
  },
  ownKeys() {
    return ['Authorization']
  },
  getOwnPropertyDescriptor(_target, prop: string | symbol) {
    if (typeof prop === 'string' && prop.toLowerCase() === 'authorization') {
      const token = useAuthStore.getState().token
      const value = token ? `Bearer ${token}` : undefined
      return { enumerable: true, configurable: true, value }
    }
    return undefined
  }
})

export const api = edenTreaty<App>(API_URL, {
  $fetch: {
    headers: dynamicHeaders
  }
}) as any // Cast explícito para evitar problemas de portabilidad en el tsc del monorepo
