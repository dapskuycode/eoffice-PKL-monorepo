'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import RiwayatSurat from '@/components/RiwayatSurat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminFakultasService } from '@/services/adminFakultasService';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

export default function AdminFakultasDetailSurat() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const { user } = useAuth();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pengajuan, setPengajuan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (params.id) {
      fetchPengajuanDetail();
    }
  }, [params.id]);

  const fetchPengajuanDetail = async () => {
    try {
      setLoading(true);
      const pengajuanData = await adminFakultasService.getPengajuanDetail(params.id as string);

      if (pengajuanData) {
        setPengajuan(pengajuanData);
      }
    } catch (error) {
      console.error('Error fetching pengajuan detail:', error);
      alert('Gagal memuat data pengajuan');
    } finally {
      setLoading(false);
    }
  };

  const handleSetujui = async () => {
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

    const actorId = currentUser?.id || pengajuan?.mahasiswa?.userId;

    if (!actorId) {
      alert('Error: Tidak dapat menemukan user ID yang valid');
      return;
    }

    try {
      const success = await adminFakultasService.registerPengajuan(
        params.id as string,
        actorId,
        'Surat telah diregistrasi oleh Admin Fakultas'
      );

      if (success) {
        alert('Surat berhasil diregistrasi!');
        router.push('/admin-fakultas/dashboard');
      } else {
        alert('Gagal meregistrasi surat');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat memproses surat');
    }
  };

  const handleGenerateSurat = () => {
    // Redirect to generate page
    router.push(`/admin-fakultas/surat/${params.id}/generate`);
  };

  const handleUploadDanKirim = () => {
    if (!uploadedFile) {
      alert('Silakan pilih file terlebih dahulu');
      return;
    }
    alert(`Upload dan kirim file: ${uploadedFile.name}`);
    setShowUploadModal(false);
    setUploadedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
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
        <AppHeader greetingOnly={true} />
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
        <AppHeader greetingOnly={true} />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <p>Data pengajuan tidak ditemukan</p>
        </div>
      </div>
    );
  }

  // Extract data from pengajuan
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
    <div className="min-h-screen bg-gray-50">
      <AppHeader greetingOnly={true} />

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
        <main className="flex-1 p-8 pt-8" style={{ marginLeft: '256px' }}>
          {/* Breadcrumb */}
          <div className="mb-6 text-sm text-gray-600 pt-2">
            <span className="cursor-pointer hover:text-blue-600" onClick={() => router.push('/admin-fakultas/dashboard')}>Surat Masuk</span>
            <span className="mx-2">/</span>
            <span>Penerima</span>
            <span className="mx-2">/</span>
            <span>Identitas Pemohon</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Identitas Pengaju */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Identitas Pengaju</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Nama Lengkap</label>
                      <p className="font-medium">{namaLengkap}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Role</label>
                      <p className="font-medium">Mahasiswa</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">NIM</label>
                      <p className="font-medium">{nim}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Program Studi</label>
                      <p className="font-medium">{programStudi}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Email</label>
                      <p className="font-medium text-sm">{pengajuan.emailSementara || mahasiswa?.user?.email || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">No HP</label>
                      <p className="font-medium">{noHp}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detail Surat */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detail Surat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Jenis Surat</label>
                      <p className="font-medium">Surat Keterangan Lulus</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Status</label>
                      <p className="font-medium capitalize">{pengajuan.status.replace(/_/g, ' ')}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Tanggal Pengajuan</label>
                      <p className="font-medium">{new Date(pengajuan.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Terakhir Update</label>
                      <p className="font-medium">{new Date(pengajuan.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lampiran */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lampiran</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Kartu Tanda Mahasiswa (KTM)</p>
                        <p className="text-xs text-gray-500">File KTM.pdf • 2.1 MB</p>
                      </div>
                    </div>
                    <button
                      className="p-2 hover:bg-gray-200 rounded"
                      onClick={() => setShowPreviewModal(true)}
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Actions & History */}
            <div className="space-y-6">
              {/* Aksi */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Aksi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                    onClick={handleSetujui}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Setujui Surat
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowPreviewModal(true)}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Lihat Draft Surat
                  </Button>
                </CardContent>
              </Card>

              {/* Riwayat Surat */}
              <RiwayatSurat
                pengajuanId={params.id as string}
                title="Riwayat Surat"
              />
            </div>
          </div>
        </main>
      </div>

      {/* Modal Preview Draft Surat */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowPreviewModal(false)}>
          <div className="bg-white rounded-lg w-[90%] max-w-5xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-semibold">Pratinjau Draft Surat</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleZoomOut}>
                    <span className="text-lg">−</span>
                  </Button>
                  <span className="text-sm font-medium min-w-[60px] text-center">{zoom}%</span>
                  <Button variant="outline" size="sm" onClick={handleZoomIn}>
                    <span className="text-lg">+</span>
                  </Button>
                </div>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-8 overflow-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
              <div className="bg-white border rounded-lg p-8 shadow-sm" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left', width: `${10000 / zoom}%` }}>
                <div className="max-w-3xl mx-auto">
                  {/* Header - Kotak AK.008 di kanan atas */}
                  <div className="flex justify-end mb-4">
                    <div className="border border-gray-800 px-4 py-1">
                      <span className="font-bold">AK.008</span>
                    </div>
                  </div>

                  {/* Nomor Surat - muncul jika sudah ada */}
                  {pengajuan?.nomorSuratPengantar && (
                    <div className="mb-4">
                      <span className="font-bold">No : {pengajuan.nomorSuratPengantar}</span>
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
                      <div className="flex">
                        <span className="w-32 flex-shrink-0">NIM</span>
                        <span>: {nim}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 flex-shrink-0">Program Studi</span>
                        <span>: {programStudi}</span>
                      </div>
                    </div>

                    <p>Telah dinyatakan lulus ujian Sarjana pada Departemen/Program Studi {programStudi} Fakultas Sains dan Matematika Universitas Diponegoro pada tanggal {new Date(pengajuan.tglLulus).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} dengan Indeks Prestasi Kumulatif (IPK) {pengajuan.ipkTerakhir}/4.00 dengan Jumlah Satuan Kredit Semester (SKS) {pengajuan.jumlahSks || 144}</p>

                    <p>Demikian surat permohonan kami, atas perhatiannya kami sampaikan terimakasih.</p>

                    {/* Tanda Tangan */}
                    <div className="mt-12 flex justify-between">
                      <div className="text-center">
                        <p className="mb-4">Ketua Program Studi</p>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
