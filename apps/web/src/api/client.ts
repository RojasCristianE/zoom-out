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
    const token = useAuthStore.getState().token
    const headers = new Headers(init?.headers)
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return fetch(input, { ...init, headers })
  }) as typeof fetch
})
