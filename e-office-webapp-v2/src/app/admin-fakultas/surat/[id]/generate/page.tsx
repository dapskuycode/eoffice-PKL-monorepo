'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function GenerateSuratPage() {
  const router = useRouter();
  const params = useParams();
  const [zoom, setZoom] = useState(100);

  // Mock data
  const surat = {
    id: params?.id,
    pengaju: 'Ahmad Douglas',
    nim: '24060121130063',
    perihal: 'Surat Keterangan Lulus',
    tglMasuk: '20 Oktober 2023',
    jenisSurat: 'Surat Keterangan Lulus',
    programStudi: 'S1 - Informatika',
    tempatTanggalLahir: 'Semarang, 17 Agustus 1945',
    alamat: 'Semarang, Jl.ZYX',
    noTelepon: '081229102909',
    lampiran: [
      { name: 'Kartu Tanda Mahasiswa (KTM)', file: 'File KTM.pdf', size: '2.1 KB' },
      { name: 'Kartu Tanda Mahasiswa (KTM)', file: 'File KTM.pdf', size: '2.1 KB' },
      { name: 'Kartu Tanda Mahasiswa (KTM)', file: 'File KTM.pdf', size: '2.1 KB' },
      { name: 'Kartu Tanda Mahasiswa (KTM)', file: 'File KTM.pdf', size: '2.1 KB' },
      { name: 'Kartu Tanda Mahasiswa (KTM)', file: 'File KTM.pdf', size: '2.1 KB' },
      { name: 'Kartu Tanda Mahasiswa (KTM)', file: 'File KTM.pdf', size: '2.1 KB' }
    ]
  };

  const handleGenerateDanSetujui = () => {
    alert('Surat berhasil di-generate dan disetujui!');
    router.push('/admin-fakultas/dashboard');
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 150));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

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
            <div className="lg:col-span-1 space-y-6">
              {/* Generate Surat Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Generate Surat</CardTitle>
                  <p className="text-sm text-gray-600">Lengkapi dan isian, tembah data sesuaikan nomor surat diterbitkan</p>
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
                    <p className="font-medium">{surat.pengaju}</p>
                    <p className="text-sm text-gray-500">NIM: {surat.nim}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Perihal</label>
                    <p className="font-medium">{surat.perihal}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Tgl Masuk</label>
                    <p className="font-medium">{surat.tglMasuk}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Jenis Surat</label>
                    <p className="font-medium">{surat.jenisSurat}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Tanda Tangan Mahasiswa */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <h3 className="font-semibold">Tanda Tangan Mahasiswa</h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-32 h-32 bg-white border-2 border-gray-300 flex items-center justify-center">
                      <svg className="w-24 h-24" viewBox="0 0 100 100">
                        <rect width="100" height="100" fill="white" />
                        <rect x="10" y="10" width="10" height="10" fill="black" />
                        <rect x="30" y="10" width="10" height="10" fill="black" />
                        <rect x="50" y="10" width="10" height="10" fill="black" />
                        <rect x="70" y="10" width="10" height="10" fill="black" />
                        <rect x="10" y="30" width="10" height="10" fill="black" />
                        <rect x="70" y="30" width="10" height="10" fill="black" />
                        <rect x="10" y="50" width="10" height="10" fill="black" />
                        <rect x="30" y="50" width="10" height="10" fill="black" />
                        <rect x="50" y="50" width="10" height="10" fill="black" />
                        <rect x="70" y="50" width="10" height="10" fill="black" />
                        <rect x="10" y="70" width="10" height="10" fill="black" />
                        <rect x="70" y="70" width="10" height="10" fill="black" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lampiran */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Lampiran</h3>
                </CardHeader>
                <CardContent className="space-y-2">
                  {surat.lampiran.map((lampiran, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-xs truncate">{idx + 1}. {lampiran.name}</p>
                        </div>
                      </div>
                      <button className="p-1 hover:bg-gray-200 rounded flex-shrink-0">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Kembali Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.back()}
              >
                Kembali
              </Button>
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
                  <div className="bg-white border rounded-lg p-8 shadow-sm" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left', width: `${10000 / zoom}%` }}>
                    <div className="max-w-3xl mx-auto">
                      {/* Header - Kotak AK.008 di kanan atas */}
                      <div className="flex justify-end mb-4">
                        <div className="border border-gray-800 px-4 py-1">
                          <span className="font-bold">AK.008</span>
                        </div>
                      </div>

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
                            <span>{surat.pengaju}</span>
                          </div>
                          <div className="flex">
                            <span className="w-48 flex-shrink-0">NIM</span>
                            <span className="flex-shrink-0 mr-2">:</span>
                            <span>{surat.nim}</span>
                          </div>
                          <div className="flex">
                            <span className="w-48 flex-shrink-0">Tempat/Tanggal Lahir</span>
                            <span className="flex-shrink-0 mr-2">:</span>
                            <span>{surat.tempatTanggalLahir}</span>
                          </div>
                          <div className="flex">
                            <span className="w-48 flex-shrink-0">Alamat</span>
                            <span className="flex-shrink-0 mr-2">:</span>
                            <span>{surat.alamat}</span>
                          </div>
                          <div className="flex">
                            <span className="w-48 flex-shrink-0">No Telepon/HP</span>
                            <span className="flex-shrink-0 mr-2">:</span>
                            <span>{surat.noTelepon}</span>
                          </div>
                          <div className="flex">
                            <span className="w-48 flex-shrink-0"></span>
                            <span className="flex-shrink-0 mr-2"></span>
                            <span>Informatika</span>
                          </div>
                        </div>

                        <p>Telah dinyatakan lulus ujian Sarjana pada Departemen/Program Studi ...................../S1 .................. Fakultas Sains dan Matematika Universitas Diponegoro pada tanggal .............. dengan Indeks Prestasi Kumulatif (IPK) ..../4 dengan Jumlah Satuan Kredit Semester (SKS) 144</p>

                        <div className="mt-6">
                          <p className="font-semibold mb-2">Berikut kami lampirkan :</p>
                          <ul className="list-disc ml-8 space-y-1">
                            <li>Kartu Tanda Mahasiswa (KTM)</li>
                            <li>Pas Photo hitam putih berwarna uk. 4 x 6 sebanyak 2 lembar</li>
                            <li>Foto Copy Berita Acara Kelulusan</li>
                            <li>Foto Copy Berita Acara Ujian Sarjana</li>
                            <li>Transkrip Akademik Terbaru yang ditandatangai Dekan .............. Prosen Komulatif (IPK)</li>
                          </ul>
                        </div>

                        <p>Demikian surat permohonan kami, atas perhatiannya kami sampaikan terimakasih.</p>

                        <div className="mt-12 flex justify-between">
                          <div className="text-center">
                            <p className="mb-16">Mengetahui</p>
                            <p>Ketua Departemen .................</p>
                            <div className="mt-16">
                              <p className="border-b border-gray-800 inline-block">................................</p>
                              <p>NIP. ........................</p>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="mb-2">Semarang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            <p className="mb-16">Pemohon,</p>
                            <div className="mt-16">
                              <p className="border-b border-gray-800 inline-block">{surat.pengaju}</p>
                              <p>NIM {surat.nim}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      Tutup
                    </Button>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handleGenerateDanSetujui}
                    >
                      Generate dan Setujui
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
