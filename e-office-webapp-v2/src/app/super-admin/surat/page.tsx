'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Trash2 } from 'lucide-react';
import { API_URL } from '@/lib/api';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  SUBMITTED: { label: 'Diajukan', color: 'bg-yellow-100 text-yellow-800' },
  VERIFIED_ADMIN: { label: 'Diverifikasi Admin', color: 'bg-blue-100 text-blue-800' },
  APPROVED_KAPRODI: { label: 'Disetujui Kaprodi', color: 'bg-blue-100 text-blue-800' },
  REGISTERING: { label: 'Registering', color: 'bg-purple-100 text-purple-800' },
  REGISTERED: { label: 'Terdaftar', color: 'bg-purple-100 text-purple-800' },
  APPROVED_SUPERVISOR: { label: 'Disetujui Supervisor', color: 'bg-green-100 text-green-800' },
  SIAP_CETAK: { label: 'Siap Cetak', color: 'bg-green-100 text-green-800' },
  COMPLETED: { label: 'Selesai', color: 'bg-green-100 text-green-800' },
  REVISI: { label: 'Revisi', color: 'bg-orange-100 text-orange-800' },
  DITOLAK: { label: 'Ditolak', color: 'bg-red-100 text-red-800' },
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function SuratPage() {
  const router = useRouter();
  const [surat, setSurat] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadSurat();
  }, [currentPage, filterStatus]);

  const loadSurat = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/super-admin/surat?page=${currentPage}&limit=10`;
      if (filterStatus) url += `&status=${filterStatus}`;

      const response = await fetch(url, { credentials: 'include' });

      if (response.ok) {
        const data = await response.json();
        setSurat(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading surat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus data surat ini?')) return;

    try {
      const response = await fetch(`${API_URL}/super-admin/surat/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        loadSurat();
      }
    } catch (error) {
      console.error('Error deleting surat:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = STATUS_MAP[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <AppHeader greetingOnly={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Data Surat</h1>
          <p className="mt-2 text-gray-600">Lihat dan kelola data surat SKL</p>
        </div>

        {/* Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Status</option>
                {Object.entries(STATUS_MAP).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Surat SKL ({surat.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Nomor SKL</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Mahasiswa</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">NIM</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Prodi</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Tanggal</th>
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
                  ) : surat.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500">
                        Tidak ada data surat
                      </td>
                    </tr>
                  ) : (
                    surat.map((s) => (
                      <tr key={s.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono">{s.nomorSkl || '-'}</td>
                        <td className="py-3 px-4">{s.mahasiswa?.user?.name || s.namaSementara || '-'}</td>
                        <td className="py-3 px-4">{s.mahasiswa?.nim || '-'}</td>
                        <td className="py-3 px-4">{s.mahasiswa?.programStudi?.name || '-'}</td>
                        <td className="py-3 px-4">{getStatusBadge(s.status)}</td>
                        <td className="py-3 px-4">
                          {new Date(s.createdAt).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(s.id)}
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
    </div>
  );
}
