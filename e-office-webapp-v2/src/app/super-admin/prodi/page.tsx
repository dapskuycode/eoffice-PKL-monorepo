'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

export default function ProdiPage() {
  const router = useRouter();
  const [prodi, setProdi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProdi, setSelectedProdi] = useState<any>(null);

  useEffect(() => {
    loadProdi();
  }, [searchTerm]);

  const loadProdi = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/super-admin/prodi?limit=100', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        let prodiData = data.data || [];
        
        // Filter by search term
        if (searchTerm) {
          prodiData = prodiData.filter((p: any) =>
            p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.kode?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setProdi(prodiData);
      }
    } catch (error) {
      console.error('Error loading prodi:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (p: any) => {
    setSelectedProdi(p);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedProdi) return;
    
    try {
      const response = await fetch(`http://localhost:3001/super-admin/prodi/${selectedProdi.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        setShowDeleteModal(false);
        setSelectedProdi(null);
        loadProdi();
      }
    } catch (error) {
      console.error('Error deleting prodi:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <AppHeader greetingOnly={true} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data Program Studi</h1>
            <p className="mt-2 text-gray-600">Kelola data program studi</p>
          </div>
          <Button onClick={() => router.push('/super-admin/prodi/add')}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Program Studi
          </Button>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari Program Studi
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nama atau Kode Prodi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Program Studi ({prodi.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Kode</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Nama Program Studi</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Departemen</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : prodi.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-500">
                        Tidak ada data program studi
                      </td>
                    </tr>
                  ) : (
                    prodi.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono">{p.kode || '-'}</td>
                        <td className="py-3 px-4">{p.name}</td>
                        <td className="py-3 px-4">{p.departemen?.name || '-'}</td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => router.push(`/super-admin/prodi/edit/${p.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => openDeleteModal(p)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Konfirmasi Hapus</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Yakin ingin menghapus data program studi ini?
              </p>
              {selectedProdi && (
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <p className="text-sm text-gray-600">Kode: {selectedProdi.code}</p>
                  <p className="text-sm text-gray-600">Nama: {selectedProdi.name}</p>
                  <p className="text-sm text-gray-600">Departemen: {selectedProdi.departemen?.name}</p>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedProdi(null);
                  }}
                >
                  Batal
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Hapus
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
