'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MahasiswaPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/mahasiswa/portal');
  }, [router]);

  return null;
}
