import React from 'react';
import { Menu, Layout } from 'antd';
import {
  ShareAltOutlined,
  CopyOutlined,
  FolderOutlined,
  MailOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

interface SidebarProps {
  selectedKey?: string;
  onMenuClick?: (key: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedKey = 'pusat-masuk',
  onMenuClick,
}) => {
  const menuItems: MenuItem[] = [
    {
      key: 'dashboard',
      icon: <span className="material-icons" style={{ fontSize: '20px' }}>dashboard</span>,
      label: <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 400 }}>Dasbor</span>,
    },
    {
      key: 'surat-masuk',
      icon: <span className="material-icons" style={{ fontSize: '20px' }}>inbox</span>,
      label: <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 400 }}>Surat Masuk</span>,
      children: [
        {
          key: 'penerima',
          label: <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 400 }}>Penerima</span>,
        },
        {
          key: 'disposisi',
          // icon: <ShareAltOutlined style={{ fontSize: '16px' }} />,
          label: <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 400 }}>Disposisi</span>,
        },
        {
          key: 'tembusaan',
          // icon: <CopyOutlined style={{ fontSize: '16px' }} />,
          label: <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 400 }}>Tembusaan</span>,
        },
        {
          key: 'arsip',
          // icon: <FolderOutlined style={{ fontSize: '16px' }} />,
          label: <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 400 }}>Arsip</span>,
        },
      ],
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (onMenuClick) {
      onMenuClick(e.key);
    }
  };

  return (
    <Sider
      width={240}
      theme="light"
      style={{
        overflow: 'auto',
        height: 'calc(100vh - 64px)',
        position: 'sticky',
        left: 0,
        top: 64,
        bottom: 0,
        borderRight: '1px solid #f0f0f0',
        fontFamily: 'Poppins, sans-serif',
      }}
      collapsible={false}
    >
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        defaultOpenKeys={['surat-masuk']}
        onClick={handleMenuClick}
        items={menuItems}
        style={{ 
          borderRight: 0, 
          paddingTop: 8,
          fontFamily: 'Poppins, sans-serif',
        }}
      />
    </Sider>
  );
};

export default Sidebar;