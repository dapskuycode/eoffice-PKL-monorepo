'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supervisorService } from '@/services/supervisorService';
import { FileTextOutlined, HomeOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import SidebarMenu from '@/components/layout/SidebarMenu';
import SupervisorLayout from '@/components/layout/SupervisorLayout';

function getStatusDisplay(status: string) {
    const statusMap: Record<string, { label: string; color: string }> = {
        'DRAFT': { label: 'Draft', color: 'text-gray-600' },
        'SUBMITTED': { label: 'Diajukan', color: 'text-yellow-600' },
        'VERIFIED_ADMIN': { label: 'Terverifikasi Admin', color: 'text-blue-600' },
        'APPROVED_KAPRODI': { label: 'Disetujui Kaprodi', color: 'text-purple-600' },
        'REGISTERING': { label: 'Proses Registrasi', color: 'text-indigo-600' },
        'REGISTERED': { label: 'Belum Diverifikasi', color: 'text-yellow-600' },
        'APPROVED_SUPERVISOR': { label: 'Selesai', color: 'text-green-700' },
        'SIAP_CETAK': { label: 'Selesai', color: 'text-green-700' },
        'STEP_KONVENSIONAL': { label: 'Selesai', color: 'text-green-700' },
        'COMPLETED': { label: 'Selesai', color: 'text-green-700' },
        'DITOLAK': { label: 'Selesai (Ditolak)', color: 'text-red-600' },
        'REVISI': { label: 'Selesai (Revisi)', color: 'text-orange-600' }
    };
    return statusMap[status] || { label: status, color: 'text-gray-600' };
}

export default function SupervisorSemuaSurat() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [letters, setLetters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const data = await supervisorService.getDashboard();
            if (data) {
                const formattedLetters = data.pengajuan.map((pengajuan: any) => {
                    const statusDisplay = getStatusDisplay(pengajuan.status);
                    const namaDisplay = pengajuan.namaSementara || pengajuan.mahasiswa?.user?.name || 'Unknown';
                    return {
                        id: pengajuan.id,
                        id_display: pengajuan.nomorSkl || `#${pengajuan.id.substring(0, 8)}`,
                        sumber: 'Pengajuan SKL',
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
                        rawStatus: pengajuan.status,
                        createdAt: pengajuan.createdAt
                    };
                });
                setLetters(formattedLetters);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLetters = letters.filter(letter => {
        const matchesSearch = letter.pengusul.toLowerCase().includes(searchTerm.toLowerCase()) ||
            letter.perihal.toLowerCase().includes(searchTerm.toLowerCase()) ||
            letter.id_display.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = selectedStatus === 'all' || letter.rawStatus === selectedStatus;

        let matchesDate = true;
        if (startDate || endDate) {
            const letterDate = new Date(letter.createdAt);
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

    const totalPages = Math.ceil(filteredLetters.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentLetters = filteredLetters.slice(startIndex, endIndex);

    return (
        <SupervisorLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Semua Surat</h1>
                <p className="text-gray-600">Telusuri seluruh riwayat pengajuan surat di lingkungan Fakultas Sains dan Matematika.</p>
            </div>

            {/* Table Section */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <CardTitle>Daftar Seluruh Surat</CardTitle>
                        <div className="flex flex-wrap gap-2">
                            <div className="flex items-center gap-2 border rounded-lg px-3 py-1 bg-white">
                                <span className="text-xs text-gray-500">Periode:</span>
                                <input
                                    type="date"
                                    className="text-sm border-none outline-none cursor-pointer"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                                <span className="text-gray-300">—</span>
                                <input
                                    type="date"
                                    className="text-sm border-none outline-none cursor-pointer"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                            <select
                                className="px-3 py-1 border rounded-lg text-sm bg-white cursor-pointer outline-none"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                <option value="all">Semua Status</option>
                                <option value="REGISTERED">Belum Diverifikasi</option>
                                <option value="APPROVED_SUPERVISOR">Selesai</option>
                                <option value="REVISI">Perlu Revisi</option>
                                <option value="DITOLAK">Ditolak</option>
                            </select>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Cari surat..."
                                    className="px-4 py-2 border rounded-lg pr-10 text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <SearchOutlined className="absolute right-3 top-3 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-4 text-gray-500">Memuat data...</p>
                            </div>
                        </div>
                    ) : filteredLetters.length === 0 ? (
                        <div className="text-center py-20">
                            <FileTextOutlined className="text-4xl text-gray-200 mb-4" />
                            <p className="text-gray-400">Tidak ada data surat yang ditemukan</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">ID/AGENDA</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">SUMBER</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">PENGUSUL/PEMOHON</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">PERIHAL</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">TANGGAL DITERIMA</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">PROGRAM STUDI</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">STATUS</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">AKSI</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentLetters.map((letter) => (
                                        <tr key={letter.id} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 text-sm text-gray-800">{letter.id_display}</td>
                                            <td className="py-3 px-4">
                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                    {letter.sumber}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-800">
                                                {letter.pengusul}
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
                                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                    onClick={() => router.push(`/supervisor/surat/${letter.id}`)}
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
                    )}

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4 pb-4">
                        <div className="text-sm text-gray-600">
                            Showing {startIndex + 1}-{Math.min(endIndex, filteredLetters.length)} of {filteredLetters.length}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            >
                                &lt;
                            </Button>
                            <div className="flex gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant="outline"
                                        size="sm"
                                        className={currentPage === page ? "bg-blue-600 text-white" : ""}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </Button>
                                ))}
                                {totalPages > 5 && <span className="flex items-end px-1 pb-1 text-gray-400">...</span>}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            >
                                &gt;
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </SupervisorLayout>
    );
}
