'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import RiwayatSurat from '@/components/RiwayatSurat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { sklService } from '@/services/sklService';
import { kaprodiService } from '@/services/kaprodiService';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import SidebarMenu from '@/components/layout/SidebarMenu';

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

export default function KetuaProdiDetailSurat() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const { user } = useAuth();
  const [zoom, setZoom] = useState(100);
  const [pengajuan, setPengajuan] = useState<any>(null);
  const [uploadedSignature, setUploadedSignature] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureType, setSignatureType] = useState<'handwriting' | 'upload' | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [previewModal, setPreviewModal] = useState<{ visible: boolean; url: string; title: string }>({ visible: false, url: '', title: '' });

  useEffect(() => {
    if (params?.id) {
      fetchPengajuanDetail();
    }
  }, [params?.id]);

  const fetchPengajuanDetail = async () => {
    try {
      setLoading(true);
      const pengajuanId = params?.id as string;
      if (!pengajuanId) return;
      const pengajuanData = await sklService.getPengajuanDetail(pengajuanId);

      if (pengajuanData) {
        setPengajuan(pengajuanData);
        console.log('Data Ketua Prodi:', pengajuanData.mahasiswa?.programStudi?.ketuaProdi);
        console.log('Nama Ketua Prodi:', pengajuanData.mahasiswa?.programStudi?.ketuaProdi?.user?.name);
        console.log('NIP Ketua Prodi:', pengajuanData.mahasiswa?.programStudi?.ketuaProdi?.nip);

        // Load existing signature if available (untuk revisi)
        if (pengajuanData.ttdKetuaProdi) {
          setSignaturePreview(pengajuanData.ttdKetuaProdi);
          setSignatureType('upload'); // Treat existing signature as uploaded
          console.log('Loaded existing signature:', pengajuanData.ttdKetuaProdi);
        }
      }
    } catch (error) {
      console.error('Error fetching pengajuan detail:', error);
      alert('Gagal memuat data pengajuan');
    } finally {
      setLoading(false);
    }
  };

  const handleHandwriting = () => {
    setSignatureType('handwriting');
    setShowSignatureModal(true);
  };

  const handleUploadSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedSignature(file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setSignaturePreview(previewUrl);
      setSignatureType('upload');
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveHandwritingSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isEmpty = !ctx
      .getImageData(0, 0, canvas.width, canvas.height)
      .data.some((byte) => byte !== 0);

    if (isEmpty) {
      alert('Mohon berikan tanda tangan terlebih dahulu.');
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    setSignaturePreview(dataUrl);
    setSignatureType('handwriting');
    setShowSignatureModal(false);
    alert('Tanda tangan berhasil disimpan!');
  };

  const handleRemoveSignature = () => {
    setUploadedSignature(null);
    if (signaturePreview && signatureType === 'upload') {
      URL.revokeObjectURL(signaturePreview);
    }
    setSignaturePreview(null);
    setSignatureType(null);

    // Reset input file element
    const fileInput = document.getElementById('signature-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    // Clear canvas if handwriting
    clearCanvas();
  };

  const handleSetujui = async () => {
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

    console.log('=== DEBUG KAPRODI APPROVE ===');
    console.log('User from hook:', user);
    console.log('User from localStorage:', localStorage.getItem('user'));
    console.log('Current user:', currentUser);
    console.log('Pengajuan mahasiswa:', pengajuan?.mahasiswa);

    // DEVELOPMENT MODE: Use mahasiswa's userId (not mahasiswaId)
    // mahasiswa.userId is the actual user.id we need
    const actorId = currentUser?.id || pengajuan?.mahasiswa?.userId;

    console.log('Using actorId (userId from mahasiswa):', actorId);

    if (!actorId) {
      alert('Error: Tidak dapat menemukan user ID yang valid');
      return;
    }

    if (!signaturePreview) {
      alert('Silakan buat atau upload tanda tangan terlebih dahulu!');
      return;
    }

    try {
      setSubmitting(true);
      let base64Signature = signaturePreview;

      // If signature is from upload (File object), convert to base64
      if (signatureType === 'upload' && uploadedSignature) {
        const reader = new FileReader();
        const promise = new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(uploadedSignature);
        });
        base64Signature = await promise;
      }

      const pengajuanId = params?.id as string;
      if (!pengajuanId) {
        alert('ID pengajuan tidak ditemukan');
        setSubmitting(false);
        return;
      }

      const success = await kaprodiService.approvePengajuan(
        pengajuanId,
        actorId, // Use userId (not mahasiswaId)
        'Disetujui oleh Ketua Program Studi',
        base64Signature // Pass signature as base64
      );

      if (success) {
        alert('Surat berhasil disetujui!');
        router.push('/ketua-prodi/dashboard');
      } else {
        alert('Gagal menyetujui surat');
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat memproses surat');
      setSubmitting(false);
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
            <Button onClick={() => router.back()} className="mt-4">
              Kembali
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
  const mahasiswa = pengajuan.mahasiswa;
  const canSign = pengajuan.status === 'VERIFIED_ADMIN';

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <AppHeader greetingOnly={true} />

      <div className="flex" style={{ marginTop: '64px' }}>
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md fixed left-0 h-[calc(100vh-64px)] overflow-y-auto" style={{ top: '64px' }}>
          <SidebarMenu role="ketua_prodi" collapsed={false} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden h-[calc(100vh-64px)]" style={{ marginLeft: '256px' }}>
          {/* Breadcrumb */}
          <div className="mb-6 text-sm text-gray-600 pt-2 px-8">
            <span className="cursor-pointer hover:text-blue-600" onClick={() => router.push('/ketua-prodi/dashboard')}>Surat Masuk</span>
            <span className="mx-2">/</span>
            <span>Penerima</span>
            <span className="mx-2">/</span>
            <span>Identitas Pemohon</span>
          </div>

          <div className="px-8 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Details */}
              <div className="lg:col-span-1 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                {/* Proses Penandatanganan */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Proses Penandatanganan</CardTitle>
                    <p className="text-sm text-gray-500">Lengkapi dan isi kembali data penerima nomor surat disebutkan</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Data Kaprodi - For development, show as Ketua Prodi */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <p className="font-semibold text-blue-900">Ketua Program Studi</p>
                        </div>
                        <p className="text-sm text-blue-700">Program Studi: {programStudi}</p>
                        <p className="text-xs text-blue-600">Fakultas Sains dan Matematika</p>
                      </div>
                    </div>

                    {!canSign && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                        <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs text-amber-800">
                          {pengajuan.status === 'SUBMITTED' || pengajuan.status === 'MENUNGGU_PERSETUJUAN_ADMIN_PRODI'
                            ? 'Surat belum diverifikasi oleh admin prodi. Anda belum dapat memberikan tanda tangan.'
                            : 'Surat sudah diproses atau disetujui. Perubahan tanda tangan tidak diizinkan.'}
                        </p>
                      </div>
                    )}

                    {canSign && (
                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={handleHandwriting}
                        >
                          Handwriting
                        </Button>
                        <Button
                          className="w-full bg-blue-400 hover:bg-blue-500 text-white"
                          onClick={() => document.getElementById('signature-upload')?.click()}
                          type="button"
                        >
                          Upload Tanda Tangan
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadSignature}
                          className="hidden"
                          id="signature-upload"
                        />
                      </div>
                    )}

                    {signaturePreview && (
                      <div className="space-y-3">
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-700 mb-2">
                            ✓ Tanda tangan berhasil {signatureType === 'handwriting' ? 'dibuat' : 'diupload'}
                          </p>
                          <div className="flex justify-center p-2 bg-white rounded border border-green-300">
                            <img
                              src={signaturePreview}
                              alt="Preview Tanda Tangan"
                              className="max-h-20 object-contain"
                            />
                          </div>
                        </div>
                        {canSign && (
                          <Button
                            variant="outline"
                            className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={handleRemoveSignature}
                          >
                            Hapus Tanda Tangan
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
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
                      <label className="text-sm text-gray-600">Status</label>
                      <p className="font-medium">{pengajuan.status}</p>
                    </div>
                  </CardContent>
                </Card>

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
                            onClick={() => lamp.pathFile && setPreviewModal({ visible: true, url: lamp.pathFile, title: lamp.jenisDokumen })}
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

                {/* Riwayat Surat */}
                <RiwayatSurat
                  pengajuanId={(params?.id as string) || ''}
                  title="Riwayat Surat"
                />
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

                        {/* Nomor Surat - muncul jika sudah ada */}
                        {pengajuan.nomorSuratPengantar && (
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
                          </div>

                          <p>Telah dinyatakan lulus ujian Sarjana pada Departemen/Program Studi {programStudi} Fakultas Sains dan Matematika Universitas Diponegoro pada tanggal {new Date(pengajuan.tglLulus).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} dengan Indeks Prestasi Kumulatif (IPK) {pengajuan.ipkTerakhir}/4.00 dengan Jumlah Satuan Kredit Semester (SKS) {pengajuan.jumlahSks || 0}</p>

                          <p>Demikian surat permohonan kami, atas perhatiannya kami sampaikan terimakasih.</p>

                          <div className="mt-12 flex justify-between">
                            <div className="text-center">
                              <p className="mb-4">Ketua Program Studi</p>
                              {/* Tanda tangan Kaprodi - prioritas signaturePreview (baru dibuat) > ttdKetuaProdi (tersimpan) */}
                              {(signaturePreview || pengajuan.ttdKetuaProdi) && (
                                <div className="inline-block mb-2">
                                  <Image
                                    src={signaturePreview || pengajuan.ttdKetuaProdi}
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

                {/* Action Buttons - Outside card for fixed positioning */}
                <div className="flex gap-3 mt-6 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Tutup
                  </Button>
                  {pengajuan.status === 'VERIFIED_ADMIN' && (
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white min-w-[150px]"
                      onClick={handleSetujui}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Memproses...
                        </span>
                      ) : (
                        'Simpan & Tandatangani'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Handwriting */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Buat Tanda Tangan</h3>

            <div className="mb-4 text-center text-gray-600">
              Silakan menandatangani di area bawah ini
            </div>

            <canvas
              ref={canvasRef}
              width={600}
              height={250}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={(e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const mouseEvent = new MouseEvent('mousedown', {
                  clientX: touch.clientX,
                  clientY: touch.clientY
                });
                canvasRef.current?.dispatchEvent(mouseEvent);
              }}
              onTouchMove={(e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const mouseEvent = new MouseEvent('mousemove', {
                  clientX: touch.clientX,
                  clientY: touch.clientY
                });
                canvasRef.current?.dispatchEvent(mouseEvent);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                const mouseEvent = new MouseEvent('mouseup', {});
                canvasRef.current?.dispatchEvent(mouseEvent);
              }}
              className="border-2 border-gray-300 rounded-lg cursor-crosshair block mx-auto bg-gray-50"
            />

            <div className="mt-4 flex gap-3 justify-between">
              <Button
                variant="outline"
                onClick={clearCanvas}
              >
                Bersihkan
              </Button>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSignatureModal(false);
                    setSignatureType(null);
                    clearCanvas();
                  }}
                >
                  Batal
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={saveHandwritingSignature}
                >
                  Simpan
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
