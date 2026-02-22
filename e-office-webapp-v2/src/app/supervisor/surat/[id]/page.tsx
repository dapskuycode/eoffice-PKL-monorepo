'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import RiwayatSurat from '@/components/RiwayatSurat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supervisorService } from '@/services/supervisorService';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import { FileTextOutlined, HomeOutlined, LeftOutlined, ZoomInOutlined, ZoomOutOutlined, CheckCircleOutlined, EditOutlined, CloseCircleOutlined, ClockCircleOutlined, InfoCircleOutlined, HistoryOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import SidebarMenu from '@/components/layout/SidebarMenu';
import SupervisorLayout from '@/components/layout/SupervisorLayout';

export default function SupervisorReviewSurat() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const { user } = useAuth();
  const [zoom, setZoom] = useState(100);
  const [pengajuan, setPengajuan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRevisiModal, setShowRevisiModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [revisiNote, setRevisiNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [previewModal, setPreviewModal] = useState<{ visible: boolean; url: string; title: string }>({ visible: false, url: '', title: '' });

  useEffect(() => {
    if (params && params.id) {
      fetchPengajuanDetail();
    }
  }, [params]);

  const fetchPengajuanDetail = async () => {
    if (!params || !params.id) return;
    try {
      setLoading(true);
      const pengajuanData = await supervisorService.getPengajuanDetail(params.id as string);
      if (pengajuanData) {
        setPengajuan(pengajuanData);
      }
    } catch (error) {
      console.error('Error fetching pengajuan detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetujui = async () => {
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
    if (!actorId) return;

    try {
      if (!params || !params.id) return;
      const success = await supervisorService.approvePengajuan(
        params.id as string,
        actorId,
        'Disetujui oleh Supervisor, diteruskan ke Staf Fakultas untuk pencetakan'
      );

      if (success) {
        router.push('/supervisor/dashboard');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRevisi = async () => {
    if (!user) return;
    const success = await supervisorService.requestRevision(
      (params?.id as string) || '',
      user.id,
      revisiNote || 'Perlu revisi'
    );

    if (success) {
      setShowRevisiModal(false);
      setRevisiNote('');
      router.push('/supervisor/dashboard');
    }
  };

  const handleTolak = async () => {
    if (!user || !rejectReason.trim()) return;
    const success = await supervisorService.rejectPengajuan(
      (params?.id as string) || '',
      user.id,
      rejectReason
    );

    if (success) {
      setShowRejectModal(false);
      setRejectReason('');
      router.push('/supervisor/dashboard');
    }
  };

  if (loading) {
    return (
      <SupervisorLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Memuat data...</p>
          </div>
        </div>
      </SupervisorLayout>
    );
  }

  if (!pengajuan) {
    return (
      <SupervisorLayout>
        <div className="flex items-center justify-center py-20">
          <Card className="p-8 text-center max-w-md">
            <FileTextOutlined className="text-4xl text-gray-300 mb-4" />
            <p className="text-gray-500 font-bold">Data pengajuan tidak ditemukan</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push('/supervisor/dashboard')}>Kembali ke Dashboard</Button>
          </Card>
        </div>
      </SupervisorLayout>
    );
  }

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
      <AppHeader greetingOnly={true} />

      <div className="flex" style={{ marginTop: '64px' }}>
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md fixed left-0 h-[calc(100vh-64px)] overflow-y-auto" style={{ top: '64px' }}>
          <SidebarMenu role="supervisor" collapsed={false} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden h-[calc(100vh-64px)]" style={{ marginLeft: '256px' }}>
          {/* Breadcrumb */}
          <div className="mb-6 text-sm text-gray-600 pt-2 px-8">
            <span className="cursor-pointer hover:text-blue-600" onClick={() => router.push('/supervisor/dashboard')}>Surat Masuk</span>
            <span className="mx-2">/</span>
            <span>Review Surat</span>
          </div>

          <div className="px-8 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Details */}
              <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 160px)' }}>
                {/* Detail Permohonan */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <FileTextOutlined className="text-gray-600" />
                      <CardTitle className="text-lg">Detail Permohonan</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">Pengaju</label>
                      <p className="font-medium text-gray-900">{namaLengkap}</p>
                      <p className="text-sm text-gray-500">NIM: {nim}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">Program Studi</label>
                      <p className="font-medium text-gray-900">{programStudi}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">Perihal</label>
                      <p className="font-medium text-gray-900">Surat Keterangan Lulus</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">Tgl Masuk</label>
                      <p className="font-medium text-gray-900">{new Date(pengajuan.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">Status</label>
                      <p className="font-medium text-gray-900 capitalize">{pengajuan.status.replace(/_/g, ' ')}</p>
                    </div>
                    {pengajuan.nomorSuratPengantar && (
                      <div>
                        <label className="text-sm text-gray-600 block mb-1">Nomor Surat Pengantar</label>
                        <p className="font-medium text-gray-900">{pengajuan.nomorSuratPengantar}</p>
                        <p className="text-xs text-gray-500">Diisi oleh Admin Prodi</p>
                      </div>
                    )}
                    {pengajuan.nomorSkl && (
                      <div>
                        <label className="text-sm text-gray-600 block mb-1">Nomor SKL</label>
                        <p className="font-medium text-gray-900">{pengajuan.nomorSkl}</p>
                        <p className="text-xs text-gray-500">Diisi oleh Admin Fakultas</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Tanda Tangan Ketua Prodi */}
                {pengajuan.ttdKetuaProdi && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <CheckCircleOutlined className="text-green-600" />
                        <CardTitle className="text-lg">Tanda Tangan Ketua Prodi</CardTitle>
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
                    <CardTitle className="text-lg">Lampiran</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {pengajuan.lampiran && pengajuan.lampiran.length > 0 ? (
                      pengajuan.lampiran.map((lamp: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center">
                              <FileTextOutlined className="text-red-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-gray-800 truncate max-w-[150px]">{lamp.jenisDokumen}</p>
                            </div>
                          </div>
                          <button
                            className="p-2 hover:bg-gray-200 rounded"
                            onClick={() => lamp.pathFile && setPreviewModal({ visible: true, url: lamp.pathFile, title: lamp.jenisDokumen || 'Lampiran' })}
                          >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div className="lg:col-span-2 space-y-6">
                <Card className="flex flex-col overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between py-4">
                    <div className="flex items-center gap-2">
                      <FileTextOutlined className="text-gray-600" />
                      <CardTitle className="text-lg">Pratinjau Surat</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setZoom(prev => Math.max(prev - 10, 50))}>
                        <span className="text-lg">−</span>
                      </Button>
                      <span className="text-sm font-medium min-w-[60px] text-center">{zoom}%</span>
                      <Button variant="outline" size="sm" onClick={() => setZoom(prev => Math.min(prev + 10, 150))}>
                        <span className="text-lg">+</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="bg-white p-0 overflow-hidden">
                    <div
                      className="bg-gray-100 p-8 flex justify-center overflow-auto"
                      style={{ maxHeight: 'calc(100vh - 350px)' }}
                    >
                      <div
                        className="bg-white shadow-sm p-16 transition-all duration-300"
                        style={{
                          width: '794px',
                          minHeight: '1123px',
                          transform: `scale(${zoom / 100})`,
                          transformOrigin: 'top center',
                        }}
                      >
                        <div className="max-w-2xl mx-auto text-gray-900">
                          <div className="flex justify-end mb-8">
                            <div className="border border-black px-4 py-1 text-sm font-bold">AK.008</div>
                          </div>

                          <div className="space-y-6 text-sm leading-relaxed" style={{ textAlign: 'justify' }}>
                            {pengajuan.nomorSuratPengantar && (
                              <div className="mb-4">
                                <p className="font-bold">No : {pengajuan.nomorSuratPengantar}</p>
                              </div>
                            )}

                            {pengajuan.nomorSkl && (
                              <div className="mb-4">
                                <p className="font-bold">No SKL: {pengajuan.nomorSkl}</p>
                              </div>
                            )}

                            <div className="flex gap-2 font-bold mb-6">
                              <span className="w-20">Perihal</span>
                              <span>:</span>
                              <span>Surat Keterangan Lulus</span>
                            </div>

                            <div className="flex gap-8 mb-4">
                              <span className="w-12 text-gray-600">Yth.</span>
                              <div>
                                Dekan<br />
                                Fakultas Sains dan Matematika Universitas Diponegoro<br />
                                Semarang.
                              </div>
                            </div>

                            <p>Dengan ini kami mengajukan permohonan pembuatan Surat Keterangan Lulus atas nama :</p>

                            <div className="space-y-1 ml-8">
                              {[
                                { label: 'Nama', value: namaLengkap },
                                { label: 'NIM', value: nim },
                                { label: 'Tempat/Tanggal Lahir', value: `${tempatLahir}, ${tanggalLahir}` },
                                { label: 'Alamat', value: alamat },
                                { label: 'No Telepon/HP', value: noHp },
                                { label: 'Program Studi', value: programStudi },
                              ].map((item, idx) => (
                                <div key={idx} className="flex">
                                  <span className="w-48 flex-shrink-0 text-gray-600">{item.label}</span>
                                  <span className="mr-2">:</span>
                                  <span className="font-medium">{item.value || '-'}</span>
                                </div>
                              ))}
                            </div>

                            <p>Telah dinyatakan lulus ujian Sarjana pada Departemen/Program Studi {programStudi} Fakultas Sains dan Matematika Universitas Diponegoro pada tanggal {new Date(pengajuan.tglLulus || new Date()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} dengan Indeks Prestasi Kumulatif (IPK) {pengajuan.ipkTerakhir || '0.00'}/4.00.</p>

                            <p>Demikian surat permohonan kami, atas perhatiannya kami sampaikan terimakasih.</p>

                            <div className="mt-16 flex justify-between items-start">
                              <div className="flex flex-col items-center text-center w-60">
                                <p className="mb-1">Ketua Program Studi</p>
                                <div className="h-20 flex items-center justify-center w-full my-1">
                                  {pengajuan.ttdKetuaProdi && (
                                    <Image src={pengajuan.ttdKetuaProdi} alt="TTD Kaprodi" width={110} height={70} className="object-contain" />
                                  )}
                                </div>
                                <div className="mt-1">
                                  <p className="font-bold underline mb-1">{pengajuan.mahasiswa?.programStudi?.ketuaProdi?.user?.name}</p>
                                  <p className="text-xs">NIP. {pengajuan.mahasiswa?.programStudi?.ketuaProdi?.nip || '-'}</p>
                                </div>
                              </div>

                              <div className="flex flex-col items-center text-center w-60">
                                <p className="mb-1 text-gray-600">Semarang, {new Date(pengajuan.createdAt || new Date()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <p className="mb-1">Pemohon,</p>
                                <div className="h-20 flex items-center justify-center w-full my-1">
                                  {pengajuan.tandatangan && (
                                    <Image src={pengajuan.tandatangan} alt="TTD Mahasiswa" width={110} height={70} className="object-contain" />
                                  )}
                                </div>
                                <div className="mt-1">
                                  <p className="font-bold underline mb-1">{namaLengkap}</p>
                                  <p className="text-xs">NIM {nim || '-'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Bar - Below preview */}
                {pengajuan.status === 'COMPLETED' ? (
                  <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircleOutlined className="text-white text-xl" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-green-800">Surat Sudah Selesai</h3>
                        <p className="text-sm text-green-700 mt-1">Surat Keterangan Lulus telah selesai diproses dan dinomori.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end gap-3 p-4 bg-white border rounded-lg shadow-sm">
                    <Button
                      variant="outline"
                      onClick={() => router.push('/supervisor/dashboard')}
                    >
                      Kembali
                    </Button>
                    {pengajuan.status === 'REGISTERED' && (
                      <>
                        <Button
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => setShowRejectModal(true)}
                        >
                          <CloseCircleOutlined /> Tolak
                        </Button>
                        <Button
                          variant="outline"
                          className="border-orange-200 text-orange-600 hover:bg-orange-50"
                          onClick={() => setShowRevisiModal(true)}
                        >
                          <EditOutlined /> Revisi
                        </Button>
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                          onClick={handleSetujui}
                        >
                          <CheckCircleOutlined /> Setujui Dokumen
                        </Button>
                      </>
                    )}
                    {pengajuan.status !== 'REGISTERED' && pengajuan.status !== 'COMPLETED' && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-300 rounded-lg text-sm text-blue-700">
                        <InfoCircleOutlined className="text-blue-500" />
                        <span className="font-medium">Tidak Ada Tindakan</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Revisi */}
      <Modal
        title="Kirim Permintaan Revisi"
        open={showRevisiModal}
        onCancel={() => { setShowRevisiModal(false); setRevisiNote(''); }}
        footer={null}
        centered
        width={500}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Berikan instruksi jelas pada mahasiswa mengenai bagian yang perlu diperbaiki.</p>
          <div className="p-3 bg-orange-50 rounded-lg flex items-start gap-2 text-xs text-orange-800 border-l-4 border-orange-400">
            <InfoCircleOutlined className="mt-0.5" />
            <span>Mahasiswa akan menerima notifikasi dan dapat melakukan pengeditan kembali.</span>
          </div>
          <textarea
            className="w-full border rounded-lg p-3 min-h-[120px] text-sm outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Tulis detail revisi di sini..."
            value={revisiNote}
            onChange={(e) => setRevisiNote(e.target.value)}
          />
          <div className="flex gap-2">
            <Button className="flex-1" variant="outline" onClick={() => setShowRevisiModal(false)}>Batal</Button>
            <Button
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleRevisi}
              disabled={!revisiNote.trim()}
            >Kirim Revisi</Button>
          </div>
        </div>
      </Modal>

      {/* Modal Tolak */}
      <Modal
        title="Konfirmasi Penolakan"
        open={showRejectModal}
        onCancel={() => { setShowRejectModal(false); setRejectReason(''); }}
        footer={null}
        centered
        width={500}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Mohon sertakan alasan penolakan yang objektif bagi mahasiswa.</p>
          <div className="p-3 bg-red-50 rounded-lg flex items-start gap-2 text-xs text-red-800 border-l-4 border-red-400">
            <CloseCircleOutlined className="mt-0.5" />
            <span>Tindakan ini bersifat final. Dokumen yang ditolak tidak dapat diedit kembali.</span>
          </div>
          <textarea
            className="w-full border rounded-lg p-3 min-h-[120px] text-sm outline-none focus:ring-2 focus:ring-red-100"
            placeholder="Alasan penolakan..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="flex gap-2">
            <Button className="flex-1" variant="outline" onClick={() => setShowRejectModal(false)}>Batal</Button>
            <Button
              className="flex-1 bg-red-600 text-white hover:bg-red-700"
              onClick={handleTolak}
              disabled={!rejectReason.trim()}
            >Konfirmasi Tolak</Button>
          </div>
        </div>
      </Modal>

      {/* Preview Modal Lampiran */}
      <Modal
        title={previewModal.title}
        open={previewModal.visible}
        onCancel={() => setPreviewModal({ visible: false, url: '', title: '' })}
        footer={null}
        width={1000}
        centered
      >
        <iframe src={previewModal.url} className="w-full h-[70vh] border-none" />
      </Modal>
    </div>
  );
}
