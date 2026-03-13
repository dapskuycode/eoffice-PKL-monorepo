'use client';

import dynamic from 'next/dynamic';
import { App, Spin } from 'antd';

const LoginPageContent = dynamic(
  () => import('./LoginPageContent'),
  {
    ssr: false,
    loading: () => (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" description="Loading Login..." />
      </div>
    )
  }
);

export default function LoginPage() {
  return (
    <App>
      <LoginPageContent />
    </App>
  );
}
