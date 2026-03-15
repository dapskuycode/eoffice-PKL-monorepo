import { treaty } from "@elysiajs/eden"
import type { App } from "@backend/autogen.routes";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const client = treaty<App>(API_URL, {
  fetch: {
    credentials: 'include',
  },
  headers: (): Record<string, string> => {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
});
