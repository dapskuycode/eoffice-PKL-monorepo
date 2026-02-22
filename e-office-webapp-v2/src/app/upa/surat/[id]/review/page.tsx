'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { upaService } from '@/services/upaService';
import { sklService } from '@/services/sklService';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import SidebarMenu from '@/components/layout/SidebarMenu';

// Utility function to extract clean filename from URL
const getCleanFileName = (url: string): string => {
  if (!url) return 'Dokumen';
  const urlWithoutQuery = url.split('?')[0];
  const parts = urlWithoutQuery.split('/');
  const filename = parts[parts.length - 1];
  try {
    return decodeURIComponent(filename);
  } catch (e) {
    return filename;
  }
};

export default function UPAFinalisasiSurat() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const { user } = useAuth();
  const [zoom, setZoom] = useState(100);
  const [pengajuan, setPengajuan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nomorSklResmi, setNomorSklResmi] = useState('');
  const [previewModal, setPreviewModal] = useState<{ visible: boolean; url: string; title: string }>({ visible: false, url: '', title: '' });

  useEffect(() => {
    if (params?.id) {
      fetchPengajuanDetail();
    }
  }, [params?.id]);

  const fetchPengajuanDetail = async () => {
    if (!params?.id) return;
    try {
      setLoading(true);
      const pengajuanId = params.id as string;
      const pengajuanData = await sklService.getPengajuanDetail(pengajuanId);

      if (pengajuanData) {
        setPengajuan(pengajuanData);
        if (pengajuanData.nomorSkl) {
          setNomorSklResmi(pengajuanData.nomorSkl);
        }
      }
    } catch (error) {
      console.error('Error fetching pengajuan detail:', error);
      alert('Gagal memuat data pengajuan');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalisasi = async () => {
    let currentUser = user;
    if (!currentUser) {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) currentUser = JSON.parse(storedUser);
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }

    const actorId = currentUser?.id || pengajuan?.mahasiswa?.userId;
    if (!actorId) {
      alert('Error: Tidak dapat menemukan user ID yang valid');
      return;
    }

    if (pengajuan?.status !== 'STEP_KONVENSIONAL') {
      alert(`Status surat tidak sesuai. Status saat ini: ${pengajuan?.status}.`);
      return;
    }

    try {
      const success = await upaService.finalisasi(
        params?.id as string,
        actorId,
        nomorSklResmi,
        `Surat SKL dengan nomor ${nomorSklResmi} telah selesai diproses. Silakan mengambil di Akademik.`
      );

      if (success) {
        alert(`Surat berhasil difinalisasi`);
        router.push('/upa/dashboard');
      } else {
        alert('Gagal memfinalisasi surat');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat memfinalisasi surat');
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));

  const formatStatus = (status: string) => {
    if (status === 'COMPLETED') return 'Selesai';
    if (status === 'STEP_KONVENSIONAL') return 'Finalisasi Surat';
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Memuat data...</p>
      </div>
    </div>
  );

  if (!pengajuan) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p>Data pengajuan tidak ditemukan</p>
    </div>
  );

  const mhs = pengajuan.mahasiswa;
  const nama = pengajuan.namaSementara || mhs?.user?.name || 'N/A';
  const nim = mhs?.nim || 'N/A';
  const programStudi = mhs?.programStudi?.name || 'N/A';

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <AppHeader greetingOnly={true} />

      <div className="flex" style={{ marginTop: '64px' }}>
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md fixed left-0 h-[calc(100vh-64px)] overflow-y-auto" style={{ top: '64px' }}>
          <SidebarMenu role="upa" collapsed={false} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden h-[calc(100vh-64px)] bg-gray-50" style={{ marginLeft: '256px' }}>
          {/* Breadcrumb */}
          <div className="mb-6 text-sm text-gray-600 pt-2 px-8">
            <span className="cursor-pointer hover:text-blue-600" onClick={() => router.push('/upa/dashboard')}>Surat Masuk</span>
            <span className="mx-2">/</span>
            <span>Review Surat</span>
          </div>

          <div className="px-8 pb-8 h-[calc(100vh-140px)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

              {/* Left Column - Scrollable Info */}
              <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                {/* Input Card */}
                <Card className="border-2 border-blue-200 shadow-lg bg-blue-50/50">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Input Nomor SKL Resmi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700 block mb-2">Nomor SKL Final</label>
                      <input
                        type="text"
                        className="w-full border-2 border-blue-300 rounded-lg p-3 text-xl font-bold bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Contoh: SKL/2026/001"
                        value={nomorSklResmi}
                        onChange={(e) => setNomorSklResmi(e.target.value)}
                      />
                      <p className="text-xs text-blue-600 mt-2 italic font-medium">
                        * Nomor ini akan menempel otomatis di preview surat (Sticky Note hijau).
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Details Card */}
                <Card>
                  <CardHeader>
                    <h3 className="font-bold">Detail Mahasiswa</h3>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div><label className="text-gray-500">Nama</label><p className="font-bold">{nama}</p></div>
                    <div><label className="text-gray-500">NIM</label><p className="font-bold">{nim}</p></div>
                    <div><label className="text-gray-500">Program Studi</label><p className="font-medium">{programStudi}</p></div>
                    <div><label className="text-gray-500">Status</label><p className="text-blue-600 font-bold">{formatStatus(pengajuan.status)}</p></div>
                  </CardContent>
                </Card>

                {/* Lampiran Card */}
                <Card>
                  <CardHeader>
                    <h3 className="font-bold">Lampiran</h3>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {pengajuan.lampiran?.map((lamp: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-white border rounded hover:border-blue-300 transition-colors">
                        <span className="text-xs font-medium truncate max-w-[150px]">{lamp.jenisDokumen}</span>
                        <Button variant="ghost" size="sm" onClick={() => lamp.pathFile && setPreviewModal({ visible: true, url: lamp.pathFile, title: lamp.jenisDokumen })}>
                          Lihat
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Pinned Action UI */}
              <div className="lg:col-span-2 flex flex-col h-full bg-white rounded-xl border shadow-sm overflow-hidden">
                <CardHeader className="border-b py-3 px-6 flex flex-row items-center justify-between bg-white z-10 font-bold">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Pratinjau Surat Luaran
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleZoomOut}>-</Button>
                    <span className="text-xs font-bold w-12 text-center">{zoom}%</span>
                    <Button variant="outline" size="sm" onClick={handleZoomIn}>+</Button>
                  </div>
                </CardHeader>

                <div
                  id="preview-surat-content"
                  className="bg-gray-100 p-4 sm:p-8 flex justify-center"
                  style={{ maxHeight: '72vh', overflow: 'auto' }}
                >
                  <div
                    id="surat-only-content"
                    style={{
                      width: '210mm',
                      minHeight: '297mm',
                      backgroundColor: 'white',
                      boxShadow: '0 0 20px rgba(0,0,0,0.1)',
                      padding: '2cm',
                      position: 'relative',
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: 'top center',
                      margin: '0 auto',
                      color: 'black',
                      fontFamily: "'Times New Roman', Times, serif"
                    }}
                  >
                    {/* Header Code */}
                    <div className="flex justify-end mb-6 text-sm font-bold border border-black px-2 py-1 absolute right-8 top-8">AK.008</div>

                    <div className="mt-12 space-y-4 text-sm">
                      <p className="font-bold">No : {pengajuan.nomorSuratPengantar || '-'}</p>
                      <p className="font-bold">Perihal : Surat Keterangan Lulus</p>

                      <div className="pt-8">
                        <p>Yth. Dekan</p>
                        <p>Fakultas Sains dan Matematika Universitas Diponegoro</p>
                        <p>Semarang.</p>
                      </div>

                      <p className="pt-4">Dengan ini kami mengajukan permohonan pembuatan Surat Keterangan Lulus atas nama :</p>

                      <div className="pl-8 space-y-1">
                        <div className="flex"><span className="w-40">Nama</span><span>: {nama}</span></div>
                        <div className="flex"><span className="w-40">NIM</span><span>: {nim}</span></div>
                        <div className="flex"><span className="w-40">Program Studi</span><span>: {programStudi}</span></div>
                      </div>

                      <p className="pt-4 text-justify">
                        Telah dinyatakan lulus ujian Sarjana pada Departemen/Program Studi {programStudi} Fakultas Sains dan Matematika Universitas Diponegoro dengan Indeks Prestasi Kumulatif (IPK) {pengajuan.ipkTerakhir}/4.00.
                      </p>

                      <div className="pt-12 relative">
                        {/* Soft Green Sticky Note - Screen Only */}
                        {nomorSklResmi && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none print:hidden">
                            <div
                              className="w-[220px] bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg shadow-lg p-4 transform rotate-1"
                              style={{ fontVariantNumeric: 'tabular-nums', fontFamily: 'sans-serif' }}
                            >
                              <div className="text-center space-y-2">
                                <div className="flex items-center justify-center gap-1.5 text-[#166534] font-bold text-[14px]">
                                  <span style={{ fontSize: '18px' }}>📝</span>
                                  <span style={{ textDecoration: 'underline', textDecorationColor: '#86efac', textUnderlineOffset: '4px' }}>Surat Selesai</span>
                                </div>

                                <p className="text-[11px] color-[#374151]">Nomor SKL Resmi:</p>

                                <div className="bg-white px-2 py-1.5 rounded border border-[#dcfce7] shadow-inner">
                                  <span className="text-[14px] font-black text-[#064e3b] tracking-wider uppercase block truncate">
                                    {nomorSklResmi}
                                  </span>
                                </div>

                                <p className="text-[10px] text-gray-600 leading-tight">
                                  Foto <span className="font-bold">4x2 (2 lbr)</span> & cap basah ke Akademik.
                                </p>

                                <p className="text-[12px] font-bold text-[#166534] mt-1">
                                  Terima kasih 🙏
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="flex justify-between items-start">
                          <div className="signature-block flex flex-col items-center text-center w-60">
                            <p className="mb-1">Ketua Program Studi</p>
                            <div className="signature-wrapper h-20 flex items-center justify-center w-full my-1">
                              {pengajuan.ttdKetuaProdi && (
                                <Image src={pengajuan.ttdKetuaProdi} alt="TTD Kaprodi" width={110} height={70} className="object-contain" />
                              )}
                            </div>
                            <div className="mt-1">
                              <p className="font-bold underline mb-1">{pengajuan.mahasiswa?.programStudi?.ketuaProdi?.user?.name}</p>
                              <p className="text-xs">NIP. {pengajuan.mahasiswa?.programStudi?.ketuaProdi?.nip || '-'}</p>
                            </div>
                          </div>

                          <div className="signature-block flex flex-col items-center text-center w-60">
                            <p className="mb-1">Semarang, {new Date(pengajuan.createdAt || new Date()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            <p className="mb-1">Pemohon,</p>
                            <div className="signature-wrapper h-20 flex items-center justify-center w-full my-1">
                              {pengajuan.tandatangan && (
                                <Image src={pengajuan.tandatangan} alt="TTD Mahasiswa" width={110} height={70} className="object-contain" />
                              )}
                            </div>
                            <div className="mt-1">
                              <p className="font-bold underline mb-1">{nama}</p>
                              <p className="text-xs">NIM {nim || '-'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer UI - PINNED AT BOTTOM */}
                <div className="border-t p-4 bg-white flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                  {pengajuan.status === 'COMPLETED' ? (
                    <div className="w-full bg-green-50 border border-green-200 p-3 rounded-lg flex items-center justify-center gap-2 text-green-800 font-bold">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Surat Sudah Selesai Difinalisasi
                    </div>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => router.back()}>Kembali</Button>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white min-w-[150px] font-bold"
                        disabled={!nomorSklResmi.trim()}
                        onClick={handleFinalisasi}
                      >
                        Finalisasi Surat
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Preview Lampiran */}
      {previewModal.visible && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold">{previewModal.title}</h3>
              <Button variant="ghost" onClick={() => setPreviewModal({ visible: false, url: '', title: '' })}>Tutup</Button>
            </div>
            <iframe src={previewModal.url} className="flex-1 w-full border-none" />
          </div>
        </div>
      )}
    </div>
  );
}