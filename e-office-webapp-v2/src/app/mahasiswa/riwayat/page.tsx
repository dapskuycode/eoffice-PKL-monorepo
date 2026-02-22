'use client';

import dynamic from 'next/dynamic';
import { App, Spin } from 'antd';

const RiwayatContent = dynamic(
  () => import('./RiwayatContent'),
  {
    ssr: false,
    loading: () => (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Loading Riwayat..." />
      </div>
    )
  }
);

export default function RiwayatPage() {
  return (
    <App>
      <RiwayatContent />
    </App>
  );
}
