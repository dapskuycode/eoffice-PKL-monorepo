'use client';

import React from 'react';
import { Layout } from 'antd';
import AppHeader from './AppHeader';
import SidebarMenu from './SidebarMenu';
import { useState } from 'react';

const { Sider, Content } = Layout;

interface UPALayoutProps {
    children: React.ReactNode;
}

export const UPALayout: React.FC<UPALayoutProps> = ({ children }) => {
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
                        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <SidebarMenu role="upa" collapsed={collapsed} />
                </Sider>
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

export default UPALayout;
