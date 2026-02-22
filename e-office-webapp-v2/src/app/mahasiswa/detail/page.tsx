'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card, Descriptions, Button, Space, Typography,
  Divider, Row, Col, Spin, App, Modal,
  Tag, Alert, List, Tooltip, Image
} from 'antd';
import {
  ArrowLeftOutlined,
  FilePdfOutlined,
  EyeOutlined,
  UserOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
  EditOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ClockCircleFilled,
  FileImageOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import RiwayatSurat, { RiwayatItem } from '@/components/RiwayatSurat';
import { sklService } from '@/services/sklService';
import { useAuth } from '@/hooks/useAuth';
import { Pengajuan, ApprovalLog, ApprovalAction } from '@/types';

const { Title, Text, Paragraph } = Typography;

function DetailPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message } = App.useApp();
  const { user: session } = useAuth();
  const pengajuanId = searchParams?.get('id') || null;

  const [loading, setLoading] = useState(true);
  const [pengajuan, setPengajuan] = useState<Pengajuan | null>(null);
  const [approvalLogs, setApprovalLogs] = useState<ApprovalLog[]>([]);
  const [previewModal, setPreviewModal] = useState<{ visible: boolean; url: string; title: string; type: string }>({ visible: false, url: '', title: '', type: '' });

  // --- LOGIC FETCHING DATA (TIDAK DIUBAH AGAR FUNGSIONALITAS TETAP SAMA) ---
  useEffect(() => {
    if (pengajuanId) {
      fetchPengajuanDetail();
    }
  }, [pengajuanId]);

  const fetchPengajuanDetail = async () => {
    try {
      setLoading(true);
      if (!pengajuanId) {
        message.warning('ID pengajuan tidak ditemukan');
        return;
      }

      const pengajuanData = await sklService.getPengajuanDetail(pengajuanId);

      if (!pengajuanData) {
        message.error('Surat tidak ditemukan');
        return;
      }

      // Convert to compatible format
      const formattedPengajuan: any = {
        id: pengajuanData.id,
        jenis_surat: 'Surat Keterangan Lulus',
        status: pengajuanData.status,
        nomor_surat: pengajuanData.nomorSuratPengantar || pengajuanData.nomorSkl,
        created_at: new Date(pengajuanData.createdAt).toISOString(),
        updated_at: new Date(pengajuanData.updatedAt).toISOString(),
        mahasiswa: pengajuanData.mahasiswa ? {
          nama: pengajuanData.namaSementara || pengajuanData.mahasiswa.user?.name || '',
          nim: pengajuanData.nimSementara || pengajuanData.mahasiswa.nim || '',
          emailKampus: pengajuanData.emailSementara || pengajuanData.mahasiswa.user?.email || '',
          user: {
            name: pengajuanData.namaSementara || pengajuanData.mahasiswa.user?.name || '',
            email: pengajuanData.emailSementara || pengajuanData.mahasiswa.user?.email || ''
          },
          prodi: pengajuanData.prodiSementara || pengajuanData.mahasiswa.programStudi?.name || '',
          programStudi: {
            name: pengajuanData.prodiSementara || pengajuanData.mahasiswa.programStudi?.name || ''
          },
          departemen: {
            name: pengajuanData.departemenSementara || pengajuanData.mahasiswa.departemen?.name || 'Sains dan Matematika'
          },
          tempatLahir: pengajuanData.tempatLahirSementara || pengajuanData.mahasiswa.tempatLahir,
          tanggalLahir: pengajuanData.tanggalLahirSementara || pengajuanData.mahasiswa.tanggalLahir,
          noHp: pengajuanData.noHpSementara || pengajuanData.mahasiswa.noHp,
          alamat: pengajuanData.alamatSementara || pengajuanData.mahasiswa.alamat
        } : null,
        detailSKL: {
          jenisSurat: 'Surat Keterangan Lulus',
          ipk: pengajuanData.ipkTerakhir,
          tanggalLulus: pengajuanData.tglLulus,
          jumlahSks: pengajuanData.jumlahSks
        },
        lampiranList: pengajuanData.lampiran?.map((l: any) => ({
          id: l.id,
          namaFile: l.pathFile?.split('/').pop()?.split('?')[0] || 'Dokumen',
          kategori: l.jenisDokumen,
          filePath: l.pathFile,
          dataUrl: l.pathFile,
          tipeFile: l.pathFile?.includes('.pdf') ? 'application/pdf' : 'image/jpeg',
          ukuranFile: 0
        })) || [],
        signature: pengajuanData.tandatangan || null,
        catatan: pengajuanData.riwayat?.[0]?.catatan || null
      };

      const riwayatData = await sklService.getRiwayat(pengajuanId);

      const logs: ApprovalLog[] = riwayatData.map((r: any, index: number) => ({
        id: r.id || (index + 1).toString(),
        pengajuanId: pengajuanId,
        approverId: r.actorId,
        action: 'update',
        note: r.catatan || `Status berubah menjadi ${r.statusBaru}`,
        createdAt: r.timestamp
      }));

      const latestCatatan = riwayatData.length > 0 ? riwayatData[riwayatData.length - 1]?.catatan : null;
      if (latestCatatan) {
        formattedPengajuan.catatan = latestCatatan;
      }

      setPengajuan(formattedPengajuan);
      setApprovalLogs(logs);
    } catch (error) {
      console.error('Error fetching pengajuan:', error);
      message.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  // --- HELPER FUNCTIONS FOR UI ---

  const getLampiranLabel = (kategori: string | undefined): string => {
    const labelMap: { [key: string]: string } = {
      'ktm': 'KTM',
      'KTM': 'KTM',
      'berita_acara': 'BERITA ACARA KELULUSAN',
      'BERITA_ACARA': 'BERITA ACARA KELULUSAN',
      'ujian_sarjana': 'SCAN BERITA ACARA UJIAN SARJANA',
      'UJIAN_SARJANA': 'SCAN BERITA ACARA UJIAN SARJANA',
      'BUKTI_SUBMIT': 'BUKTI SUBMIT HKI/NOMOR URUT',
      'pas_foto': 'PAS FOTO HITAM PUTIH/BERWARNA UKURAN 4X6',
      'PAS_FOTO': 'PAS FOTO HITAM PUTIH/BERWARNA UKURAN 4X6',
      'transkrip': 'TRANSKRIP AKADEMIK TERBAIK DITANDATANGANI DEKAN',
      'TRANSKRIP': 'TRANSKRIP AKADEMIK TERBAIK DITANDATANGANI DEKAN',
      'bukti_submit': 'BUKTI SUBMIT HKI/NOMOR URUT',
      'lainnya': 'LAINNYA',
      'LAINNYA': 'LAINNYA'
    };

    if (!kategori) return 'DOKUMEN';

    // Try direct match
    if (labelMap[kategori]) return labelMap[kategori];

    // Try without underscore
    const normalized = kategori.toLowerCase().replace(/_/g, ' ');
    const found = Object.keys(labelMap).find(key =>
      key.toLowerCase().replace(/_/g, ' ') === normalized
    );

    return found ? labelMap[found] : kategori.toUpperCase().replace(/_/g, ' ');
  };

  const handleEditSurat = () => {
    if (!pengajuan || !pengajuanId) return;

    // Save data untuk edit mode (Sama seperti logic original)
    localStorage.setItem('skl_draft_id', pengajuanId);

    // Logic formatting date
    let formattedTanggalLahir = '';
    if (mahasiswa?.tanggalLahir) {
      try {
        const date = new Date(mahasiswa.tanggalLahir);
        formattedTanggalLahir = date.toISOString().split('T')[0];
      } catch (e) { formattedTanggalLahir = mahasiswa.tanggalLahir; }
    }

    localStorage.setItem('skl_data_diri', JSON.stringify({
      nama: mahasiswa?.nama || mahasiswa?.user?.name || '',
      role: 'Mahasiswa',
      nim: mahasiswa?.nim || '',
      email: mahasiswa?.emailKampus || mahasiswa?.user?.email || '',
      departemen: mahasiswa?.departemen?.name || '',
      prodi: mahasiswa?.programStudi?.name || '',
      tempatLahir: mahasiswa?.tempatLahir || '',
      tanggalLahir: formattedTanggalLahir,
      no_hp: mahasiswa?.noHp || '',
      alamat: mahasiswa?.alamat || ''
    }));

    let formattedTanggalLulus = '';
    if (detailSKL?.tanggalLulus) {
      try {
        const date = new Date(detailSKL.tanggalLulus);
        formattedTanggalLulus = date.toISOString().split('T')[0];
      } catch (e) { formattedTanggalLulus = detailSKL.tanggalLulus; }
    }

    localStorage.setItem('skl_detail_pengajuan', JSON.stringify({
      jenisSurat: detailSKL?.jenisSurat || 'Surat Keterangan Lulus',
      tanggalLulus: formattedTanggalLulus,
      ipk: detailSKL?.ipk || '',
      jumlahSks: detailSKL?.jumlahSks || ''
    }));

    // Save lampiran logic 
    const lampiranForEdit: any = {};
    if (lampiranList && lampiranList.length > 0) {
      lampiranList.forEach((lamp: any) => {
        let fieldName = '';
        switch (lamp.kategori) {
          case 'KTM': fieldName = 'ktm'; break;
          case 'TRANSKRIP_NILAI': fieldName = 'transkrip'; break;
          case 'BERITA_ACARA_UJIAN': fieldName = 'beritaAcara'; break;
          case 'BEBAS_PUSTAKA': fieldName = 'ujianSarjana'; break;
          case 'PAS_FOTO': fieldName = 'pasFoto'; break;
          case 'BUKTI_SUBMIT': fieldName = 'buktiSubmit'; break;
          case 'LAINNYA': fieldName = 'lainnya'; break;
          default: fieldName = lamp.kategori?.toLowerCase() || 'dokumen';
        }

        if (fieldName) {
          lampiranForEdit[fieldName] = {
            uid: lamp.id || Date.now().toString(),
            name: lamp.namaFile || 'Dokumen',
            size: lamp.ukuranFile || 0,
            type: lamp.tipeFile || 'application/pdf',
            dataUrl: lamp.dataUrl || lamp.filePath,
            filePath: lamp.filePath,
            hasFile: true,
            isExisting: true
          };
        }
      });
    }
    localStorage.setItem('skl_lampiran', JSON.stringify(lampiranForEdit));
    if (pengajuan.signature) localStorage.setItem('skl_signature', pengajuan.signature);

    message.loading('Membuka editor surat...', 1);
    router.push(`/mahasiswa/form/dataDiri?draftId=${pengajuanId}`);
  };

  const handleDeleteSurat = () => {
    if (!pengajuanId || !session?.id) return;

    Modal.confirm({
      title: 'Batalkan Pengajuan',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: 'Apakah Anda yakin ingin membatalkan pengajuan ini? Status akan diubah menjadi BATAL.',
      okText: 'Ya, Batalkan',
      okType: 'danger',
      cancelText: 'Tidak',
      onOk: async () => {
        try {
          await sklService.updateStatus(pengajuanId, {
            status: 'BATAL',
            actorId: session.id,
            catatan: 'Dibatalkan oleh mahasiswa'
          });
          message.success('Pengajuan berhasil dibatalkan');
          fetchPengajuanDetail(); // Refresh data
        } catch (error) {
          console.error('Error cancelling pengajuan:', error);
          message.error('Gagal membatalkan pengajuan');
        }
      },
    });
  };

  const handlePreview = (url: string, title: string = 'Preview', type: string = 'image') => {
    if (!url) {
      message.warning('File tidak tersedia');
      return;
    }
    
    console.log('Opening preview:', { url, title, type });
    
    // Clean up title - extract only filename without query params
    let cleanTitle = title;
    if (title.includes('?')) {
      // Remove query parameters from URL-based titles
      cleanTitle = title.split('?')[0];
    }
    if (cleanTitle.includes('/')) {
      // Extract just the filename
      cleanTitle = cleanTitle.split('/').pop() || cleanTitle;
    }
    // Decode URL encoding if present
    try {
      cleanTitle = decodeURIComponent(cleanTitle);
    } catch (e) {
      // Keep original if decode fails
    }
    setPreviewModal({ visible: true, url, title: cleanTitle, type });
  };

  // --- RENDER HELPERS ---
  const getStatusBadge = (status: string) => {
    let color = 'default';
    let icon = <ClockCircleFilled />;
    let text = status;

    if (['VERIFIED_ADMIN', 'APPROVED_KAPRODI', 'REGISTERED', 'SIAP_CETAK'].includes(status)) {
      color = 'processing';
      text = 'Diproses';
    } else if (status === 'COMPLETED') {
      color = 'success';
      icon = <CheckCircleFilled />;
      text = 'Selesai';
    } else if (status === 'DITOLAK') {
      color = 'error';
      icon = <CloseCircleFilled />;
      text = 'Ditolak';
    } else if (status === 'REVISI' || status === 'REVISION') {
      color = 'warning';
      icon = <EditOutlined />;
      text = 'Perlu Revisi';
    } else if (status === 'DRAFT') {
      color = 'default';
      text = 'Draft';
    } else if (status === 'SUBMITTED') {
      color = 'blue';
      text = 'Diajukan';
    } else if (status === 'BATAL') {
      color = 'default';
      icon = <CloseCircleFilled />;
      text = 'Dibatalkan';
    } else if (status === 'REGISTERING' || status === 'REGISTERED' || status === 'APPROVED_SUPERVISOR' || status === 'STEP_KONVENSIONAL') {
      color = 'processing';
      text = 'Diproses';
    }

    return (
      <Tag icon={icon} color={color} style={{ fontSize: '14px', padding: '4px 10px' }}>
        {text}
      </Tag>
    );
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Spin size="large" description="Memuat detail..." /></div>;
  if (!pengajuan) return <div style={{ padding: '24px' }}><Text>Data tidak ditemukan</Text></div>;

  const { mahasiswa, detailSKL, lampiranList, signature } = pengajuan;

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>

      {/* 1. Header Navigation */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            shape="circle"
            onClick={() => router.push('/mahasiswa/riwayat')}
          />
          <div>
            <Title level={4} style={{ margin: 0 }}>Detail Pengajuan SKL</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>ID Pengajuan: #{pengajuan.id}</Text>
          </div>
        </Space>
        {getStatusBadge(pengajuan.status)}
      </div>

      <Row gutter={[24, 24]}>

        {/* LEFT COLUMN: Main Information */}
        <Col xs={24} lg={16}>
          <Space vertical size="large" style={{ width: '100%' }}>

            {/* 2. Status Alerts (Contextual) */}
            {(pengajuan.status === 'REVISION' || pengajuan.status === 'REVISI') && (
              <Alert
                message="Pengajuan Perlu Revisi"
                description={
                  <div>
                    <Paragraph style={{ marginBottom: 8 }}>{pengajuan.catatan || "Mohon perbaiki data sesuai catatan dari admin."}</Paragraph>
                    <Button type="primary" size="small" icon={<EditOutlined />} onClick={handleEditSurat}>
                      Perbaiki Sekarang
                    </Button>
                  </div>
                }
                type="warning"
                showIcon
              />
            )}
            {pengajuan.status === 'DITOLAK' && (
              <Alert
                message="Pengajuan Ditolak"
                description={pengajuan.catatan || "Mohon cek riwayat atau hubungi admin."}
                type="error"
                showIcon
              />
            )}
            {pengajuan.status === 'COMPLETED' && (
              <Alert
                message="Surat Selesai"
                description="Surat Keterangan Lulus Anda telah terbit. Silakan cek di kolom Riwayat Surat untuk mengunduh."
                type="success"
                showIcon
              />
            )}

            {/* 3. Identitas Card */}
            <Card title="Informasi Mahasiswa" bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <Descriptions column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} bordered size="middle">
                <Descriptions.Item label={<Space><UserOutlined /> Nama</Space>}>
                  {mahasiswa?.nama || '-'}
                </Descriptions.Item>
                <Descriptions.Item label={<Space><IdcardOutlined /> NIM</Space>}>
                  {mahasiswa?.nim || '-'}
                </Descriptions.Item>
                <Descriptions.Item label={<Space><SafetyCertificateOutlined /> Prodi</Space>}>
                  {mahasiswa?.prodi || '-'}
                </Descriptions.Item>
                <Descriptions.Item label={<Space><MailOutlined /> Email</Space>}>
                  {mahasiswa?.emailKampus || '-'}
                </Descriptions.Item>
                <Descriptions.Item label={<Space><EnvironmentOutlined /> Tempat Lahir</Space>}>
                  {mahasiswa?.tempatLahir || '-'}
                </Descriptions.Item>
                <Descriptions.Item label={<Space><CalendarOutlined /> Tgl Lahir</Space>}>
                  {mahasiswa?.tanggalLahir ? new Date(mahasiswa.tanggalLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                </Descriptions.Item>
                <Descriptions.Item label={<Space><PhoneOutlined /> No HP</Space>}>
                  {mahasiswa?.noHp || '-'}
                </Descriptions.Item>
                <Descriptions.Item label={<Space><HomeOutlined /> Alamat</Space>}>
                  {mahasiswa?.alamat || '-'}
                </Descriptions.Item>
              </Descriptions>

              <Divider dashed orientation={"left" as any} style={{ borderColor: '#d9d9d9', color: '#8c8c8c', fontSize: 13 }}>Data Akademik</Divider>

              <Descriptions column={2} size="middle">
                <Descriptions.Item label="Jenis Surat">{detailSKL?.jenisSurat}</Descriptions.Item>
                <Descriptions.Item label="Tanggal Lulus">
                  {detailSKL?.tanggalLulus ? new Date(detailSKL.tanggalLulus).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="IPK Terakhir">
                  <Tag color="blue" style={{ fontSize: 14 }}>{detailSKL?.ipk || '-'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Jumlah SKS">
                  <Tag color="green" style={{ fontSize: 14 }}>{detailSKL?.jumlahSks || '-'} SKS</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* 4. Lampiran Grid */}
            <Card title="Dokumen Lampiran" bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              {lampiranList && lampiranList.length > 0 ? (
                <List
                  grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 3, xxl: 3 }}
                  dataSource={lampiranList}
                  renderItem={(item: any) => (
                    <List.Item>
                      <Card
                        hoverable
                        size="small"
                        styles={{ body: { padding: 12 } }}
                        onClick={() => handlePreview(item.dataUrl || item.filePath, getLampiranLabel(item.kategori), item.tipeFile?.includes('pdf') ? 'pdf' : 'image')}
                        style={{ borderColor: '#d9d9d9' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 40, height: 40,
                            background: item.tipeFile?.includes('pdf') ? '#fff1f0' : '#e6f7ff',
                            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            {item.tipeFile?.includes('pdf') ?
                              <FilePdfOutlined style={{ fontSize: 20, color: '#ff4d4f' }} /> :
                              <FileImageOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                            }
                          </div>
                          <div style={{ overflow: 'hidden', flex: 1 }}>
                            <Text strong ellipsis style={{ display: 'block', fontSize: 13 }}>
                              {getLampiranLabel(item.kategori)}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              Klik untuk preview
                            </Text>
                          </div>
                        </div>
                      </Card>
                    </List.Item>
                  )}
                />
              ) : (
                <Text type="secondary">Tidak ada lampiran diunggah.</Text>
              )}

              {/* Signature Preview */}
              {signature && (
                <>
                  <Divider />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Text strong>Tanda Tangan Digital</Text>
                    <div style={{
                      padding: 16, border: '1px dashed #d9d9d9', borderRadius: 8,
                      background: '#fafafa', width: 'fit-content'
                    }}>
                      <Image
                        src={signature}
                        width={150}
                        alt="Tanda tangan"
                        preview={{ mask: <><EyeOutlined /> Lihat</> }}
                      />
                    </div>
                  </div>
                </>
              )}
            </Card>

          </Space>
        </Col>

        {/* RIGHT COLUMN: Timeline & Actions */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="large" style={{ width: '100%', position: 'sticky', top: 20 }}>

            {/* 5. Riwayat (Timeline) */}
            <Card title="Riwayat Proses" bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              {pengajuanId && (
                <RiwayatSurat pengajuanId={pengajuanId} title="" />
              )}
            </Card>

            {/* 6. Edit/Action Actions (Sticky) */}
            {(pengajuan.status === 'REVISI' || pengajuan.status === 'SUBMITTED') && (
              <Card
                title={<span style={{ color: pengajuan.status === 'REVISI' ? '#d46b08' : '#096dd9' }}>Aksi Pengajuan</span>}
                bordered={false}
                style={{
                  borderRadius: 12,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  overflow: 'hidden'
                }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div style={{
                    padding: '12px',
                    background: pengajuan.status === 'REVISI' ? '#fff7e6' : '#f0faff',
                    borderRadius: 8,
                    borderLeft: `4px solid ${pengajuan.status === 'REVISI' ? '#ffa940' : '#40a9ff'}`
                  }}>
                    <Text type="secondary" style={{ fontSize: 13, display: 'block' }}>
                      {pengajuan.status === 'REVISI'
                        ? 'Mohon segera perbaiki formulir sesuai catatan revisi.'
                        : 'Anda masih diperbolehkan untuk mengubah data atau membatalkan pengajuan ini.'}
                    </Text>
                  </div>

                  <Row gutter={12}>
                    <Col span={12}>
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        block
                        size="large"
                        onClick={handleEditSurat}
                        style={{
                          background: '#faad14',
                          borderColor: '#faad14',
                          fontWeight: 600,
                          height: '45px',
                          borderRadius: '8px'
                        }}
                      >
                        Edit
                      </Button>
                    </Col>
                    <Col span={12}>
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        block
                        size="large"
                        onClick={handleDeleteSurat}
                        style={{
                          fontWeight: 600,
                          height: '45px',
                          borderRadius: '8px'
                        }}
                      >
                        Batalkan
                      </Button>
                    </Col>
                  </Row>
                </Space>
              </Card>
            )}

          </Space>
        </Col>
      </Row>

      {/* Preview Modal */}
      <Modal
        open={previewModal.visible}
        title={previewModal.title}
        footer={null}
        onCancel={() => setPreviewModal({ ...previewModal, visible: false })}
        width={900}
        centered
      >
        {previewModal.type === 'pdf' ? (
          <iframe
            src={previewModal.url}
            style={{ width: '100%', height: '75vh', border: 'none', borderRadius: 4 }}
            title="PDF Preview"
            onLoad={() => console.log('PDF loaded successfully:', previewModal.title, previewModal.url)}
          />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', background: '#f5f5f5', padding: 20, borderRadius: 4 }}>
            <img
              src={previewModal.url}
              alt={previewModal.title}
              style={{ maxHeight: '75vh', objectFit: 'contain', maxWidth: '100%' }}
              onError={(e) => {
                console.error('Failed to load image:', previewModal.url);
                message.error('Gagal memuat gambar. File mungkin sudah tidak ada atau URL expired.');
              }}
              onLoad={() => console.log('Image loaded successfully:', previewModal.title, previewModal.url)}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function DetailPage() {
  return (
    <App>
      <DetailPageContent />
    </App>
  );
}