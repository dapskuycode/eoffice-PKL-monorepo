'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { staffFakultasService } from '@/services/staffFakultasService';
import StaffFakultasLayout from '@/components/layout/StaffFakultasLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function getStatusDisplay(status: string) {
    const statusMap: Record<string, { label: string; color: string }> = {
        'DRAFT': { label: 'Draft', color: 'text-gray-600' },
        'SUBMITTED': { label: 'Diajukan', color: 'text-yellow-600' },
        'VERIFIED_ADMIN': { label: 'Terverifikasi Admin', color: 'text-blue-600' },
        'APPROVED_KAPRODI': { label: 'Disetujui Kaprodi', color: 'text-purple-600' },
        'REGISTERED': { label: 'Terdaftar', color: 'text-indigo-600' },
        'SIAP_CETAK': { label: 'Siap Cetak', color: 'text-yellow-700' },
        'STEP_KONVENSIONAL': { label: 'Selesai', color: 'text-green-700' },
        'COMPLETED': { label: 'Selesai', color: 'text-green-700' },
        'REVISI': { label: 'Perlu Revisi', color: 'text-orange-600' }
    };
    return statusMap[status] || { label: status, color: 'text-gray-600' };
}

export default function StafFakultasSemuaSurat() {
    const router = useRouter();
    const [pengajuan, setPengajuan] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const itemsPerPage = 10;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await staffFakultasService.getDashboard();
            setPengajuan(data.pengajuan || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPengajuan = pengajuan.filter(item => {
        const matchesSearch = (item.namaSementara || item.mahasiswa?.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.mahasiswa?.nim || '').toLowerCase().includes(searchTerm.toLowerCase());

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

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <StaffFakultasLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Semua Surat</h1>
                <p className="text-gray-600">Daftar seluruh riwayat pengajuan SKL di Staf Fakultas</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle>Riwayat Pengajuan</CardTitle>
                        <div className="flex flex-wrap gap-2">
                            <div className="flex items-center gap-2 border rounded-lg px-2 py-1 bg-white">
                                <span className="text-[10px] text-gray-500 uppercase font-bold">Dari:</span>
                                <input
                                    type="date"
                                    className="text-xs border-none outline-none bg-transparent font-medium text-gray-700"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                                <span className="text-[10px] text-gray-500 uppercase font-bold ml-1">Sampai:</span>
                                <input
                                    type="date"
                                    className="text-xs border-none outline-none bg-transparent font-medium text-gray-700"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                            <select
                                className="px-4 py-2 border rounded-lg text-sm bg-white font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                <option value="all">Semua Status</option>
                                <option value="REGISTERED">Terdaftar</option>
                                <option value="SIAP_CETAK">Siap Cetak</option>
                                <option value="COMPLETED">Selesai</option>
                                <option value="REVISI">Perlu Revisi</option>
                                <option value="DITOLAK">Ditolak</option>
                            </select>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Cari..."
                                    className="px-4 py-2 border rounded-lg text-sm pr-10 focus:ring-2 focus:ring-blue-500 outline-none transition-all w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <svg className="w-4 h-4 absolute right-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">NOMOR SURAT</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 text-center">JENIS SURAT</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">NAMA MAHASISWA</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">PERIHAL</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 text-center whitespace-nowrap">TANGGAL PENGAJUAN</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">PROGRAM STUDI</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">STATUS</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 text-center">AKSI</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="text-center py-12 text-gray-500 italic">
                                                    Tidak ada data yang ditemukan
                                                </td>
                                            </tr>
                                        ) : (
                                            currentItems.map((item) => {
                                                const statusDisplay = getStatusDisplay(item.status);
                                                const namaDisplay = item.namaSementara || item.mahasiswa?.user?.name || 'N/A';
                                                const idDisplay = item.nomorSkl || `#${item.id.substring(0, 8)}`;

                                                return (
                                                    <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                                                        <td className="py-3 px-4 text-sm text-gray-800">{idDisplay}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            <span className="text-[10px] uppercase font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-100">
                                                                Internal
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="text-sm font-bold text-gray-900">{namaDisplay}</div>
                                                            <div className="text-xs text-gray-500">{item.mahasiswa?.nim || '-'}</div>
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-gray-800">Surat Keterangan Lulus</td>
                                                        <td className="py-3 px-4 text-center text-sm text-gray-600">
                                                            {new Date(item.createdAt).toLocaleDateString('id-ID', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })}
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-gray-800">{item.mahasiswa?.programStudi?.name || 'N/A'}</td>
                                                        <td className="py-3 px-4 text-sm">
                                                            <span className={`text-xs font-bold ${statusDisplay.color}`}>
                                                                ● {statusDisplay.label}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <button
                                                                onClick={() => router.push(`/staff-fakultas/surat/${item.id}/review`)}
                                                                className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-gray-400"
                                                                title="Review Pengajuan"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6">
                                    <div className="text-sm text-gray-600">
                                        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredPengajuan.length)} of {filteredPengajuan.length}
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
                                                className={currentPage === page ? "bg-blue-600 text-white border-blue-600 shadow-sm" : ""}
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
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </StaffFakultasLayout>
    );
}
