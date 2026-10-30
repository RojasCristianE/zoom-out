import { treaty } from '@elysiajs/eden';
import type { App } from '@zoom-out/api';
import { useAuthStore } from '@web/store/auth';

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? `${window.location.protocol}//${window.location.hostname}${
        window.location.port ? `:${window.location.port === '5173' ? '3000' : window.location.port}` : ''
      }/api`
    : '/api');

export const api = treaty<App>(API_URL, {
  onRequest: async (path, options) => {
    const { token } = useAuthStore.getState();
    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return options;
  },
  onResponse: async (response) => {
    if (response.status === 401) {
      useAuthStore.getState().logout();
    }
  },
}) as any; // Cast flexible de cliente para llamadas tipadas dinámicas
