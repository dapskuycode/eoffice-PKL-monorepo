'use client';

import MahasiswaLayout from '@/components/layout/MahasiswaLayout';
import { useAuth } from '@/hooks/useAuth';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <MahasiswaLayout userName={user?.nama} onLogout={logout}>
      {children}
    </MahasiswaLayout>
  );
}
