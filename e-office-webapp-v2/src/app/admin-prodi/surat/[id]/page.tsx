'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import RiwayatSurat from '@/components/RiwayatSurat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { sklService } from '@/services/sklService';
import { adminProdiService } from '@/services/adminProdiService';
import { useAuth } from '@/hooks/useAuth';
import { FileTextOutlined, HomeOutlined, LeftOutlined, ZoomInOutlined, ZoomOutOutlined, CheckCircleOutlined, EditOutlined, CloseCircleOutlined, ClockCircleOutlined, InfoCircleOutlined, HistoryOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
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

export default function AdminProdiDetailSurat() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const { user } = useAuth();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRevisiModal, setShowRevisiModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [revisiNote, setRevisiNote] = useState('');
  const [surat, setSurat] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previewModal, setPreviewModal] = useState<{ visible: boolean; url: string; title: string }>({ visible: false, url: '', title: '' });

  useEffect(() => {
    if (params && params.id) {
      fetchSuratDetail();
    }
  }, [params]);

  const fetchSuratDetail = async () => {
    if (!params || !params.id) return;
    try {
      setLoading(true);
      const pengajuanData = await sklService.getPengajuanDetail(params.id as string);

      if (pengajuanData) {
        // Format data for display
        // Prioritas: data sementara (yang diisi mahasiswa) > data master
        const formattedSurat = {
          id: pengajuanData.id,
          status: pengajuanData.status,
          namaLengkap: pengajuanData.namaSementara || pengajuanData.mahasiswa?.user?.name || 'N/A',
          role: 'Mahasiswa',
          nim: pengajuanData.nimSementara || pengajuanData.mahasiswa?.nim || 'N/A',
          programStudi: pengajuanData.prodiSementara || pengajuanData.mahasiswa?.programStudi?.name || 'N/A',
          email: pengajuanData.emailSementara || pengajuanData.mahasiswa?.user?.email || 'N/A',
          noHp: pengajuanData.noHpSementara || pengajuanData.mahasiswa?.noHp || 'N/A',
          jenisKelamin: 'Surat Keterangan Lulus',
          tujuan: 'Admin Prodi',
          noSurat: pengajuanData.nomorSuratPengantar || '-',
          perihal: 'Surat Keterangan Lulus',
          divisiPT: new Date(pengajuanData.tglLulus).toLocaleDateString('id-ID'),
          keperluan: `IPK: ${pengajuanData.ipkTerakhir}`,
          lampiran: pengajuanData.lampiran?.map((l: any) => ({
            name: l.jenisDokumen,
            file: l.pathFile?.split('/').pop() || 'Dokumen',
            url: l.pathFile,
            size: '-'
          })) || [],
          riwayat: pengajuanData.riwayat?.map((r: any) => ({
            role: 'User',
            date: new Date(r.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            status: r.statusBaru,
            catatan: r.catatan || 'Tidak ada catatan'
          })) || []
        };
        setSurat(formattedSurat);
      }
    } catch (error) {
      console.error('Error fetching surat detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetujuiDanGenerate = () => {
    if (params && params.id) {
      // Redirect to generate page
      router.push(`/admin-prodi/surat/${params.id}/generate`);
    }
  };

  const handleRevisi = async () => {
    if (!user) return;

    try {
      setSubmitting(true);
      const success = await adminProdiService.requestRevision(
        params.id as string,
        user.id,
        revisiNote || 'Perlu revisi'
      );

      if (success) {
        setShowRevisiModal(false);
        setRevisiNote('');
        fetchSuratDetail();
        router.push('/admin-prodi/dashboard');
      } else {
        setSubmitting(false);
      }
    } catch (err) {
      console.error('Error request revision:', err);
      setSubmitting(false);
    }
  };

  const handleTolak = async () => {
    if (!user) return;

    if (!rejectReason || rejectReason.trim() === '') {
      alert('Mohon isi alasan penolakan');
      return;
    }

    try {
      setSubmitting(true);
      const success = await adminProdiService.rejectPengajuan(
        params.id as string,
        user.id,
        rejectReason
      );

      if (success) {
        alert('Surat berhasil ditolak');
        setShowRejectModal(false);
        setRejectReason('');
        await fetchSuratDetail();
        router.push('/admin-prodi/dashboard');
      } else {
        alert('Gagal menolak surat. Silakan coba lagi.');
        setSubmitting(false);
      }
    } catch (err) {
      console.error('Error rejecting:', err);
      alert('Terjadi kesalahan saat menolak surat');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader greetingOnly={true} />

      <div className="flex" style={{ marginTop: '64px' }}>
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md fixed left-0 h-[calc(100vh-64px)] overflow-y-auto" style={{ top: '64px' }}>
          <SidebarMenu role="admin_prodi" collapsed={false} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8" style={{ marginLeft: '256px' }}>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : !surat ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">Surat tidak ditemukan</div>
            </div>
          ) : (
            <>
              {/* Breadcrumb */}
              <div className="mb-6 text-sm text-gray-600">
                <span className="cursor-pointer hover:text-blue-600" onClick={() => router.push('/admin-prodi/dashboard')}>Surat Masuk</span>
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
                          <p className="font-medium">{surat.namaLengkap}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Role</label>
                          <p className="font-medium">{surat.role}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">NIM</label>
                          <p className="font-medium">{surat.nim}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Program Studi</label>
                          <p className="font-medium">{surat.programStudi}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Email</label>
                          <p className="font-medium text-sm">{surat.email}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">No. HP</label>
                          <p className="font-medium">{surat.noHp}</p>
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
                          <label className="text-sm text-gray-600">Jenis & Kategori</label>
                          <p className="font-medium">{surat.jenisKelamin}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Tujuan</label>
                          <p className="font-medium">{surat.tujuan}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">No Surat</label>
                          <p className="font-medium">{surat.noSurat}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Perihal</label>
                          <p className="font-medium">{surat.perihal}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Divisi PT</label>
                          <p className="font-medium">{surat.divisiPT}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Keperluan</label>
                          <p className="font-medium">{surat.keperluan}</p>
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
                      {surat.lampiran.map((lampiran: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center">
                              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{lampiran.name}</p>
                            </div>
                          </div>
                          <button
                            className="p-2 hover:bg-gray-200 rounded"
                            onClick={() => {
                              if (lampiran.url) {
                                setPreviewModal({ visible: true, url: lampiran.url, title: lampiran.name });
                              }
                            }}
                          >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Actions & History */}
                <div className="space-y-6">
                  {/* Aksi */}
                  {surat.status === 'SUBMITTED' ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Aksi</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button
                          className="w-full bg-green-500 hover:bg-green-600 text-white"
                          onClick={handleSetujuiDanGenerate}
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Setujui dan Generate Surat
                        </Button>
                        <Button
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                          onClick={() => setShowRevisiModal(true)}
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Revisi
                        </Button>
                        <Button
                          className="w-full bg-red-500 hover:bg-red-600 text-white"
                          onClick={() => setShowRejectModal(true)}
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Tolak
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Status Pengajuan</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {(surat.status === 'VERIFIED_ADMIN' || surat.status === 'APPROVED_KAPRODI' || surat.status === 'REGISTERED' || surat.status === 'SIAP_CETAK' || surat.status === 'COMPLETED') && (
                          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-green-800 mb-1">
                                  {surat.status === 'VERIFIED_ADMIN' && 'Berkas Terverifikasi'}
                                  {surat.status === 'APPROVED_KAPRODI' && 'Disetujui Kaprodi'}
                                  {surat.status === 'REGISTERED' && 'Nomor Surat Terdaftar'}
                                  {surat.status === 'SIAP_CETAK' && 'Siap Cetak'}
                                  {surat.status === 'COMPLETED' && 'Surat Selesai'}
                                </h3>
                                <p className="text-sm text-green-700">
                                  {surat.status === 'VERIFIED_ADMIN' && 'Pengajuan telah diverifikasi dan sedang menunggu persetujuan Ketua Program Studi.'}
                                  {surat.status === 'APPROVED_KAPRODI' && 'Pengajuan telah disetujui Ketua Prodi dan siap untuk didaftarkan nomornya.'}
                                  {surat.status === 'REGISTERED' && 'Nomor surat telah didaftarkan dan sedang dalam proses selanjutnya.'}
                                  {surat.status === 'SIAP_CETAK' && 'Dokumen telah diverifikasi supervisor dan siap untuk dicetak.'}
                                  {surat.status === 'COMPLETED' && 'SKL telah selesai diproses dan telah dinomori oleh UPA.'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {surat.status === 'REVISI' && (
                          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-yellow-800 mb-1">Perlu Revisi</h3>
                                <p className="text-sm text-yellow-700">
                                  Pengajuan memerlukan perbaikan dari mahasiswa. Silakan periksa catatan revisi di riwayat.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {surat.status === 'REJECTED' && (
                          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-red-800 mb-1">Pengajuan Ditolak</h3>
                                <p className="text-sm text-red-700">
                                  Pengajuan telah ditolak. Mahasiswa perlu mengajukan kembali dengan perbaikan yang diperlukan.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Riwayat Surat */}
                  <RiwayatSurat
                    pengajuanId={params.id as string}
                    title="Riwayat Surat"
                  />
                </div>
              </div>
            </>
          )}
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
            <span>Mahasiswa akan menerima notifikasi and dapat melakukan pengeditan kembali.</span>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">Admin Prodi</h4>
            <textarea
              className="w-full border rounded-lg p-3 min-h-[120px] text-sm outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Tulis detail revisi di sini..."
              value={revisiNote}
              onChange={(e) => setRevisiNote(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" variant="outline" onClick={() => setShowRevisiModal(false)}>Kembali</Button>
            <Button
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleRevisi}
              disabled={submitting || !revisiNote.trim()}
            >
              {submitting ? 'Memproses...' : 'Kirim Revisi'}
            </Button>
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
            <Button className="flex-1" variant="outline" onClick={() => setShowRejectModal(false)}>Kembali</Button>
            <Button
              className="flex-1 bg-red-600 text-white hover:bg-red-700"
              onClick={handleTolak}
              disabled={submitting || !rejectReason.trim()}
            >
              {submitting ? 'Memproses...' : 'Konfirmasi Tolak'}
            </Button>
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
