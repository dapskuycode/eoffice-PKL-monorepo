'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Briefcase, GraduationCap, FileText, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/super-admin/dashboard',
    },
    {
      title: 'Mahasiswa',
      icon: GraduationCap,
      path: '/super-admin/mahasiswa',
    },
    {
      title: 'Pegawai',
      icon: Users,
      path: '/super-admin/pegawai',
    },
    {
      title: 'Program Studi',
      icon: Briefcase,
      path: '/super-admin/prodi',
    },
    {
      title: 'Surat',
      icon: FileText,
      path: '/super-admin/surat',
    },
  ];

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      logout();
    }
  };


  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-[calc(100vh-4rem)] top-16 z-10">
        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors
                  ${isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
}
