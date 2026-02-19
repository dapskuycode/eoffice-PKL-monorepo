'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { manajerTuService } from '@/services/manajerTuService';
import ManajerTuLayout from '@/components/layout/ManajerTuLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ManajerTuDashboard() {
  const router = useRouter();
  const [pengajuan, setPengajuan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [perluTindakan, setPerluTindakan] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, startDate, endDate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await manajerTuService.getDashboard();
      setPengajuan(data.pengajuan);
      setPerluTindakan(data.perluTindakan);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatStatus = (status: string) => {
    if (status === 'STEP_KONVENSIONAL') {
      return 'Finalisasi Surat';
    }
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SUBMITTED: 'bg-blue-100 text-blue-800',
      VERIFIED_ADMIN: 'bg-cyan-100 text-cyan-800',
      APPROVED_KAPRODI: 'bg-indigo-100 text-indigo-800',
      REGISTERING: 'bg-purple-100 text-purple-800',
      REGISTERED: 'bg-violet-100 text-violet-800',
      APPROVED_SUPERVISOR: 'bg-green-100 text-green-800',
      SIAP_CETAK: 'bg-yellow-100 text-yellow-800',
      STEP_KONVENSIONAL: 'bg-orange-100 text-orange-800',
      COMPLETED: 'bg-emerald-100 text-emerald-800',
      REVISI: 'bg-orange-100 text-orange-800',
      DITOLAK: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredPengajuan = pengajuan.filter(item => {
    const matchesSearch = (item.namaSementara || item.mahasiswa?.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.mahasiswa?.nim || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.mahasiswa?.programStudi?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;

    let matchesDate = true;
    if (startDate || endDate) {
      const letterDate = new Date(item.createdAt);
      if (startDate) {
        const sDate = new Date(startDate);
        sDate.setHours(0, 0, 0, 0);
        if (letterDate < sDate) matchesDate = false;
      }
      if (endDate) {
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);
        if (letterDate > eDate) matchesDate = false;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPengajuan.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPengajuan.length / itemsPerPage);

  return (
    <ManajerTuLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Manajer TU</h1>
        <p className="text-gray-600">Kelola pengajuan Surat Keterangan Lulus</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Pengajuan</CardTitle>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pengajuan.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Perlu Tindakan</CardTitle>
            <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{perluTindakan}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Status Aktif</CardTitle>
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {pengajuan.filter(p => p.status !== 'COMPLETED' && p.status !== 'DITOLAK').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Daftar Seluruh Pengajuan SKL</CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white">
                <span className="text-xs text-gray-500 whitespace-nowrap">Dari:</span>
                <input
                  type="date"
                  className="text-xs border-none outline-none bg-transparent"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <span className="text-xs text-gray-500 whitespace-nowrap">Sampai:</span>
                <input
                  type="date"
                  className="text-xs border-none outline-none bg-transparent"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 border rounded-lg text-sm bg-white"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value="APPROVED_SUPERVISOR">Perlu Verifikasi</option>
                <option value="SIAP_CETAK">Siap Cetak</option>
                <option value="STEP_KONVENSIONAL">Finalisasi Surat</option>
                <option value="COMPLETED">Selesai</option>
                <option value="DITOLAK">Ditolak</option>
              </select>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari mahasiswa/NIM..."
                  className="px-4 py-2 border rounded-lg pr-10 text-sm w-48 md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="w-4 h-4 absolute right-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold text-gray-700">No</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Nama Mahasiswa</th>
                      <th className="text-left p-4 font-semibold text-gray-700">NIM</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Program Studi</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Tanggal Pengajuan</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-500">
                          Tidak ada pengajuan
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((item, index) => {
                        // Prioritas: namaSementara (data yang diisi mahasiswa) > user.name (data master)
                        const namaDisplay = item.namaSementara || item.mahasiswa?.user?.name || 'N/A';
                        return (
                          <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">{indexOfFirstItem + index + 1}</td>
                            <td className="p-4 font-medium">{namaDisplay}</td>
                            <td className="p-4">{item.mahasiswa?.nim || 'N/A'}</td>
                            <td className="p-4">{item.mahasiswa?.programStudi?.nama || 'N/A'}</td>
                            <td className="p-4">
                              {new Date(item.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                {formatStatus(item.status)}
                              </span>
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => router.push(`/manajer-tu/surat/${item.id}/review`)}
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                title="Lihat Detail"
                              >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        )
                      }
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredPengajuan.length)} dari {filteredPengajuan.length} pengajuan
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sebelumnya
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 border rounded-lg ${currentPage === page
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-gray-50'
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Berikutnya
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </ManajerTuLayout>
  );
}
