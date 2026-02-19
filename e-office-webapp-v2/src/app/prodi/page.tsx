'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProdiPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Redirect to SSO or login
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/sso`;
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            Dashboard Program Studi
          </h1>
          <p className="text-gray-600">
            Halaman untuk pengelolaan data dan laporan program studi.
          </p>
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800 text-sm">
              🚧 Halaman ini sedang dalam pengembangan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
