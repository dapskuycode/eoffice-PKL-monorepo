'use client';

import React from 'react';
import { Layout } from 'antd';
import AppHeader from './AppHeader';
import SidebarMenu from './SidebarMenu';
import { useState } from 'react';

const { Sider, Content } = Layout;

interface SupervisorLayoutProps {
  children: React.ReactNode;
  userName?: string;
  onLogout?: () => void;
}

export const SupervisorLayout: React.FC<SupervisorLayoutProps> = ({
  children,
  userName = 'Supervisor',
  onLogout,
}) => {
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
            boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
            overflow: 'auto',
          }}
        >
          <SidebarMenu role="supervisor" collapsed={collapsed} />
        </Sider>
        <Content
          style={{
            padding: '24px',
            background: '#f5f5f5',
            overflowY: 'auto',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default SupervisorLayout;
