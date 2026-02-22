import { treaty } from "@elysiajs/eden"
import type  { App } from "@backend/autogen.routes";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const client = treaty<App>(API_URL, {
  headers: () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      return {
        Authorization: `Bearer ${token}`
      };
    }
    return {};
  }
});
