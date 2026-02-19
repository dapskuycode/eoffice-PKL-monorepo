'use client';

import React from 'react';
import { Layout } from 'antd';
import AppHeader from './AppHeader';
import SidebarMenu from './SidebarMenu';
import { useState } from 'react';

const { Sider, Content } = Layout;

interface AdminFakultasLayoutProps {
  children: React.ReactNode;
  userName?: string;
  onLogout?: () => void;
}

export const AdminFakultasLayout: React.FC<AdminFakultasLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Layout>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={250}
          style={{
            background: '#fff',
            boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
            borderRight: '1px solid #f0f0f0',
          }}
        >
          <SidebarMenu role="admin_fakultas" collapsed={collapsed} />
        </Sider>
        <Content
          style={{
            padding: '24px',
            background: '#f9f9f9',
            overflow: 'auto',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminFakultasLayout;
