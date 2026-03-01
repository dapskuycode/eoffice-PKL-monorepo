'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { upaService } from '@/services/upaService';
import { sklService } from '@/services/sklService';
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

export default function UPAFinalisasiSurat() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [zoom, setZoom] = useState(100);
  const [pengajuan, setPengajuan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nomorFinal, setNomorFinal] = useState('');
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
      
      if (pengajuanData) {
        setPengajuan(pengajuanData);
        // Field Nomor Final SKL dimulai dari kosong, akan diisi oleh UPA
        setNomorFinal('');
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
    
    // Validasi status
    if (pengajuan?.status !== 'STEP_KONVENSIONAL') {
      alert(`Status surat tidak sesuai. Status saat ini: ${pengajuan?.status}. Harus STEP_KONVENSIONAL untuk difinalisasi.`);
      return;
    }

    if (!nomorFinal.trim()) {
      alert('Nomor final SKL harus diisi');
      return;
    }
    
    try {
      const success = await upaService.finalisasi(
        params.id as string,
        actorId,
        nomorFinal,
        `Surat SKL dengan nomor ${nomorFinal} telah selesai. Silakan mengambil Surat Keterangan Lulus di Akademik dengan membawa pas foto dan meminta cap basah`
      );

      if (success) {
        alert(`Surat berhasil difinalisasi dengan nomor SKL: ${nomorFinal}`);
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

  const handleDownloadPDF = async () => {
    try {
      // Jika ada pdfFinalPath, download dari backend
      if (pengajuan?.pdfFinalPath) {
        const response = await fetch(pengajuan.pdfFinalPath);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `SKL_${pengajuan.nomorSkl || pengajuan.mahasiswa?.nim || 'surat'}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          return;
        }
      }

      // Fallback: Print to PDF using browser's print dialog
      window.print();
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Gagal mengunduh PDF. Silakan coba lagi.');
    }
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

  const mahasiswa = pengajuan.mahasiswa;
  const namaLengkap = pengajuan.namaSementara || mahasiswa?.user?.name || 'N/A';
  const nim = mahasiswa?.nim || 'N/A';
  const email = pengajuan.emailSementara || mahasiswa?.user?.email || 'N/A';
  const noHp = pengajuan.noHpSementara || mahasiswa?.noHp || 'N/A';
  const alamat = pengajuan.alamatSementara || mahasiswa?.alamat || 'N/A';
  const tempatLahir = pengajuan.tempatLahirSementara || mahasiswa?.tempatLahir || 'N/A';
  const tanggalLahir = pengajuan.tanggalLahirSementara 
    ? new Date(pengajuan.tanggalLahirSementara).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : (mahasiswa?.tanggalLahir 
      ? new Date(mahasiswa.tanggalLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'N/A');
  const programStudi = mahasiswa?.programStudi?.name || 'N/A';

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
                onClick={() => router.push('/upa/dashboard')}
              >
                Dashboard
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden h-[calc(100vh-64px)]" style={{ marginLeft: '256px' }}>
          <div className="mb-6 text-sm text-gray-600 pt-2 px-8">
            <span className="cursor-pointer hover:text-blue-600" onClick={() => router.push('/upa/dashboard')}>Dashboard</span>
            <span className="mx-2">/</span>
            <span>Finalisasi Surat</span>
          </div>

          <div className="px-8 pb-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Details */}
            <div className="lg:col-span-1 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {/* Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Finalisasi Surat - UPA</CardTitle>
                  <p className="text-sm text-gray-600">Berikan nomor final dan finalisasi surat</p>
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
                    <label className="text-sm text-gray-600">Status</label>
                    <p className="font-medium">{pengajuan.status}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">IPK</label>
                    <p className="font-medium">{pengajuan.ipkTerakhir}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Nomor Final SKL */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Nomor Final SKL</h3>
                  <p className="text-sm text-gray-600">Masukkan atau perbarui nomor final SKL</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Nomor SKL</label>
                    <Input
                      type="text"
                      value={nomorFinal}
                      onChange={(e) => setNomorFinal(e.target.value)}
                      placeholder="Contoh: B.1234/UN7.5.10/PP/2025"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format: B.xxxx/UN7.5.10/PP/TAHUN
                    </p>
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
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleDownloadPDF}
                      className="flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Download PDF</span>
                    </Button>
                    <div className="h-6 w-px bg-gray-300"></div>
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
                  {/* Preview Surat with Sticky Note */}
                  <div className="relative bg-white border rounded-lg p-8 shadow-sm overflow-y-auto" style={{ 
                    maxHeight: 'calc(100vh - 300px)',
                    transform: `scale(${zoom / 100})`, 
                    transformOrigin: 'top left', 
                    width: `${10000 / zoom}%` 
                  }}>
                    <div className="max-w-3xl mx-auto relative">
                      {/* Sticky Note Pink - positioned on the right - Nomor Final SKL dari UPA */}
                      {nomorFinal && (
                        <div 
                          className="absolute -right-4 top-32 w-64 bg-green-100 border-2 border-green-200 rounded-lg shadow-lg p-4 transform rotate-3 z-10"
                          style={{ 
                            fontFamily: 'Comic Sans MS, cursive',
                            boxShadow: '4px 4px 10px rgba(0,0,0,0.2)'
                          }}
                        >
                          <div className="text-sm leading-relaxed text-gray-800">
                            <p className="font-bold text-center mb-3 text-green-800">
                              📋 Surat Sudah Selesai
                            </p>
                            <p className="mb-2">
                              Surat Keterangan Lulus sudah selesai dengan nomor:
                            </p>
                            <p className="font-bold text-center my-3 text-green-900 bg-white/50 p-2 rounded">
                              nomor: {nomorFinal}
                            </p>
                            <p className="mb-2">
                              Harap membawa pas foto 4x6 dan meminta cap basah di Akademik.
                            </p>
                            <p className="text-center font-semibold mt-3">
                              Terima kasih 🙏
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Header - Kotak AK.008 di kanan atas */}
                      <div className="flex justify-end mb-4">
                        <div className="border border-gray-800 px-4 py-1">
                          <span className="font-bold">AK.008</span>
                        </div>
                      </div>

                      {/* Nomor Surat Pengantar (dari Admin Prodi) */}
                      {pengajuan?.nomorSuratPengantar && (
                        <div className="mb-2">
                          <span className="font-bold">No : {pengajuan.nomorSuratPengantar}</span>
                        </div>
                      )}
                      
                      {/* Nomor SKL (dari Admin Fakultas) */}
                      {pengajuan?.nomorSkl && (
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

                  {/* Action Buttons */}
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
                  ) : (
                    <div className="flex gap-3 mt-6 justify-end">
                      <Button 
                        variant="outline"
                        onClick={() => router.back()}
                      >
                        Tutup
                      </Button>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleFinalisasi}
                      >
                        Finalisasi Surat
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
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