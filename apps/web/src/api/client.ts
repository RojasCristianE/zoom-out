import { treaty } from '@elysiajs/eden';
import type { App } from '@zoom-out/api';
import { useAuthStore } from '@web/store/auth';

// Eden Treaty v2 requiere el origen completo (protocolo + host) para no interpretar la ruta relativa como un hostname
const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api`;
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
};

export const api = treaty<App>(getBaseUrl(), {
  onRequest: async (path, options) => {
    const { token } = useAuthStore.getState();
    const headers = new Headers(options.headers as any);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    options.headers = headers;
    return options;
  },
  onResponse: async (response) => {
    if (response.status === 401 && !response.url.includes('/auth/login')) {
      useAuthStore.getState().logout();
    }
  },
}) as any;
