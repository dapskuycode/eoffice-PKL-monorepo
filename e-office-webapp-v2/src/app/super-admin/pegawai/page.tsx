'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { API_URL } from '@/lib/api';

export default function PegawaiPage() {
  const router = useRouter();
  const [pegawai, setPegawai] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPegawai, setSelectedPegawai] = useState<any>(null);

  useEffect(() => {
    loadRoles();
    loadPegawai();
  }, [currentPage, searchTerm, filterRole]);

  const loadRoles = async () => {
    try {
      const response = await fetch(`${API_URL}/master/role`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // Handle both array and {data: array} formats
        const rolesArray = Array.isArray(data) ? data : (data.data || []);
        setRoles(rolesArray);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      setRoles([]);
    }
  };

  const loadPegawai = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/super-admin/pegawai?page=${currentPage}&limit=10`;
      if (searchTerm) url += `&search=${searchTerm}`;
      if (filterRole) url += `&roleId=${filterRole}`;

      const response = await fetch(url, { credentials: 'include' });

      if (response.ok) {
        const data = await response.json();
        setPegawai(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading pegawai:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (peg: any) => {
    setSelectedPegawai(peg);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedPegawai) return;

    try {
      const response = await fetch(`${API_URL}/super-admin/pegawai/${selectedPegawai.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setSelectedPegawai(null);
        loadPegawai();
      }
    } catch (error) {
      console.error('Error deleting pegawai:', error);
    }
  };

  const getRoleNames = (userRole: any[]) => {
    if (!userRole || userRole.length === 0) return '-';
    return userRole.map(ur => ur.role?.name).filter(Boolean).join(', ');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <AppHeader greetingOnly={true} />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data Pegawai</h1>
            <p className="mt-2 text-gray-600">Kelola data pegawai sistem</p>
          </div>
          <Button onClick={() => router.push('/super-admin/pegawai/add')}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Pegawai
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cari Pegawai
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="NIP, Nama, atau Jabatan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Role</option>
                  {roles
                    .filter((role) => role.name !== 'mahasiswa' && role.name !== 'admin_surat')
                    .map((role) => {
                      // Format role name untuk display
                      const displayName = role.name
                        .replace(/_/g, ' ')
                        .split(' ')
                        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');

                      return (
                        <option key={role.id} value={role.id}>
                          {displayName}
                        </option>
                      );
                    })}
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterRole('');
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
            <CardTitle>Daftar Pegawai ({pegawai.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">NIP</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Nama</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Jabatan</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Program Studi</th>
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
                  ) : pegawai.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500">
                        Tidak ada data pegawai
                      </td>
                    </tr>
                  ) : (
                    pegawai.map((peg) => (
                      <tr key={peg.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">{peg.nip}</td>
                        <td className="py-3 px-4 text-sm font-medium">{peg.user?.name || '-'}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{peg.user?.email || '-'}</td>
                        <td className="py-3 px-4 text-sm">{peg.jabatan || '-'}</td>
                        <td className="py-3 px-4 text-sm">{getRoleNames(peg.user?.userRole)}</td>
                        <td className="py-3 px-4 text-sm">{peg.programStudi?.name || '-'}</td>
                        <td className="py-3 px-4 text-sm">{peg.noHp || '-'}</td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => router.push(`/super-admin/pegawai/edit/${peg.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => openDeleteModal(peg)}
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
                Yakin ingin menghapus data pegawai ini?
              </p>
              {selectedPegawai && (
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <p className="text-sm text-gray-600">NIP: {selectedPegawai.nip}</p>
                  <p className="text-sm text-gray-600">Nama: {selectedPegawai.user?.name}</p>
                  <p className="text-sm text-gray-600">Jabatan: {selectedPegawai.jabatan}</p>
                  <p className="text-sm text-gray-600">Prodi: {selectedPegawai.programStudi?.name}</p>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedPegawai(null);
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
