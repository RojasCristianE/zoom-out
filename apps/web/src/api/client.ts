import { edenTreaty } from '@elysiajs/eden'
import type { App } from '@zoom-out/api'
import { useAuthStore } from '@web/store/auth'

const API_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV 
    ? `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port === '5173' ? '3000' : window.location.port}` : ''}/api` 
    : ''
)
if (!API_URL) throw new Error('VITE_API_URL is missing')

export const api: ReturnType<typeof edenTreaty<App>> = edenTreaty<App>(API_URL, {
  fetcher: (async (input: any, init: any) => {
    const { token, logout } = useAuthStore.getState()
    const headers = new Headers(init?.headers)
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    
    const response = await fetch(input, { ...init, headers })
    
    // Si el token es inválido o expiró, forzar logout para disparar redirección
    if (response.status === 401) {
      logout()
    }

    return response
  }) as typeof fetch
})
