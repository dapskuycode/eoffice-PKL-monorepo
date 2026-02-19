'use client';

import React from 'react';
import { Menu } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  HomeOutlined,
  FileTextOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  UserOutlined,
  BarChartOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { cn } from '@/lib/utils';
import { Modal } from 'antd';

interface SidebarMenuProps {
  role: 'mahasiswa' | 'admin_prodi' | 'ketua_prodi' | 'admin_fakultas' | 'supervisor' | 'upa' | 'manajer_tu' | 'staff_fakultas';
  collapsed: boolean;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ role, collapsed }) => {
  const router = useRouter();
  const pathname = usePathname();

  const { logout } = useAuth();
  const menuItems: Record<string, any[]> = {
    mahasiswa: [
      {
        key: 'dashboard',
        icon: <HomeOutlined />,
        label: 'Dashboard',
        onClick: () => router.push('/mahasiswa/dashboard'),
      },
      {
        key: 'portal',
        icon: <FileTextOutlined />,
        label: 'Portal Persuratan',
        onClick: () => router.push('/mahasiswa/portal'),
      },
      {
        key: 'riwayat',
        icon: <HistoryOutlined />,
        label: 'Riwayat Surat',
        onClick: () => router.push('/mahasiswa/riwayat'),
      },
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: 'Profile',
        onClick: () => router.push('/mahasiswa/profile'),
      },
    ],
    admin_prodi: [
      {
        key: 'dashboard',
        icon: <HomeOutlined />,
        label: 'Dashboard',
        onClick: () => router.push('/admin-prodi/dashboard'),
      },
      {
        key: 'semua-surat',
        icon: <FileTextOutlined />,
        label: 'Semua Surat',
        onClick: () => router.push('/admin-prodi/semua-surat'),
      },
    ],
    ketua_prodi: [
      {
        key: 'dashboard',
        icon: <HomeOutlined />,
        label: 'Dashboard',
        onClick: () => router.push('/ketua-prodi/dashboard'),
      },
      {
        key: 'semua-surat',
        icon: <HistoryOutlined />,
        label: 'Semua Surat',
        onClick: () => router.push('/ketua-prodi/semua-surat'),
      },
    ],
    admin_fakultas: [
      {
        key: 'dashboard',
        icon: <HomeOutlined />,
        label: 'Dashboard',
        onClick: () => router.push('/admin-fakultas/dashboard'),
      },
      {
        key: 'semua-surat',
        icon: <FileTextOutlined />,
        label: 'Semua Surat',
        onClick: () => router.push('/admin-fakultas/semua-surat'),
      },
    ],
    supervisor: [
      {
        key: 'dashboard',
        icon: <HomeOutlined />,
        label: 'Dashboard',
        onClick: () => router.push('/supervisor/dashboard'),
      },
      {
        key: 'semua-surat',
        icon: <HistoryOutlined />,
        label: 'Semua Surat',
        onClick: () => router.push('/supervisor/semua-surat'),
      },
    ],
    upa: [
      {
        key: 'dashboard',
        icon: <HomeOutlined />,
        label: 'Dashboard',
        onClick: () => router.push('/upa/dashboard'),
      },
      {
        key: 'semua-surat',
        icon: <HistoryOutlined />,
        label: 'Semua Surat',
        onClick: () => router.push('/upa/semua-surat'),
      },
    ],
    manajer_tu: [
      {
        key: 'dashboard',
        icon: <HomeOutlined />,
        label: 'Dashboard',
        onClick: () => router.push('/manajer-tu/dashboard'),
      },
    ],
    staff_fakultas: [
      {
        key: 'dashboard',
        icon: <HomeOutlined />,
        label: 'Dashboard',
        onClick: () => router.push('/staff-fakultas/dashboard'),
      },
      {
        key: 'semua-surat',
        icon: <HistoryOutlined />,
        label: 'Semua Surat',
        onClick: () => router.push('/staff-fakultas/semua-surat'),
      },
    ],
  };

  const handleLogout = () => {
    Modal.confirm({
      title: 'Konfirmasi Logout',
      content: 'Apakah Anda yakin ingin keluar dari sistem?',
      okText: 'Logout',
      cancelText: 'Batal',
      okButtonProps: { danger: true, className: 'rounded-xl font-bold font-sans' },
      cancelButtonProps: { className: 'rounded-xl font-bold font-sans' },
      centered: true,
      onOk: () => logout(),
    });
  };

  // Get selected key based on current pathname
  const getSelectedKey = () => {
    if (!pathname) return 'dashboard';
    if (pathname.includes('/semua-surat')) return 'semua-surat';
    if (pathname.includes('/dashboard')) return 'dashboard';
    if (pathname.includes('/portal')) return 'portal';
    if (pathname.includes('/profile')) return 'profile';
    if (pathname.includes('/form')) return 'form';
    if (pathname.includes('/riwayat')) return 'riwayat';
    if (pathname.includes('/pengajuan')) return 'pengajuan';
    if (pathname.includes('/persetujuan')) return 'persetujuan';
    if (pathname.includes('/laporan')) return 'laporan';
    return 'dashboard';
  };

  const currentItems = menuItems[role as string] || [];
  const selectedKey = getSelectedKey();

  return (
    <div className="h-full bg-white py-6 flex flex-col">
      <div className="flex-1 px-4">
        {/* Navigation Header */}
        <div className="px-2 mb-8">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-xl shadow-blue-500/20">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white border border-white/10">
              <HomeOutlined className="text-xl" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-blue-100 uppercase tracking-widest leading-none mb-1">E-Office</div>
              <div className="text-sm font-black text-white leading-none uppercase">{role.replace('_', ' ')}</div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="space-y-1.5">
          {currentItems.map((item) => {
            const active = selectedKey === item.key;
            return (
              <div
                key={item.key}
                onClick={item.onClick}
                className={cn(
                  "group flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all cursor-pointer border border-transparent",
                  active
                    ? "bg-blue-50 text-blue-700 border-blue-100 shadow-sm shadow-blue-500/5"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <span className={cn(
                  "text-lg transition-transform group-hover:scale-110",
                  active ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500"
                )}>
                  {item.icon}
                </span>
                <span className="text-sm tracking-tight">{item.label}</span>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="px-4 mt-auto">
        <div
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-rose-500 hover:bg-rose-50 transition-all cursor-pointer group mb-2"
        >
          <span className="text-lg group-hover:scale-110 transition-transform">
            <LogoutOutlined />
          </span>
          <span className="text-sm tracking-tight">Logout</span>
        </div>
      </div>
    </div>
  );
};

export default SidebarMenu;
