'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Local User type that's more flexible than the one in types/index.ts
interface AuthUser {
  id: string;
  email: string;
  nama?: string;
  name?: string;
  role?: string;
  roleNames?: string[];
  createdAt?: string;
  [key: string]: any; // Allow additional properties
}

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check session from Better Auth
        const response = await fetch(`${API_URL}/api/auth/get-session`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          setLoading(false);
          return;
        }

        const session = await response.json();

        if (session?.user) {
          // Get additional user data with roles
          const userWithRoles = await authService.getMe();
          if (userWithRoles) {
            setUser(userWithRoles as AuthUser);
            setIsAuthenticated(true);
            // Update localStorage for fallback
            localStorage.setItem('user', JSON.stringify(userWithRoles));
            localStorage.setItem('isLoggedIn', 'true');
          } else {
            setUser(session.user as AuthUser);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(session.user));
            localStorage.setItem('isLoggedIn', 'true');
          }
        } else {
          // No session, clear localStorage
          localStorage.removeItem('user');
          localStorage.removeItem('isLoggedIn');
          setIsAuthenticated(false);
        }
      } catch (error: any) {
        console.error('Auth check error:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);

      // Use authService which calls Better Auth endpoint
      const result = await authService.login(email, password);

      if (result?.user) {
        setUser(result.user as AuthUser);
        setIsAuthenticated(true);
        console.log('Login berhasil');

        // Redirect based on role
        const roles = (result.user.roleNames || [result.user.role]).filter(Boolean) as string[];
        const lowerRoles = roles.map(r => r.toLowerCase());

        if (lowerRoles.includes('mahasiswa')) {
          router.push('/mahasiswa/portal');
        } else if (lowerRoles.includes('admin_prodi')) {
          router.push('/admin-prodi/dashboard');
        } else if (lowerRoles.includes('ketua_prodi') || lowerRoles.includes('kaprodi')) {
          router.push('/ketua-prodi/dashboard');
        } else if (lowerRoles.includes('admin_fakultas')) {
          router.push('/admin-fakultas/dashboard');
        } else if (lowerRoles.includes('supervisor')) {
          router.push('/supervisor/dashboard');
        } else {
          router.push('/mahasiswa/portal');
        }
        return true;
      }

      console.error('Email atau password salah');
      return false;
    } catch (error: any) {
      console.error(error.message || 'Login gagal');
      return false;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      console.log('Logout berhasil');
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      router.push('/auth/login');
    }
  }, [router]);

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  };
};
