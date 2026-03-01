import React from 'react';
export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth-server';
import DashboardContent from './DashboardContent';
import { ArrowRight, FileText, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getDashboardData(cookies: string) {
  try {
    const response = await fetch(`${API_URL} /mahasiswa/dashboard`, {
      credentials: 'include',
      headers: {
        Cookie: cookies,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return null;
  }
}

export default async function MahasiswaDashboard() {
  // Get session server-side
  const session = await getSession();

  // Redirect if no session
  if (!session?.user) {
    redirect('/auth/login?returnUrl=/mahasiswa/dashboard');
  }

  // Get cookies for API call
  const { cookies: getCookies } = await import('next/headers');
  const cookieStore = await getCookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value} `)
    .join('; ');

  // Fetch dashboard data
  const data = await getDashboardData(cookieHeader);

  if (!data) {
    return (
      <div style={{ padding: '24px' }}>
        <h1>Error</h1>
        <p>Gagal memuat data dashboard. Silakan refresh halaman.</p>
      </div>
    );
  }

  return <DashboardContent data={data} session={session} />;
}
