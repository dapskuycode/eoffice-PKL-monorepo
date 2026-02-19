'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppHeader from '@/components/AppHeader';
import { authService } from '@/services/authService';
import { useState } from 'react';
import {
  GraduationCap,
  UserCheck,
  Building2,
  Shield,
  Briefcase,
  FileText,
  UserCog,
  Award,
  Settings
} from 'lucide-react';

const roleCards = [
  {
    role: 'mahasiswa',
    title: 'Mahasiswa',
    description: 'Portal untuk mahasiswa mengajukan surat dan melihat status permohonan',
    icon: GraduationCap,
    path: '/mahasiswa',
    hasLoginPage: true, // Hanya mahasiswa yang punya login page
    color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    iconColor: 'text-blue-600',
  },
  {
    role: 'admin_prodi',
    title: 'Admin Prodi',
    description: 'Kelola permohonan surat mahasiswa di tingkat program studi',
    icon: UserCog,
    path: '/admin-prodi/dashboard',
    hasLoginPage: false,
    color: 'bg-purple-50 border-purple-200 hover:border-purple-400',
    iconColor: 'text-purple-600',
  },
  {
    role: 'ketua_prodi',
    title: 'Ketua Prodi',
    description: 'Verifikasi dan persetujuan surat mahasiswa program studi',
    icon: UserCheck,
    path: '/ketua-prodi/dashboard',
    hasLoginPage: false,
    color: 'bg-green-50 border-green-200 hover:border-green-400',
    iconColor: 'text-green-600',
  },
  {
    role: 'admin_fakultas',
    title: 'Admin Fakultas',
    description: 'Administrasi dan pengelolaan surat di tingkat fakultas',
    icon: Building2,
    path: '/admin-fakultas/dashboard',
    hasLoginPage: false,
    color: 'bg-amber-50 border-amber-200 hover:border-amber-400',
    iconColor: 'text-amber-600',
  },
  {
    role: 'supervisor',
    title: 'Supervisor',
    description: 'Monitor dan supervisi seluruh proses persuratan',
    icon: Shield,
    path: '/supervisor/dashboard',
    hasLoginPage: false,
    color: 'bg-red-50 border-red-200 hover:border-red-400',
    iconColor: 'text-red-600',
  },
  {
    role: 'manajer_tu',
    title: 'Manajer TU',
    description: 'Verifikasi final dan koordinasi tata usaha fakultas',
    icon: Briefcase,
    path: '/manajer-tu/dashboard',
    hasLoginPage: false,
    color: 'bg-teal-50 border-teal-200 hover:border-teal-400',
    iconColor: 'text-teal-600',
  },
  {
    role: 'staff_fakultas',
    title: 'Staf Fakultas',
    description: 'Penerbitan nomor surat dan administrasi fakultas',
    icon: FileText,
    path: '/staff-fakultas/dashboard',
    hasLoginPage: false,
    color: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400',
    iconColor: 'text-indigo-600',
  },
  {
    role: 'upa',
    title: 'UPA',
    description: 'Finalisasi dan penerbitan nomor SKL resmi',
    icon: Award,
    path: '/upa/dashboard',
    hasLoginPage: false,
    color: 'bg-rose-50 border-rose-200 hover:border-rose-400',
    iconColor: 'text-rose-600',
  },
  {
    role: 'super_admin',
    title: 'Super Admin',
    description: 'Kelola master data sistem: mahasiswa, pegawai, prodi, dan surat',
    icon: Settings,
    path: '/super-admin/dashboard',
    hasLoginPage: false,
    color: 'bg-slate-50 border-slate-200 hover:border-slate-400',
    iconColor: 'text-slate-600',
  },
];

export default function DevPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleRoleClick = async (card: typeof roleCards[0]) => {
    setIsLoading(card.role);

    try {
      // Auto-login untuk role ini
      const result = await authService.autoLogin(card.role);

      if (result && result.user) {
        console.log('Auto-login success for', card.role, result.user);
        // Redirect ke dashboard role tersebut
        router.push(card.path);
      } else {
        alert('Login gagal. Silakan coba lagi.');
        setIsLoading(null);
      }
    } catch (error) {
      console.error('Auto-login error:', error);
      alert('Terjadi kesalahan saat login. Silakan coba lagi.');
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AppHeader />

      <div className="container mx-auto px-4 py-12" style={{ paddingTop: '96px' }}>
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Sistem E-Office FSM UNDIP
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Portal terpadu pengelolaan persuratan dan administrasi Fakultas Sains dan Matematika
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roleCards.map((card) => {
              const IconComponent = card.icon;
              const isCardLoading = isLoading === card.role;

              return (
                <Card
                  key={card.role}
                  className={`${card.color} border-2 transition-all duration-200 hover:shadow-lg cursor-pointer group ${isCardLoading ? 'opacity-50' : ''}`}
                  onClick={() => !isLoading && handleRoleClick(card)}
                >
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${card.iconColor} bg-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      {isCardLoading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
                      ) : (
                        <IconComponent className="w-6 h-6" />
                      )}
                    </div>
                    <CardTitle className="text-xl text-slate-800">
                      {card.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      {card.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="ghost"
                      className="w-full group-hover:bg-white/50"
                      disabled={isCardLoading}
                    >
                      {isCardLoading ? 'Loading...' : 'Akses Portal →'}
                    </Button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Auto Login (Dev Mode)
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-white rounded-lg shadow-sm px-6 py-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              🔧 <strong>Development Mode:</strong> Auto-login aktif
            </p>
            <p className="text-xs text-gray-500">
              Klik card untuk langsung masuk ke dashboard setiap role
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
