'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, GraduationCap, FileText } from 'lucide-react';
import { API_URL } from '@/lib/api';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalMahasiswa: 0,
    totalPegawai: 0,
    totalProdi: 0,
    totalSurat: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/super-admin/dashboard/stats`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      title: 'Data Mahasiswa',
      description: 'Kelola data mahasiswa sistem',
      icon: GraduationCap,
      count: stats.totalMahasiswa,
      path: '/super-admin/mahasiswa',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Data Pegawai',
      description: 'Kelola data pegawai sistem',
      icon: Users,
      count: stats.totalPegawai,
      path: '/super-admin/pegawai',
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Data Program Studi',
      description: 'Kelola data program studi',
      icon: Briefcase,
      count: stats.totalProdi,
      path: '/super-admin/prodi',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Data Surat',
      description: 'Lihat dan kelola data surat',
      icon: FileText,
      count: stats.totalSurat,
      path: '/super-admin/surat',
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <AppHeader greetingOnly={true} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Super Admin</h1>
          <p className="mt-2 text-gray-600">
            Kelola master data sistem e-Office
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card 
              key={index}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(item.path)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${item.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : item.count}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {item.description}
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-4"
                >
                  Kelola Data →
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/super-admin/mahasiswa?action=add')}
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              Tambah Mahasiswa
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/super-admin/pegawai?action=add')}
            >
              <Users className="h-4 w-4 mr-2" />
              Tambah Pegawai
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/super-admin/prodi?action=add')}
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Tambah Prodi
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/super-admin/surat')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Lihat Semua Surat
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}