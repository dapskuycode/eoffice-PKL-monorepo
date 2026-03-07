'use client';

import React from 'react';
import { Layout } from 'antd';
import AppHeader from './AppHeader';
import SidebarMenu from './SidebarMenu';
import { useState } from 'react';

const { Sider, Content } = Layout;

interface ManajerTuLayoutProps {
    children: React.ReactNode;
}

export const ManajerTuLayout: React.FC<ManajerTuLayoutProps> = ({ children }) => {
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
                    <SidebarMenu role="manajer_tu" collapsed={collapsed} />
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

export default ManajerTuLayout;
