'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { sklService } from '@/services/sklService';
import { adminFakultasService } from '@/services/adminFakultasService';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

// Utility function to extract clean filename from URL
const getCleanFileName = (url: string): string => {
  if (!url) return 'Dokumen';
  
  // Remove query parameters
  const urlWithoutQuery = url.split('?')[0];
  
  // Get the filename from path
  const parts = urlWithoutQuery.split('/');
  const filename = parts[parts.length - 1];
  
  // Decode URI component in case there are encoded characters
  try {
    return decodeURIComponent(filename);
  } catch (e) {
    return filename;
  }
};

export default function AdminFakultasReviewSurat() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [zoom, setZoom] = useState(100);
  const [pengajuan, setPengajuan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [previewModal, setPreviewModal] = useState<{ visible: boolean; url: string; title: string }>({ visible: false, url: '', title: '' });

  useEffect(() => {
    if (params.id) {
      fetchPengajuanDetail();
    }
  }, [params.id]);

  const fetchPengajuanDetail = async () => {
    try {
      setLoading(true);
      console.log('=== FETCHING PENGAJUAN DETAIL (Admin Fakultas) ===');
      console.log('Pengajuan ID:', params.id);
      
      const pengajuanData = await sklService.getPengajuanDetail(params.id as string);
      
      console.log('Pengajuan data received:', pengajuanData);
      console.log('Status:', pengajuanData?.status);
      console.log('Mahasiswa:', pengajuanData?.mahasiswa);
      console.log('Tanda tangan mahasiswa:', pengajuanData?.tandatangan);
      console.log('Tanda tangan kaprodi:', pengajuanData?.ttdKetuaProdi);
      console.log('Nomor SKL:', pengajuanData?.nomorSkl);
      
      if (pengajuanData) {
        setPengajuan(pengajuanData);
      } else {
        console.log('No pengajuan data received');
      }
    } catch (error) {
      console.error('Error fetching pengajuan detail:', error);
      alert('Gagal memuat data pengajuan');
    } finally {
      setLoading(false);
    }
  };

  const handleDaftarkan = async () => {
    // Get user from localStorage if not available from hook
    let currentUser = user;
    if (!currentUser) {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          currentUser = JSON.parse(storedUser);
        }
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
    
    // Validate user
    if (!currentUser || !currentUser.id) {
      alert('Anda harus login terlebih dahulu untuk melakukan aksi ini.');
      router.push('/auth/login');
      return;
    }
    
    console.log('=== DEBUG INFO ===');
    console.log('Current user:', currentUser);
    console.log('User ID:', currentUser.id);
    console.log('Pengajuan status:', pengajuan?.status);
    
    // Validate status - Admin Fakultas menerima REGISTERING (dari Admin Prodi yang kasih nomor)
    if (pengajuan?.status !== 'REGISTERING') {
      alert(`Status surat tidak sesuai. Status saat ini: ${pengajuan?.status}. Harus REGISTERING untuk didaftarkan.`);
      return;
    }
    
    try {
      // Admin Fakultas registrasi: REGISTERING -> REGISTERED
      const success = await adminFakultasService.registerPengajuan(
        params.id as string,
        currentUser.id,
        'Surat telah diregistrasi oleh Admin Fakultas, siap untuk ditinjau Supervisor'
      );

      if (success) {
        alert('Surat berhasil diregistrasi! Surat sekarang siap untuk ditinjau Supervisor.');
        router.push('/admin-fakultas/dashboard');
      } else {
        alert('Gagal meregistrasi surat');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat memproses surat');
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 150));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!pengajuan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <p>Data pengajuan tidak ditemukan</p>
        </div>
      </div>
    );
  }

  // Extract data from pengajuan - prioritas data sementara > data master
  const mahasiswa = pengajuan.mahasiswa;
  const namaLengkap = pengajuan.namaSementara || mahasiswa?.user?.name || 'Unknown';
  const nim = mahasiswa?.nim || '-';
  const tempatLahir = pengajuan.tempatLahirSementara || mahasiswa?.tempatLahir || '-';
  const tanggalLahir = pengajuan.tanggalLahirSementara 
    ? new Date(pengajuan.tanggalLahirSementara).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : (mahasiswa?.tanggalLahir 
      ? new Date(mahasiswa.tanggalLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      : '-');
  const alamat = pengajuan.alamatSementara || mahasiswa?.alamat || '-';
  const noHp = pengajuan.noHpSementara || mahasiswa?.noHp || '-';
  const programStudi = mahasiswa?.programStudi?.name || '-';

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <AppHeader />
      
      <div className="flex" style={{ marginTop: '64px' }}>
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md fixed left-0 h-[calc(100vh-64px)] overflow-y-auto" style={{ top: '64px' }}>
          <div className="p-4">
            <nav className="space-y-2">
              <div 
                className="px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium cursor-pointer"
                onClick={() => router.push('/admin-fakultas/dashboard')}
              >
                Dashboard
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden h-[calc(100vh-64px)]" style={{ marginLeft: '256px' }}>
          {/* Breadcrumb */}
          <div className="mb-6 text-sm text-gray-600 pt-2 px-8">
            <span className="cursor-pointer hover:text-blue-600" onClick={() => router.push('/admin-fakultas/dashboard')}>Surat Masuk</span>
            <span className="mx-2">/</span>
            <span>Review Surat</span>
          </div>

          <div className="px-8 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Details */}
            <div className="lg:col-span-1 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {/* Detail Permohonan */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="font-semibold">Detail Permohonan</h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600">Pengaju</label>
                    <p className="font-medium">{namaLengkap}</p>
                    <p className="text-sm text-gray-500">NIM: {nim}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Program Studi</label>
                    <p className="font-medium">{programStudi}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Perihal</label>
                    <p className="font-medium">Surat Keterangan Lulus</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Tgl Masuk</label>
                    <p className="font-medium">
                      {new Date(pengajuan.createdAt).toLocaleDateString('id-ID', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Status</label>
                    <p className="font-medium capitalize">{pengajuan.status.replace(/_/g, ' ')}</p>
                  </div>
                  {pengajuan.nomorSuratPengantar && (
                    <div>
                      <label className="text-sm text-gray-600">Nomor Surat Pengantar</label>
                      <p className="font-medium">{pengajuan.nomorSuratPengantar}</p>
                      <p className="text-xs text-gray-500">Diisi oleh Admin Prodi</p>
                    </div>
                  )}
                  {pengajuan.nomorSkl && (
                    <div>
                      <label className="text-sm text-gray-600">Nomor SKL</label>
                      <p className="font-medium">{pengajuan.nomorSkl}</p>
                      <p className="text-xs text-gray-500">Diisi oleh Admin Fakultas</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tanda Tangan Ketua Prodi */}
              {pengajuan.ttdKetuaProdi && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-4">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="font-semibold">Tanda Tangan Ketua Prodi</h3>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Preview Surat */}
                    <div className="bg-white border rounded-lg p-8 shadow-sm overflow-y-auto" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left', width: `${10000 / zoom}%`, maxHeight: 'calc(100vh - 300px)' }}>
                      <div className="max-w-3xl mx-auto">
                        {/* Header - Kotak AK.008 di kanan atas */}
                        <div className="flex justify-end mb-4">
                          <div className="border border-gray-800 px-4 py-1">
                            <span className="font-bold">AK.008</span>
                          </div>
                        </div>

                        {/* Nomor Surat Pengantar (dari Admin Prodi) */}
                        {pengajuan.nomorSuratPengantar && (
                          <div className="mb-2">
                            <span className="font-bold">No : {pengajuan.nomorSuratPengantar}</span>
                          </div>
                        )}

                        {/* Nomor SKL (dari Admin Fakultas) */}
                        {pengajuan.nomorSkl && (
                          <div className="mb-4">
                            <span className="font-bold">No SKL: {pengajuan.nomorSkl}</span>
                          </div>
                        )}

                        {/* Perihal */}
                        <div className="flex gap-2 mb-8">
                          <span className="font-bold">Perihal</span>
                          <span>:</span>
                          <span className="font-bold">Surat Keterangan Lulus</span>
                        </div>

                        {/* Content */}
                        <div className="space-y-4 text-sm leading-relaxed" style={{ textAlign: 'justify' }}>
                          <div className="flex gap-8">
                            <span className="w-20 flex-shrink-0">Yth.</span>
                            <span>Dekan<br />Fakultas Sains dan Matematika Universitas Diponegoro<br />Semarang.</span>
                          </div>

                          <p>Dengan ini kami mengajukan permohonan pembuatan Surat Keterangan Lulus atas nama :</p>

                          <div className="space-y-1 ml-8">
                            <div className="flex">
                              <span className="w-48 flex-shrink-0">Nama</span>
                              <span className="flex-shrink-0 mr-2">:</span>
                              <span>{namaLengkap}</span>
                            </div>
                            <div className="flex">
                              <span className="w-48 flex-shrink-0">NIM</span>
                              <span className="flex-shrink-0 mr-2">:</span>
                              <span>{nim}</span>
                            </div>
                            <div className="flex">
                              <span className="w-48 flex-shrink-0">Tempat/Tanggal Lahir</span>
                              <span className="flex-shrink-0 mr-2">:</span>
                              <span>{tempatLahir}, {tanggalLahir}</span>
                            </div>
                            <div className="flex">
                              <span className="w-48 flex-shrink-0">Alamat</span>
                              <span className="flex-shrink-0 mr-2">:</span>
                              <span>{alamat}</span>
                            </div>
                            <div className="flex">
                              <span className="w-48 flex-shrink-0">No Telepon/HP</span>
                              <span className="flex-shrink-0 mr-2">:</span>
                              <span>{noHp}</span>
                            </div>
                            <div className="flex">
                              <span className="w-48 flex-shrink-0">Program Studi</span>
                              <span className="flex-shrink-0 mr-2">:</span>
                              <span>{programStudi}</span>
                            </div>
                          </div>

                          <p>Telah dinyatakan lulus ujian Sarjana pada Departemen/Program Studi {programStudi} Fakultas Sains dan Matematika Universitas Diponegoro pada tanggal {new Date(pengajuan.tglLulus).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} dengan Indeks Prestasi Kumulatif (IPK) {pengajuan.ipkTerakhir}/4.00 dengan Jumlah Satuan Kredit Semester (SKS) {pengajuan.jumlahSks || 144}</p>

                          <p>Demikian surat permohonan kami, atas perhatiannya kami sampaikan terimakasih.</p>

                          <div className="mt-12 flex justify-between">
                            <div className="text-center">
                              <p className="mb-4">Ketua Program Studi</p>
                              {/* Tanda tangan Kaprodi (jika sudah ada) */}
                              {pengajuan.ttdKetuaProdi && (
                                <div className="inline-block mb-2">
                                  <Image
                                    src={pengajuan.ttdKetuaProdi}
                                    alt="Tanda Tangan Kaprodi"
                                    width={100}
                                    height={60}
                                    className="object-contain"
                                  />
                                </div>
                              )}
                              <div className="mt-2">
                                <p className="font-semibold">
                                  {pengajuan.mahasiswa?.programStudi?.ketuaProdi?.user?.name || '(Nama Ketua Prodi)'}
                                </p>
                                <p>NIP. {pengajuan.mahasiswa?.programStudi?.ketuaProdi?.nip || '(NIP Ketua Prodi)'}</p>
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="mb-2">Semarang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                              <p className="mb-4">Pemohon,</p>
                              {/* Tanda tangan mahasiswa */}
                              {pengajuan.tandatangan ? (
                                <div className="inline-block mb-2">
                                  <Image
                                    src={pengajuan.tandatangan}
                                    alt="Tanda Tangan Mahasiswa"
                                    width={100}
                                    height={60}
                                    className="object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="inline-block mb-2 h-[60px] flex items-center justify-center text-gray-400 text-xs">
                                  Tidak ada tanda tangan
                                </div>
                              )}
                              <div className="mt-2">
                                <p className="border-b border-gray-800 inline-block font-semibold">{namaLengkap}</p>
                                <p>NIM {nim}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-green-600 font-medium">✓ Sudah ditandatangani Kaprodi</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lampiran */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Lampiran</h3>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pengajuan.lampiran && pengajuan.lampiran.length > 0 ? (
                    pengajuan.lampiran.map((lamp: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-xs truncate">{index + 1}. {lamp.jenisDokumen}</p>
                          </div>
                        </div>
                        <button 
                          className="p-1 hover:bg-gray-200 rounded flex-shrink-0"
                          onClick={() => lamp.pathFile && setPreviewModal({ visible: true, url: lamp.pathFile, title: lamp.jenisDokumen || 'Lampiran' })}
                          title="Buka file"
                        >
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">Tidak ada lampiran</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Preview Surat */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-semibold">Pratinjau Surat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleZoomOut}>
                      <span className="text-lg">−</span>
                    </Button>
                    <span className="text-sm font-medium min-w-[60px] text-center">{zoom}%</span>
                    <Button variant="outline" size="sm" onClick={handleZoomIn}>
                      <span className="text-lg">+</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Preview Surat */}
                  <div className="bg-white border rounded-lg p-8 shadow-sm overflow-y-auto" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left', width: `${10000 / zoom}%`, maxHeight: 'calc(100vh - 300px)' }}>
                    <div className="max-w-3xl mx-auto">
                      {/* Header - Kotak AK.008 di kanan atas */}
                      <div className="flex justify-end mb-4">
                        <div className="border border-gray-800 px-4 py-1">
                          <span className="font-bold">AK.008</span>
                        </div>
                      </div>

                      {/* Nomor Surat Pengantar (dari Admin Prodi) */}
                      {pengajuan.nomorSuratPengantar && (
                        <div className="mb-2">
                          <span className="font-bold">No : {pengajuan.nomorSuratPengantar}</span>
                        </div>
                      )}
                      
                      {/* Nomor SKL (dari Admin Fakultas) */}
                      {pengajuan.nomorSkl && (
                        <div className="mb-4">
                          <span className="font-bold">No SKL: {pengajuan.nomorSkl}</span>
                        </div>
                      )}

                      {/* Perihal */}
                      <div className="flex gap-2 mb-8">
                        <span className="font-bold">Perihal</span>
                        <span>:</span>
                        <span className="font-bold">Surat Keterangan Lulus</span>
                      </div>

                      {/* Content */}
                      <div className="space-y-4 text-sm leading-relaxed" style={{ textAlign: 'justify' }}>
                        <div className="flex gap-8">
                          <span className="w-20 flex-shrink-0">Yth.</span>
                          <span>Dekan<br/>Fakultas Sains dan Matematika Universitas Diponegoro<br/>Semarang.</span>
                        </div>

                        <p>Dengan ini kami mengajukan permohonan pembuatan Surat Keterangan Lulus atas nama :</p>

                        <div className="space-y-1 ml-8">
                          <div className="flex">
                            <span className="w-48 flex-shrink-0">Nama</span>
                            <span className="flex-shrink-0 mr-2">:</span>
                            <span>{namaLengkap}</span>
                          </div>
                          <div className="flex">
                            <span className="w-48 flex-shrink-0">NIM</span>
                            <span className="flex-shrink-0 mr-2">:</span>
                            <span>{nim}</span>
                          </div>
                          <div className="flex">
                            <span className="w-48 flex-shrink-0">Tempat/Tanggal Lahir</span>
                            <span className="flex-shrink-0 mr-2">:</span>
                            <span>{tempatLahir}, {tanggalLahir}</span>
                          </div>
                          <div className="flex">
                            <span className="w-48 flex-shrink-0">Alamat</span>
                            <span className="flex-shrink-0 mr-2">:</span>
                            <span>{alamat}</span>
                          </div>
                          <div className="flex">
                            <span className="w-48 flex-shrink-0">No Telepon/HP</span>
                            <span className="flex-shrink-0 mr-2">:</span>
                            <span>{noHp}</span>
                          </div>
                          <div className="flex">
                            <span className="w-48 flex-shrink-0">Program Studi</span>
                            <span className="flex-shrink-0 mr-2">:</span>
                            <span>{programStudi}</span>
                          </div>
                        </div>

                        <p>Telah dinyatakan lulus ujian Sarjana pada Departemen/Program Studi {programStudi} Fakultas Sains dan Matematika Universitas Diponegoro pada tanggal {new Date(pengajuan.tglLulus).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} dengan Indeks Prestasi Kumulatif (IPK) {pengajuan.ipkTerakhir}/4.00 dengan Jumlah Satuan Kredit Semester (SKS) 144</p>

                        <p>Demikian surat permohonan kami, atas perhatiannya kami sampaikan terimakasih.</p>

                        <div className="mt-12 flex justify-between">
                          <div className="text-center">
                            <p className="mb-4">Ketua Program Studi</p>
                            {/* Tanda tangan Kaprodi (jika sudah ada) */}
                            {pengajuan.ttdKetuaProdi && (
                              <div className="inline-block mb-2">
                                <Image 
                                  src={pengajuan.ttdKetuaProdi}
                                  alt="Tanda Tangan Kaprodi"
                                  width={100}
                                  height={60}
                                  className="object-contain"
                                />
                              </div>
                            )}
                            <div className="mt-2">
                              <p className="font-semibold">
                                {pengajuan.mahasiswa?.programStudi?.ketuaProdi?.user?.name || '(Nama Ketua Prodi)'}
                              </p>
                              <p>NIP. {pengajuan.mahasiswa?.programStudi?.ketuaProdi?.nip || '(NIP Ketua Prodi)'}</p>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="mb-2">Semarang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            <p className="mb-4">Pemohon,</p>
                            {/* Tanda tangan mahasiswa */}
                            {pengajuan.tandatangan ? (
                              <div className="inline-block mb-2">
                                <Image 
                                  src={pengajuan.tandatangan}
                                  alt="Tanda Tangan Mahasiswa"
                                  width={100}
                                  height={60}
                                  className="object-contain"
                                />
                              </div>
                            ) : (
                              <div className="inline-block mb-2 h-[60px] flex items-center justify-center text-gray-400 text-xs">
                                Tidak ada tanda tangan
                              </div>
                            )}
                            <div className="mt-2">
                              <p className="border-b border-gray-800 inline-block font-semibold">{namaLengkap}</p>
                              <p>NIM {nim}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons - Below preview */}
              {pengajuan.status === 'COMPLETED' ? (
                <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-green-800">Surat Sudah Selesai</h3>
                      <p className="text-sm text-green-700 mt-1">Surat Keterangan Lulus telah selesai diproses dan dinomori.</p>
                    </div>
                  </div>
                </div>
              ) : pengajuan.status === 'REGISTERING' ? (
                <div className="flex gap-3 mt-6 justify-end">
                  <Button 
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Kembali
                  </Button>
                  <Button 
                    className="bg-green-500 hover:bg-green-600 text-white"
                    onClick={handleDaftarkan}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Daftarkan
                  </Button>
                </div>
              ) : (
                <div className="flex justify-end gap-3 mt-6">
                  <Button 
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Kembali
                  </Button>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-300 rounded-lg text-sm text-blue-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Tidak Ada Tindakan</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        </main>
      </div>

      {/* Preview Modal */}
      {previewModal.visible && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setPreviewModal({ visible: false, url: '', title: '' })}>
          <div className="bg-white rounded-lg p-6 max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{previewModal.title}</h3>
              <button 
                className="p-2 hover:bg-gray-100 rounded"
                onClick={() => setPreviewModal({ visible: false, url: '', title: '' })}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
              <iframe 
                src={previewModal.url} 
                className="w-full border-0"
                style={{ height: '70vh' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
