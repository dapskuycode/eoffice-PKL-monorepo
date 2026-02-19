'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { upaService } from '@/services/upaService';
import UPALayout from '@/components/layout/UPALayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UpaSemuaSurat() {
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
            const data = await upaService.getDashboard();
            setPengajuan(data.pengajuan);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
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

    const formatStatus = (status: string) => {
        if (status === 'COMPLETED') return 'Selesai';
        if (status === 'STEP_KONVENSIONAL') return 'Finalisasi Surat';
        return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
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

    return (
        <UPALayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Semua Surat</h1>
                <p className="text-gray-600">Daftar seluruh riwayat pengajuan SKL</p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Riwayat Pengajuan</CardTitle>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2 border rounded-lg px-2 py-1 bg-white">
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
                            <option value="REGISTERING">Proses UPA</option>
                            <option value="REGISTERED">Selesai</option>
                            <option value="REVISI">Perlu Revisi</option>
                            <option value="DITOLAK">Ditolak</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Cari..."
                            className="px-4 py-2 border rounded-lg text-sm bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="py-10 text-center text-gray-500">Memuat data...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-gray-500 uppercase tracking-wider">
                                        <th className="text-left p-4 font-semibold">No</th>
                                        <th className="text-left p-4 font-semibold">Nama Mahasiswa</th>
                                        <th className="text-left p-4 font-semibold">NIM</th>
                                        <th className="text-left p-4 font-semibold">Program Studi</th>
                                        <th className="text-left p-4 font-semibold">Status</th>
                                        <th className="text-left p-4 font-semibold text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={item.id} className="border-b hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4">{indexOfFirstItem + index + 1}</td>
                                            <td className="p-4 font-bold text-gray-900">{item.namaSementara || item.mahasiswa?.user?.name}</td>
                                            <td className="p-4 text-gray-600">{item.mahasiswa?.nim}</td>
                                            <td className="p-4 text-gray-600">{item.mahasiswa?.programStudi?.name}</td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${getStatusColor(item.status)}`}>
                                                    {formatStatus(item.status)}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => router.push(`/upa/surat/${item.id}/review`)}
                                                    className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-gray-400"
                                                    title="Lihat Detail"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {currentItems.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-10 text-center text-gray-400 italic">Tidak ada data ditemukan</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t">
                            <div className="text-xs text-gray-500">
                                Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredPengajuan.length)} dari {filteredPengajuan.length} data
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-30 text-xs font-bold transition-colors"
                                >
                                    Sebelumnya
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-colors ${currentPage === page
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'hover:bg-gray-50 text-gray-600 border-gray-200'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-30 text-xs font-bold transition-colors"
                                >
                                    Berikutnya
                                </button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </UPALayout>
    );
}
