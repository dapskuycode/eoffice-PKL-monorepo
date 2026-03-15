'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminFakultasService } from '@/services/adminFakultasService';
import AdminFakultasLayout from '@/components/layout/AdminFakultasLayout';

function getStatusDisplay(status: string) {
  // Status label and color mapping
  const statusMap: Record<string, { label: string; color: string }> = {
    'DRAFT': { label: 'Draft', color: 'text-gray-600' },
    'SUBMITTED': { label: 'Diajukan', color: 'text-yellow-600' },
    'VERIFIED_ADMIN': { label: 'Terverifikasi Admin', color: 'text-blue-600' },
    'APPROVED_KAPRODI': { label: 'Disetujui Kaprodi', color: 'text-purple-600' },
    'REGISTERING': { label: 'Menunggu Registrasi', color: 'text-indigo-600' },
    // Semua status setelah REGISTERED ditampilkan sebagai "Selesai" untuk Admin Fakultas
    'REGISTERED': { label: 'Selesai', color: 'text-green-700' },
    'APPROVED_SUPERVISOR': { label: 'Selesai', color: 'text-green-700' },
    'SIAP_CETAK': { label: 'Selesai', color: 'text-green-700' },
    'STEP_KONVENSIONAL': { label: 'Selesai', color: 'text-green-700' },
    'COMPLETED': { label: 'Selesai', color: 'text-green-700' },
    'REVISI': { label: 'Perlu Revisi', color: 'text-orange-600' }
  };

  return statusMap[status] || { label: status, color: 'text-gray-600' };
}

export default function AdminFakultasDashboard() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [letters, setLetters] = useState<any[]>([]);
  const [allLetters, setAllLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      console.log('=== FETCHING ADMIN FAKULTAS DASHBOARD ===');
      const data = await adminFakultasService.getDashboard();

      console.log('Dashboard data received:', data);
      console.log('Pengajuan count:', data?.pengajuan?.length);
      console.log('All pengajuan statuses:', data?.pengajuan?.map((p: any) => ({ id: p.id.substring(0, 8), status: p.status })));

      if (data && data.pengajuan) {
        console.log('First pengajuan:', data.pengajuan[0]);

        const formattedLetters = data.pengajuan
          .map((pengajuan: any) => {
            const statusDisplay = getStatusDisplay(pengajuan.status);
            // Prioritas: namaSementara (data yang diisi mahasiswa) > user.name (data master)
            const namaDisplay = pengajuan.namaSementara || pengajuan.mahasiswa?.user?.name || 'Unknown';
            return {
              id: pengajuan.id,
              id_display: pengajuan.nomorSkl || `#${pengajuan.id.substring(0, 8)}`,
              sumber: 'Internal',
              pengusul: namaDisplay,
              nim: pengajuan.mahasiswa?.nim || '-',
              perihal: 'Surat Keterangan Lulus',
              tanggal: new Date(pengajuan.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              }),
              programStudi: pengajuan.mahasiswa?.programStudi?.name || '-',
              status: statusDisplay.label,
              statusColor: statusDisplay.color,
              rawStatus: pengajuan.status
            };
          });

        console.log('Formatted letters:', formattedLetters);
        console.log('Status breakdown:', formattedLetters.map((l: any) => l.rawStatus));
        setAllLetters(formattedLetters);

        // Dashboard table only shows letters that need registration
        setLetters(formattedLetters.filter((l: any) => l.rawStatus === 'REGISTERING'));
      } else {
        console.log('No pengajuan data received');
        setLetters([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLetters([]);
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const filteredLetters = letters.filter(letter =>
    letter.pengusul.toLowerCase().includes(searchTerm.toLowerCase()) ||
    letter.perihal.toLowerCase().includes(searchTerm.toLowerCase()) ||
    letter.id_display.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredLetters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLetters = filteredLetters.slice(startIndex, endIndex);
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const stats = {
    perluTindakan: allLetters.filter(l =>
      l.rawStatus === 'REGISTERING'
    ).length,
    selesai: allLetters.filter(l =>
      ['REGISTERED', 'APPROVED_SUPERVISOR', 'SIAP_CETAK', 'STEP_KONVENSIONAL', 'COMPLETED'].includes(l.rawStatus)
    ).length,
    totalSurat: allLetters.length
  };

  return (
    <AdminFakultasLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Persuratan</h1>
        <p className="text-gray-600">Pusat kendali untuk mengelola semua surat Fakultas Sains dan Matematika.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Perlu Tindakan
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats.perluTindakan}</div>
            <p className="text-xs text-gray-500 mt-1">Surat belum diproses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Selesai (Bulan Ini)
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats.selesai}</div>
            <p className="text-xs text-gray-500 mt-1">Surat telah diselesaikan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Surat (Bulan Ini)
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats.totalSurat}</div>
            <p className="text-xs text-gray-500 mt-1">Total volume bulan ini</p>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Surat Perlu Tindakan</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari surat..."
                  className="px-4 py-2 border rounded-lg pr-10 text-sm"
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
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Memuat data...</p>
            </div>
          ) : letters.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Tidak ada data surat</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">NOMOR SURAT</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">JENIS SURAT</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">NAMA MAHASISWA</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">PERIHAL</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">TANGGAL PENGAJUAN</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">PROGRAM STUDI</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">STATUS</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentLetters.map((letter) => (
                      <tr key={letter.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-800">{letter.id_display}</td>
                        <td className="py-3 px-4">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {letter.sumber}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-800">{letter.pengusul}</div>
                          <div className="text-xs text-gray-500">{letter.nim}</div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800">{letter.perihal}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{letter.tanggal}</td>
                        <td className="py-3 px-4 text-sm text-gray-800">{letter.programStudi}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-medium ${letter.statusColor}`}>
                            ● {letter.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            className="p-1 hover:bg-gray-200 rounded"
                            onClick={() => router.push(`/admin-fakultas/surat/${letter.id}/review`)}
                          >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredLetters.length)} of {filteredLetters.length}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => goToPage(currentPage - 1)}
                  >
                    &lt;
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant="outline"
                      size="sm"
                      className={currentPage === page ? "bg-blue-600 text-white" : ""}
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => goToPage(currentPage + 1)}
                  >
                    &gt;
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </AdminFakultasLayout>
  );
}
