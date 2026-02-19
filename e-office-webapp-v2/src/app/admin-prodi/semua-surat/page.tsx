'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminProdiService } from '@/services/adminProdiService';
import AdminProdiLayout from '@/components/layout/AdminProdiLayout';

function getStatusDisplay(status: string) {
    const statusMap: Record<string, { label: string; color: string }> = {
        'DRAFT': { label: 'Draft', color: 'text-gray-600' },
        'SUBMITTED': { label: 'Menunggu Verifikasi', color: 'text-yellow-600' },
        'VERIFIED_ADMIN': { label: 'Menunggu Ketua Prodi', color: 'text-blue-600' },
        'APPROVED_KAPRODI': { label: 'Disetujui Kaprodi', color: 'text-blue-600' },
        'REGISTERING': { label: 'Selesai', color: 'text-green-700' },
        'REGISTERED': { label: 'Selesai', color: 'text-green-700' },
        'APPROVED_SUPERVISOR': { label: 'Selesai', color: 'text-green-700' },
        'SIAP_CETAK': { label: 'Selesai', color: 'text-green-700' },
        'STEP_KONVENSIONAL': { label: 'Selesai', color: 'text-green-700' },
        'COMPLETED': { label: 'Selesai', color: 'text-green-700' },
        'DITOLAK': { label: 'Selesai (Ditolak)', color: 'text-red-600' },
        'REVISI': { label: 'Selesai (Revisi)', color: 'text-orange-600' }
    };
    return statusMap[status] || { label: status, color: 'text-gray-600' };
}

export default function AdminProdiSemuaSurat() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [letters, setLetters] = useState<any[]>([]);
    const [stats, setStats] = useState({ perluTindakan: 0, selesai: 0, totalSurat: 0 });
    const [loading, setLoading] = useState(true);
    const itemsPerPage = 10;

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const loadData = async () => {
        try {
            setLoading(true);
            const dashboardData = await adminProdiService.getDashboard();

            if (dashboardData) {
                const formattedLetters = dashboardData.pengajuan.map(pengajuan => {
                    const statusDisplay = getStatusDisplay(pengajuan.status);
                    const namaDisplay = pengajuan.namaSementara || pengajuan.mahasiswa?.user?.name || 'Unknown';
                    return {
                        id: pengajuan.id,
                        id_display: pengajuan.nomorSkl || `#${pengajuan.id.slice(0, 8)}`,
                        sumber: 'Internal',
                        pengusul: namaDisplay,
                        nim: pengajuan.mahasiswa?.nim || '-',
                        perihal: 'Surat Keterangan Lulus',
                        tanggal: new Date(pengajuan.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                        programStudi: pengajuan.mahasiswa?.programStudi?.name || '-',
                        tujuan: 'Admin Prodi',
                        status: statusDisplay.label,
                        statusColor: statusDisplay.color,
                        rawStatus: pengajuan.status,
                        createdAt: pengajuan.createdAt
                    };
                });
                setLetters(formattedLetters);
                setStats(dashboardData.stats);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLetters = letters.filter(letter => {
        const matchesSearch = letter.pengusul.toLowerCase().includes(searchTerm.toLowerCase()) ||
            letter.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    return (
        <AdminProdiLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Semua Surat</h1>
                <p className="text-gray-600">Daftar seluruh surat yang pernah masuk dan diproses oleh Admin Program Studi.</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Perlu Tindakan</CardTitle>
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
                        <CardTitle className="text-sm font-medium text-gray-600">Selesai (Bulan Ini)</CardTitle>
                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-800">{stats.selesai.toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1">Surat telah diselesaikan</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Surat (Bulan Ini)</CardTitle>
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-800">{stats.totalSurat.toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1">Total volume bulan ini</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Daftar Seluruh Surat</CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" className="text-sm" onClick={loadData}>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </Button>
                            <div className="flex items-center gap-2 border rounded-lg px-2 py-1">
                                <span className="text-xs text-gray-500">Dari:</span>
                                <input
                                    type="date"
                                    className="text-xs border-none outline-none bg-transparent"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                                <span className="text-xs text-gray-500">Sampai:</span>
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
                                <option value="DRAFT">Draft</option>
                                <option value="SUBMITTED">Menunggu Verifikasi</option>
                                <option value="VERIFIED_ADMIN">Menunggu Ketua Prodi</option>
                                <option value="APPROVED_KAPRODI">Disetujui Kaprodi</option>
                                <option value="COMPLETED">Selesai</option>
                                <option value="DITOLAK">Ditolak</option>
                                <option value="REVISI">Perlu Revisi</option>
                            </select>
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
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">TUJUAN SAAT INI</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">STATUS</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">AKSI</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={9} className="py-10 text-center text-gray-500">Memuat data...</td></tr>
                                ) : currentLetters.length === 0 ? (
                                    <tr><td colSpan={9} className="py-10 text-center text-gray-500">Tidak ada surat</td></tr>
                                ) : (
                                    currentLetters.map((letter) => (
                                        <tr key={letter.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm text-gray-800">{letter.id_display}</td>
                                            <td className="py-3 px-4"><span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{letter.sumber}</span></td>
                                            <td className="py-3 px-4 text-sm text-gray-800">{letter.pengusul}<div className="text-xs text-gray-500">{letter.nim}</div></td>
                                            <td className="py-3 px-4 text-sm text-gray-800">{letter.perihal}</td>
                                            <td className="py-3 px-4 text-sm text-gray-600">{letter.tanggal}</td>
                                            <td className="py-3 px-4 text-sm text-gray-800">{letter.programStudi}</td>
                                            <td className="py-3 px-4 text-sm text-gray-800">{letter.tujuan}</td>
                                            <td className="py-3 px-4"><span className={`text-xs font-medium ${letter.statusColor}`}>● {letter.status}</span></td>
                                            <td className="py-3 px-4">
                                                <button className="p-1 hover:bg-gray-200 rounded" onClick={() => {
                                                    if (letter.rawStatus === 'APPROVED_KAPRODI') router.push(`/admin-prodi/surat/${letter.id}/generate`);
                                                    else router.push(`/admin-prodi/surat/${letter.id}`);
                                                }}>
                                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {!loading && currentLetters.length > 0 && (
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-gray-600">Showing {startIndex + 1}-{Math.min(endIndex, filteredLetters.length)} of {filteredLetters.length}</div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>&lt;</Button>
                                <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}>&gt;</Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </AdminProdiLayout>
    );
}
