'use client';

import React from 'react';
import { Layout } from 'antd';
import AppHeader from './AppHeader';
import SidebarMenu from './SidebarMenu';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

const { Sider, Content } = Layout;

interface MahasiswaLayoutProps {
  children: React.ReactNode;
  userName?: string;
  onLogout?: () => void;
}

export const MahasiswaLayout: React.FC<MahasiswaLayoutProps> = ({
  children,
  userName = 'Mahasiswa',
  onLogout,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Hide sidebar on form pages
  const isFormPage = pathname?.includes('/form');

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader
        collapsed={collapsed}
        onCollapse={setCollapsed}
        userName={userName}
        userRole="Mahasiswa"
        onLogout={onLogout}
      />
      <Layout>
        {!isFormPage && (
          <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            width={250}
            style={{
              background: '#fff',
              boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <SidebarMenu role="mahasiswa" collapsed={collapsed} />
          </Sider>
        )}
        <Content
          style={{
            padding: '24px',
            background: '#f5f5f5',
            overflow: 'auto',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MahasiswaLayout;
