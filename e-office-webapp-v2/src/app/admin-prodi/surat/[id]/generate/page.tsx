'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { sklService } from '@/services/sklService';
import { adminProdiService } from '@/services/adminProdiService';
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

export default function GenerateSuratPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [zoom, setZoom] = useState(100);
  const [pengajuan, setPengajuan] = useState<any>(null);
  const [nomorSurat, setNomorSurat] = useState('');
  const [isNomorPasang, setIsNomorPasang] = useState(false);
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
      const pengajuanData = await sklService.getPengajuanDetail(params.id as string);

      console.log('=== DEBUG PENGAJUAN DATA ===');
      console.log('Full pengajuan:', pengajuanData);
      console.log('Mahasiswa:', pengajuanData?.mahasiswa);
      console.log('Program Studi:', pengajuanData?.mahasiswa?.programStudi);
      console.log('Nama Program Studi:', pengajuanData?.mahasiswa?.programStudi?.nama);
      console.log('Ketua Prodi Object:', pengajuanData?.mahasiswa?.programStudi?.ketuaProdi);
      console.log('Nama Ketua Prodi:', pengajuanData?.mahasiswa?.programStudi?.ketuaProdi?.name);
      console.log('NIP Ketua Prodi:', pengajuanData?.mahasiswa?.programStudi?.ketuaProdi?.nip);

      if (pengajuanData) {
        setPengajuan(pengajuanData);

        // Load nomor surat jika sudah ada
        if (pengajuanData.nomorSuratPengantar) {
          setNomorSurat(pengajuanData.nomorSuratPengantar);
          setIsNomorPasang(true);
        }
      }
    } catch (error) {
      console.error('Error fetching pengajuan detail:', error);
      alert('Gagal memuat data pengajuan');
    } finally {
      setLoading(false);
    }
  };

  const handlePasangNomor = () => {
    if (!nomorSurat.trim()) {
      alert('Nomor surat tidak boleh kosong!');
      return;
    }

    setIsNomorPasang(true);
    alert('Nomor surat berhasil dipasang!');
  };

  const handleHapusNomor = () => {
    if (confirm('Apakah Anda yakin ingin menghapus nomor surat?')) {
      setNomorSurat('');
      setIsNomorPasang(false);
      alert('Nomor surat berhasil dihapus!');
    }
  };

  const handleGenerateDanSetujui = async () => {
    // Get user from localStorage or hook
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

    // CRITICAL: actorId MUST be a valid user ID from database
    if (!currentUser || !currentUser.id) {
      alert('Anda harus login terlebih dahulu untuk melakukan aksi ini.');
      router.push('/auth/login');
      return;
    }

    console.log('=== DEBUG INFO ===');
    console.log('Current user:', currentUser);
    console.log('User ID:', currentUser.id);
    console.log('Pengajuan:', pengajuan);

    // Use the logged-in user's ID (even if mahasiswa for development)
    const actorId = currentUser.id;

    console.log('Using actorId:', actorId);

    try {
      // Check status untuk menentukan action
      if (pengajuan.status === 'SUBMITTED') {
        // Admin prodi verifikasi: SUBMITTED -> VERIFIED_ADMIN (tanpa nomor)
        // adminProdiId tidak dikirim, biarkan backend handle atau skip
        const success = await adminProdiService.verifyPengajuan(
          params.id as string,
          actorId,
          undefined, // DEV MODE: tidak kirim adminProdiId
          'Berkas diverifikasi oleh Admin Prodi. Surat sudah di-generate dan menunggu persetujuan Kaprodi.',
          undefined // tidak ada nomorSuratPengantar di tahap ini
        );

        if (success) {
          alert('Surat berhasil di-generate dan dikirim ke Kaprodi untuk persetujuan!');
          router.push('/admin-prodi/dashboard');
        } else {
          alert('Gagal memproses surat');
        }
      } else if (pengajuan.status === 'APPROVED_KAPRODI') {
        // Admin prodi kasih nomor: APPROVED_KAPRODI -> REGISTERED
        if (!isNomorPasang || !nomorSurat.trim()) {
          alert('Harap pasang nomor surat terlebih dahulu!');
          return;
        }

        const success = await adminProdiService.registerPengajuan(
          params.id as string,
          actorId,
          `Nomor surat telah didaftarkan: ${nomorSurat}`,
          nomorSurat
        );

        if (success) {
          alert('Nomor surat berhasil didaftarkan!');
          router.push('/admin-prodi/dashboard');
        } else {
          alert('Gagal mendaftarkan nomor surat');
        }
      } else {
        alert(`Status surat tidak sesuai untuk proses ini. Status saat ini: ${pengajuan.status}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat memproses surat');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader greetingOnly={true} />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!pengajuan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader greetingOnly={true} />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <p className="text-gray-600">Data pengajuan tidak ditemukan</p>
            <Button onClick={() => router.push('/admin-prodi/dashboard')} className="mt-4">
              Kembali ke Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Data yang ditampilkan: prioritas data sementara > data master
  const namaLengkap = pengajuan.namaSementara || pengajuan.mahasiswa?.user?.name || 'N/A';
  const nim = pengajuan.mahasiswa?.nim || 'N/A';
  const email = pengajuan.emailSementara || pengajuan.mahasiswa?.user?.email || 'N/A';
  const noHp = pengajuan.noHpSementara || pengajuan.mahasiswa?.noHp || 'N/A';
  const alamat = pengajuan.alamatSementara || pengajuan.mahasiswa?.alamat || 'N/A';
  const tempatLahir = pengajuan.tempatLahirSementara || pengajuan.mahasiswa?.tempatLahir || 'N/A';
  const tanggalLahir = pengajuan.tanggalLahirSementara
    ? new Date(pengajuan.tanggalLahirSementara).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : (pengajuan.mahasiswa?.tanggalLahir
      ? new Date(pengajuan.mahasiswa.tanggalLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'N/A');
  const programStudi = pengajuan.mahasiswa?.programStudi?.name || 'N/A';

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 150));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <AppHeader greetingOnly={true} />

      <div className="flex" style={{ marginTop: '64px' }}>
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md fixed left-0 h-[calc(100vh-64px)] overflow-y-auto" style={{ top: '64px' }}>
          <div className="p-4">
            <nav className="space-y-2">
              <div
                className="px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium cursor-pointer"
                onClick={() => router.push('/admin-prodi/dashboard')}
              >
                Dashboard
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden h-[calc(100vh-64px)]" style={{ marginLeft: '256px' }}>
          <div className="px-8 pt-6 pb-4 text-sm text-gray-600">
            <span className="cursor-pointer hover:text-blue-600" onClick={() => router.push('/admin-prodi/dashboard')}>Surat Masuk</span>
            <span className="mx-2">/</span>
            <span>Penerima</span>
            <span className="mx-2">/</span>
            <span>Identitas Pemohon</span>
          </div>

          <div className="px-8 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Details */}
              <div className="lg:col-span-1 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                {/* Proses Verifikasi / Proses Penomoran - conditional based on status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {pengajuan.status === 'SUBMITTED' ? 'Proses Verifikasi' : 'Proses Penomoran Prodi'}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      {pengajuan.status === 'SUBMITTED'
                        ? 'Lengkapi dan isi kembali data penerima nomor surat disebutkan'
                        : 'Pasang nomor surat untuk melanjutkan proses'}
                    </p>
                  </CardHeader>
                </Card>

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
                      <label className="text-sm text-gray-600">Perihal</label>
                      <p className="font-medium">Surat Keterangan Lulus</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Tgl Masuk</label>
                      <p className="font-medium">{new Date(pengajuan.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">IPK</label>
                      <p className="font-medium">{pengajuan.ipkTerakhir}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Nomor Surat - Hanya muncul jika status APPROVED_KAPRODI */}
                {pengajuan.status === 'APPROVED_KAPRODI' && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-4">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                        <h3 className="font-semibold">Nomor Surat</h3>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-600 mb-2 block">Input Nomor Surat</label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">No :</span>
                          <input
                            type="text"
                            value={nomorSurat}
                            onChange={(e) => setNomorSurat(e.target.value)}
                            placeholder="Contoh: 12345"
                            disabled={isNomorPasang}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Format: No : [nomor yang Anda input]</p>
                      </div>

                      {!isNomorPasang ? (
                        <Button
                          onClick={handlePasangNomor}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Pasang Nomor Surat
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-sm text-green-600 flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Nomor surat: <strong>No : {nomorSurat}</strong></span>
                          </div>
                          <Button
                            onClick={handleHapusNomor}
                            variant="outline"
                            className="w-full text-red-600 hover:bg-red-50 border-red-300"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Hapus dan Input Ulang
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Tanda Tangan Ketua Prodi - hanya muncul jika sudah ada */}
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
                      <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
                        <div className="w-full max-w-xs border-2 border-green-300 rounded-lg p-6 bg-white text-center">
                          <div className="mb-3 flex justify-center">
                            <Image
                              src={pengajuan.ttdKetuaProdi}
                              alt="Tanda Tangan Ketua Prodi"
                              width={120}
                              height={80}
                              className="object-contain"
                            />
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
                          <div className="flex items-center gap-2 min-w-0">
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
                  <CardContent className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                    {/* Preview Surat */}
                    <div className="bg-white border rounded-lg p-8 shadow-sm" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left', width: `${10000 / zoom}%` }}>
                      <div className="max-w-3xl mx-auto">
                        {/* Header - Kotak AK.008 di kanan atas */}
                        <div className="flex justify-end mb-4">
                          <div className="border border-gray-800 px-4 py-1">
                            <span className="font-bold">AK.008</span>
                          </div>
                        </div>

                        {/* Nomor Surat yang di-input - muncul di atas Perihal jika sudah dipasang */}
                        {isNomorPasang && nomorSurat && (
                          <div className="mb-4">
                            <span className="font-bold">No : {nomorSurat}</span>
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
                              {pengajuan.tandatangan && (
                                <div className="inline-block mb-2">
                                  <Image
                                    src={pengajuan.tandatangan}
                                    alt="Tanda Tangan Mahasiswa"
                                    width={100}
                                    height={60}
                                    className="object-contain"
                                  />
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

                <div className="mt-6">
                  {pengajuan.status === 'SUBMITTED' || pengajuan.status === 'APPROVED_KAPRODI' ? (
                    <div className="flex gap-3 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => router.back()}
                      >
                        Kembali
                      </Button>
                      {pengajuan.status === 'SUBMITTED' && (
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={handleGenerateDanSetujui}
                        >
                          Verifikasi & Kirim ke Kaprodi
                        </Button>
                      )}
                      {pengajuan.status === 'APPROVED_KAPRODI' && (
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={handleGenerateDanSetujui}
                          disabled={!isNomorPasang}
                        >
                          Daftarkan Nomor Surat
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Status Informasi dengan warna sesuai kondisi */}
                      {(pengajuan.status === 'VERIFIED_ADMIN' || pengajuan.status === 'REGISTERED' || pengajuan.status === 'SIAP_CETAK' || pengajuan.status === 'COMPLETED') && (
                        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-green-800">
                                {pengajuan.status === 'VERIFIED_ADMIN' && 'Berkas Terverifikasi'}
                                {pengajuan.status === 'REGISTERED' && 'Nomor Surat Terdaftar'}
                                {pengajuan.status === 'SIAP_CETAK' && 'Siap Cetak'}
                                {pengajuan.status === 'COMPLETED' && 'Surat Selesai'}
                              </h3>
                              <p className="text-sm text-green-700">
                                {pengajuan.status === 'VERIFIED_ADMIN' && 'Pengajuan telah diverifikasi dan sedang menunggu persetujuan Ketua Program Studi.'}
                                {pengajuan.status === 'REGISTERED' && 'Nomor surat telah didaftarkan dan sedang dalam proses selanjutnya.'}
                                {pengajuan.status === 'SIAP_CETAK' && 'Dokumen telah diverifikasi supervisor dan siap untuk dicetak.'}
                                {pengajuan.status === 'COMPLETED' && 'SKL telah selesai diproses dan telah dinomori oleh UPA.'}
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              className="border-green-600 text-green-700 hover:bg-green-50"
                              onClick={() => router.back()}
                            >
                              Kembali ke Dashboard
                            </Button>
                          </div>
                        </div>
                      )}

                      {pengajuan.status === 'REVISI' && (
                        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-yellow-800">Perlu Revisi</h3>
                              <p className="text-sm text-yellow-700">
                                Pengajuan memerlukan perbaikan dari mahasiswa. Silakan periksa catatan revisi.
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              className="border-yellow-600 text-yellow-700 hover:bg-yellow-50"
                              onClick={() => router.back()}
                            >
                              Kembali ke Dashboard
                            </Button>
                          </div>
                        </div>
                      )}

                      {pengajuan.status === 'REJECTED' && (
                        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-red-800">Pengajuan Ditolak</h3>
                              <p className="text-sm text-red-700">
                                Pengajuan telah ditolak. Mahasiswa perlu mengajukan kembali dengan perbaikan yang diperlukan.
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              className="border-red-600 text-red-700 hover:bg-red-50"
                              onClick={() => router.back()}
                            >
                              Kembali ke Dashboard
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
