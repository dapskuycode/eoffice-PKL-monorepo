'use client';

import React from 'react';
import { Layout } from 'antd';
import AppHeader from './AppHeader';
import SidebarMenu from './SidebarMenu';
import { useState } from 'react';

const { Sider, Content } = Layout;

interface KetuaProdiLayoutProps {
  children: React.ReactNode;
  userName?: string;
  onLogout?: () => void;
}

export const KetuaProdiLayout: React.FC<KetuaProdiLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ height: '100vh' }}>
      <AppHeader />
      <Layout style={{ overflow: 'hidden' }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={250}
          style={{
            background: '#fff',
            boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
            borderRight: '1px solid #f0f0f0',
            overflow: 'auto',
          }}
        >
          <SidebarMenu role="ketua_prodi" collapsed={collapsed} />
        </Sider>
        <Content
          style={{
            padding: '24px',
            background: '#f9f9f9',
            overflowY: 'auto',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default KetuaProdiLayout;
