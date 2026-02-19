'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SupervisorPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated and redirect to dashboard
    router.replace('/supervisor/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            Dashboard Supervisor
          </h1>
          <p className="text-gray-600">
            Halaman untuk supervisor monitoring dan supervisi seluruh proses persuratan.
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
