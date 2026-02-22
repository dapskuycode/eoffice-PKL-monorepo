import React from 'react';
export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth-server';
import ProfileContent from './ProfileContent';
import { App } from 'antd';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3079';

async function getMahasiswaProfile(cookies: string) {
  try {
    const response = await fetch(`${API_URL}/mahasiswa/dashboard/profile`, {
      headers: {
        Cookie: cookies,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching profile data:', error);
    return null;
  }
}

export default async function MahasiswaProfile() {
  // Get session server-side
  const session = await getSession();

  // Redirect if no session
  if (!session?.user) {
    redirect('/auth/login?returnUrl=/mahasiswa/profile');
  }

  // Get cookies for API call
  const { cookies: getCookies } = await import('next/headers');
  const cookieStore = await getCookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  // Fetch profile data
  const mahasiswa = await getMahasiswaProfile(cookieHeader);

  if (!mahasiswa) {
    return (
      <div style={{ padding: '24px' }}>
        <h1>Error</h1>
        <p>Gagal memuat data profil. Silakan refresh halaman.</p>
      </div>
    );
  }

  return (
    <App>
      <ProfileContent mahasiswa={mahasiswa} />
    </App>
  );
}
