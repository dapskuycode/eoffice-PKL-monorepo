'use client';

import dynamic from 'next/dynamic';
import { App, Spin } from 'antd';

const DetailPageContent = dynamic(
  () => import('./DetailPageContent'),
  {
    ssr: false,
    loading: () => (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" description="Loading Detail..." />
      </div>
    )
  }
);

export default function DetailPage() {
  return (
    <App>
      <DetailPageContent />
    </App>
  );
}
