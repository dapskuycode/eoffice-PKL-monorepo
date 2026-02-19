'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

export default function MahasiswaPage() {
  const router = useRouter();
  const [mahasiswa, setMahasiswa] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProdi, setFilterProdi] = useState('');
  const [filterTahun, setFilterTahun] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [prodi, setProdi] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState<any>(null);

  useEffect(() => {
    loadProdi();
    loadMahasiswa();
  }, [currentPage, searchTerm, filterProdi, filterTahun]);

  const loadProdi = async () => {
    try {
      const response = await fetch('http://localhost:3001/super-admin/prodi?limit=100', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setProdi(data.data || []);
      }
    } catch (error) {
      console.error('Error loading prodi:', error);
    }
  };

  const loadMahasiswa = async () => {
    try {
      setLoading(true);
      let url = `http://localhost:3001/super-admin/mahasiswa?page=${currentPage}&limit=10`;
      if (searchTerm) url += `&search=${searchTerm}`;
      if (filterProdi) url += `&prodiId=${filterProdi}`;
      if (filterTahun) url += `&tahun=${filterTahun}`;

      const response = await fetch(url, { credentials: 'include' });

      if (response.ok) {
        const data = await response.json();
        setMahasiswa(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading mahasiswa:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (mhs: any) => {
    setSelectedMahasiswa(mhs);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedMahasiswa) return;

    try {
      const response = await fetch(`http://localhost:3001/super-admin/mahasiswa/${selectedMahasiswa.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setSelectedMahasiswa(null);
        loadMahasiswa();
      }
    } catch (error) {
      console.error('Error deleting mahasiswa:', error);
    }
  };

  // Remove getTahunAngkatan - use tahunMasuk from database instead

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <AppHeader greetingOnly={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data Mahasiswa</h1>
            <p className="mt-2 text-gray-600">Kelola data mahasiswa sistem</p>
          </div>
          <Button onClick={() => router.push('/super-admin/mahasiswa/add')}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Mahasiswa
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cari Mahasiswa
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="NIM atau Nama..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program Studi
                </label>
                <select
                  value={filterProdi}
                  onChange={(e) => setFilterProdi(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Prodi</option>
                  {prodi.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tahun Angkatan
                </label>
                <Input
                  type="number"
                  placeholder="Contoh: 2023"
                  value={filterTahun}
                  onChange={(e) => setFilterTahun(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterProdi('');
                    setFilterTahun('');
                  }}
                  className="w-full"
                >
                  Reset Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Mahasiswa ({mahasiswa.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">NIM</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Nama</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Program Studi</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Tahun</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">No HP</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : mahasiswa.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500">
                        Tidak ada data mahasiswa
                      </td>
                    </tr>
                  ) : (
                    mahasiswa.map((mhs) => (
                      <tr key={mhs.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{mhs.nim}</td>
                        <td className="py-3 px-4">{mhs.user?.name || '-'}</td>
                        <td className="py-3 px-4">{mhs.user?.email || '-'}</td>
                        <td className="py-3 px-4">{mhs.programStudi?.name || '-'}</td>
                        <td className="py-3 px-4">{mhs.tahunMasuk || '-'}</td>
                        <td className="py-3 px-4">{mhs.noHp || '-'}</td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => router.push(`/super-admin/mahasiswa/edit/${mhs.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => openDeleteModal(mhs)}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
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
                Yakin ingin menghapus data mahasiswa ini?
              </p>
              {selectedMahasiswa && (
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <p className="text-sm text-gray-600">NIM: {selectedMahasiswa.nim}</p>
                  <p className="text-sm text-gray-600">Nama: {selectedMahasiswa.user?.name}</p>
                  <p className="text-sm text-gray-600">Prodi: {selectedMahasiswa.programStudi?.name}</p>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedMahasiswa(null);
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
