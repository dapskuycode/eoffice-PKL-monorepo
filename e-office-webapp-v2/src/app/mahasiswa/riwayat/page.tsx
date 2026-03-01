'use client';

import React, { useEffect, useState } from 'react';
import { Table, Tag, Card, Typography, Button, Select, Space, message, Modal, App, Tabs, Statistic, Row, Col, Empty, Badge } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  ExclamationCircleOutlined,
  FileTextOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined, // Icon untuk Ditolak
  PrinterOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { mahasiswaService } from '@/services/mahasiswaService';
import { sklService } from '@/services/sklService';
import Image from 'next/image';

const { Title, Text } = Typography;

// Fungsi untuk print surat
const printSurat = () => {
  const element = document.getElementById('surat-only-content');
  if (!element) {
    console.error('Konten surat tidak ditemukan');
    return;
  }

  // Clone konten (dengan sticky note)
  const printContent = element.cloneNode(true) as HTMLElement;

  // Buat window baru untuk print
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) {
    alert('Pop-up diblokir! Mohon izinkan pop-up untuk mencetak.');
    return;
  }

  // Inject HTML dengan styling
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Cetak Surat Keterangan Lulus</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 2.5cm 6cm 2.5cm 2.5cm;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          line-height: 1.5;
          color: black;
          background: white;
          position: relative;
        }
        
        p {
          text-align: justify;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        table td {
          padding: 2px 0;
          vertical-align: top;
        }
        
        img {
          max-width: 100px;
          height: auto;
          display: block;
        }
        
        /* Sticky note - di margin kanan yang lebar */
        div[style*="position: absolute"][style*="right: -100px"],
        .sticky-note-exclude {
          position: absolute !important;
          right: -90px !important;
          top: 80px !important;
          width: 240px !important;
          background-color: #dcfce7 !important;
          border: 2px solid #bbf7d0 !important;
          border-radius: 8px !important;
          padding: 14px !important;
          box-shadow: 4px 4px 10px rgba(0,0,0,0.2) !important;
          transform: rotate(3deg) !important;
          font-family: 'Comic Sans MS', cursive !important;
          font-size: 13px !important;
          line-height: 1.4 !important;
          z-index: 999 !important;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      ${printContent.innerHTML}
    </body>
    </html>
  `);

  printWindow.document.close();
  
  // Tunggu loading selesai lalu print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };
};

// --- Helper Functions ---
function getStatusDisplay(status: string) {
  const statusMap: Record<string, { label: string; color: string; icon?: React.ReactNode }> = {
    'DRAFT': { label: 'Draft', color: 'default', icon: <FileTextOutlined /> },
    'SUBMITTED': { label: 'Diajukan', color: 'blue', icon: <ClockCircleOutlined /> },
    'VERIFIED_ADMIN': { label: 'Verifikasi Admin', color: 'cyan', icon: <SyncOutlined spin /> },
    'APPROVED_KAPRODI': { label: 'Disetujui Kaprodi', color: 'cyan', icon: <CheckCircleOutlined /> },
    'REGISTERING': { label: 'Registrasi', color: 'geekblue', icon: <SyncOutlined spin /> },
    'REGISTERED': { label: 'Terdaftar', color: 'purple', icon: <CheckCircleOutlined /> },
    'APPROVED_SUPERVISOR': { label: 'Acc Supervisor', color: 'purple', icon: <CheckCircleOutlined /> },
    'SIAP_CETAK': { label: 'Siap Cetak', color: 'magenta', icon: <FileTextOutlined /> },
    'COMPLETED': { label: 'Selesai', color: 'success', icon: <CheckCircleOutlined /> },
    'REVISI': { label: 'Perlu Revisi', color: 'warning', icon: <ExclamationCircleOutlined /> },
    // Fix: Status Ditolak pakai icon silang, bukan loading
    'DITOLAK': { label: 'Ditolak', color: 'error', icon: <CloseCircleOutlined /> }, 
  };
  return statusMap[status] || { label: status, color: 'default' };
}

// --- Komponen Card Statistik Kecil ---
const StatCard = ({ title, value, icon, color, loading }: any) => (
  <Card bordered={false} bodyStyle={{ padding: 20 }} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)', height: '100%' }}>
    <Statistic 
      title={<span style={{ fontSize: 13, fontWeight: 500, color: '#8c8c8c' }}>{title}</span>}
      value={value}
      valueStyle={{ fontSize: 24, fontWeight: 700, color: '#262626' }}
      loading={loading}
      prefix={
        <div style={{ 
          width: 40, height: 40, borderRadius: 10, 
          background: `${color}15`, color: color,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginRight: 8
        }}>
          {icon}
        </div>
      }
    />
  </Card>
);

function RiwayatPengajuanContent() {
  const router = useRouter();
  const { modal, message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [draftData, setDraftData] = useState<any[]>([]);
  const [ongoingData, setOngoingData] = useState<any[]>([]);

  const [selectedKlasifikasi, setSelectedKlasifikasi] = useState<string>('all');
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState<any>(null);
  const [zoom, setZoom] = useState(100);
  
  // State untuk Statistik
  const [stats, setStats] = useState({ draft: 0, process: 0, completed: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const dashboardData = await mahasiswaService.getDashboard();
      
      if (!dashboardData) {
        message.error("Sesi login tidak ditemukan.");
        router.push('/auth/login');
        return;
      }

      const allPengajuan = dashboardData.allPengajuan || [];
      
      // Filter Drafts
      const drafts = allPengajuan
        .filter((p: any) => p.status === 'DRAFT')
        .map((p: any) => ({
          key: p.id,
          id: p.nomorSkl || `#${p.id}`,
          perihal: 'Surat Keterangan Lulus',
          lastEdit: new Date(p.updatedAt || p.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          idSurat: p.id,
          status: p.status
        }));
      
      // Filter Ongoing & Completed
      const submitted = allPengajuan
        .filter((p: any) => p.status !== 'DRAFT')
        .map((p: any) => {
          const statusDisplay = getStatusDisplay(p.status);
          return {
            key: p.id,
            id: p.nomorSkl || `#${p.id}`,
            perihal: 'Surat Keterangan Lulus',
            waktuPengiriman: new Date(p.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
            tanggalDiterima: p.status === 'COMPLETED' 
              ? new Date(p.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
              : '-',
            statusRaw: p.status,
            statusLabel: statusDisplay.label,
            statusColor: statusDisplay.color,
            statusIcon: statusDisplay.icon,
            idSurat: p.id
          };
        });

      // Calculate Stats
      const completedCount = submitted.filter((item: any) => item.statusRaw === 'COMPLETED').length;
      const processCount = submitted.length - completedCount;
      const draftCount = drafts.length;

      setStats({ draft: draftCount, process: processCount, completed: completedCount });
      setDraftData(drafts);
      setOngoingData(submitted);
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Gagal memuat data riwayat surat');
    } finally {
      setLoading(false);
    }
  };
    
  const handlePreviewSurat = async (record: any) => {
    try {
      const pengajuanData = await sklService.getPengajuanDetail(record.idSurat);
      if (!pengajuanData) {
        message.error('Data surat tidak ditemukan');
        return;
      }
      setSelectedSurat(pengajuanData);
      setPreviewModalVisible(true);
    } catch (error) {
      console.error('Error fetching surat detail:', error);
      message.error('Gagal memuat detail surat');
    }
  };

  const handleClosePreview = () => {
    setPreviewModalVisible(false);
    setSelectedSurat(null);
    setZoom(100);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));

  const handleDeleteDraft = async (record: any) => {
    modal.confirm({
      title: 'Hapus Draft',
      icon: <ExclamationCircleOutlined />,
      content: `Yakin ingin menghapus draft ini? Data tidak bisa dikembalikan.`,
      okText: 'Hapus',
      okType: 'danger',
      cancelText: 'Batal',
      centered: true,
      async onOk() {
        try {
          await sklService.deleteDraft(record.idSurat);
          if (localStorage.getItem('skl_draft_id') === String(record.idSurat)) {
             localStorage.removeItem('skl_draft_id');
             localStorage.removeItem('skl_data_diri');
             localStorage.removeItem('skl_detail_pengajuan');
             localStorage.removeItem('skl_lampiran');
          }
          message.success('Draft berhasil dihapus');
          loadData();
        } catch (error) {
          message.error('Gagal menghapus draft.');
        }
      },
    });
  };

  // --- Columns Definitions ---

  const draftColumns = [
    {
      title: 'ID SURAT',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'PERIHAL',
      dataIndex: 'perihal',
      key: 'perihal',
      render: (text: string, record: any) => (
        <Space direction="vertical" size="small">
          <Text>{text}</Text>
          {record.status === 'REVISI' && (
            <Tag color="orange">PERLU REVISI</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'LAST EDIT',
      dataIndex: 'lastEdit',
      key: 'lastEdit',
    },
    {
      title: 'AKSI',
      key: 'aksi',
      render: (_: any, record: any) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => {
              localStorage.setItem('skl_draft_id', record.idSurat);
              router.push(`/mahasiswa/form/dataDiri?draftId=${record.idSurat}`);
            }}
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDeleteDraft(record)}
          />
        </Space>
      ),
    },
  ];

  const ongoingColumns = [
    {
      title: 'ID SURAT',
      dataIndex: 'id',
      key: 'id',
      width: 120,
    },
    {
      title: 'PERIHAL',
      dataIndex: 'perihal',
      key: 'perihal',
    },
    {
      title: 'WAKTU PENGIRIMAN',
      dataIndex: 'waktuPengiriman',
      key: 'waktuPengiriman',
      width: 180,
    },
    {
      title: 'TANGGAL DITERIMA',
      dataIndex: 'tanggalDiterima',
      key: 'tanggalDiterima',
      width: 180,
    },
    {
      title: 'STATUS SURAT',
      dataIndex: 'statusLabel',
      key: 'status',
      width: 180,
      render: (_: any, record: any) => (
        // Menggunakan Icon dari logic getStatusDisplay agar status DITOLAK tidak muter
        <Tag icon={record.statusIcon} color={record.statusColor}>
          {record.statusLabel.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'PREVIEW SURAT',
      key: 'preview',
      width: 150,
      render: (_: any, record: any) => (
        <Button 
          type="primary"
          // Pastikan logic disable sesuai kebutuhan (disini enable jika COMPLETED)
          disabled={record.statusRaw !== 'COMPLETED'}
          onClick={() => handlePreviewSurat(record)}
        >
          Lihat Surat
        </Button>
      ),
    },
    {
      title: 'AKSI',
      key: 'aksi',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Button 
          type="text" 
          icon={<EyeOutlined />}
          onClick={() => router.push(`/mahasiswa/detail?id=${record.idSurat}`)}
        />
      ),
    },
  ];

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* 1. Header Section */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 0, color: '#001529' }}>Riwayat Pengajuan</Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Pantau status surat dan kelola draft pengajuan Anda di sini.
        </Text>
      </div>

      {/* 2. Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
           <StatCard 
             title="Sedang Diproses" 
             value={stats.process} 
             color="#1890ff"
             icon={<SyncOutlined spin={loading} />}
             loading={loading}
           />
        </Col>
        <Col xs={24} sm={8}>
           <StatCard 
             title="Selesai / Diterima" 
             value={stats.completed} 
             color="#52c41a"
             icon={<CheckCircleOutlined />}
             loading={loading}
           />
        </Col>
        <Col xs={24} sm={8}>
           <StatCard 
             title="Draf Tersimpan" 
             value={stats.draft} 
             color="#faad14"
             icon={<FileTextOutlined />}
             loading={loading}
           />
        </Col>
      </Row>

      {/* 3. Main Content Tabs */}
      <Card 
        bordered={false} 
        style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}
        bodyStyle={{ padding: '0 24px 24px' }}
      >
        <Tabs 
          defaultActiveKey="ongoing"
          size="large"
          tabBarStyle={{ marginBottom: 24, paddingTop: 12 }}
          items={[
            {
              key: 'ongoing',
              label: (
                <span>
                  <SyncOutlined />
                  Riwayat Pengajuan
                  <Badge count={ongoingData.length} style={{ marginLeft: 8, backgroundColor: '#e6f7ff', color: '#1890ff' }} />
                </span>
              ),
              children: (
                <>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                     <Select
                        placeholder="Filter Layanan"
                        defaultValue="all"
                        style={{ width: 200 }}
                        onChange={setSelectedKlasifikasi}
                        options={[
                          { value: 'all', label: 'Semua Layanan' },
                          { value: 'ak008', label: 'Surat Ket. Lulus' },
                        ]}
                      />
                  </div>
                  <Table 
                    columns={ongoingColumns} 
                    dataSource={ongoingData} 
                    rowKey="idSurat"
                    loading={loading}
                    pagination={{ pageSize: 5 }}
                    locale={{ emptyText: <Empty description="Belum ada riwayat pengajuan" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                  />
                </>
              )
            },
            {
              key: 'draft',
              label: (
                 <span>
                  <EditOutlined />
                  Draf Tersimpan
                  <Badge count={draftData.length} showZero={false} style={{ marginLeft: 8 }} />
                 </span>
              ),
              children: (
                <Table 
                  columns={draftColumns} 
                  dataSource={draftData} 
                  rowKey="idSurat"
                  loading={loading}
                  pagination={false}
                  locale={{ emptyText: <Empty description="Tidak ada draf tersimpan" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                />
              )
            }
          ]}
        />
      </Card>

      {/* 4. Preview Modal - Reverted to Original Style */}
      <Modal
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Preview Surat Keterangan Lulus</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Button size="small" onClick={handleZoomOut}>−</Button>
              <span style={{ minWidth: '60px', textAlign: 'center', fontSize: '14px' }}>{zoom}%</span>
              <Button size="small" onClick={handleZoomIn}>+</Button>
            </div>
          </div>
        }
        open={previewModalVisible}
        onCancel={handleClosePreview}
        width="90%"
        style={{ top: 20 }}
        footer={[
          selectedSurat?.status === 'COMPLETED' ? (
            <Button 
              key="print" 
              type="primary"
              icon={<PrinterOutlined />}
              onClick={() => {
                printSurat();
                message.success('Jendela print dibuka!');
              }}
            >
              Cetak / Print
            </Button>
          ) : null,
          <Button key="close" onClick={handleClosePreview}>
            Tutup
          </Button>
        ]}
      >
        {selectedSurat && (
          <div style={{ maxHeight: '75vh', overflow: 'auto' }}>
            {selectedSurat.status === 'COMPLETED' && selectedSurat.nomorSkl ? (
              <div>
                <div className="no-print" style={{ textAlign: 'center', padding: '20px', marginBottom: '20px', backgroundColor: '#d1fae5', borderRadius: '8px' }}>
                  <div style={{ color: '#10b981', fontWeight: 600, fontSize: '16px', marginBottom: '8px' }}>
                    ✓ Surat sudah difinalisasi oleh UPA dengan nomor: SKL/{selectedSurat.nomorSkl}
                  </div>
                  <div style={{ color: '#059669', fontSize: '14px' }}>
                    Silakan cetak surat Anda. Jangan lupa membawa pas foto 4x2 dan meminta cap basah di Akademik.
                  </div>
                </div>
                {/* Show the letter template */}
                <div 
                  id="preview-surat-content"
                  style={{ 
                    transform: `scale(${zoom / 100})`, 
                    transformOrigin: 'top left',
                    width: `${10000 / zoom}%`,
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '32px',
                    position: 'relative'
                  }}
                >
                  <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }} id="surat-only-content">
                    {/* Sticky Note Pink */}
                    {selectedSurat.nomorSkl && (
                      <div 
                        className="sticky-note-exclude"
                        style={{
                          position: 'absolute',
                          right: '-100px',
                          top: '80px',
                          width: '250px',
                          backgroundColor: '#dcfce7',
                          border: '2px solid #bbf7d0',
                          borderRadius: '8px',
                          padding: '16px',
                          boxShadow: '4px 4px 10px rgba(0,0,0,0.2)',
                          transform: 'rotate(3deg)',
                          fontFamily: 'Comic Sans MS, cursive'
                        }}
                      >
                        <div style={{ fontSize: '14px', lineHeight: '1.5', color: '#374151' }}>
                          <p style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: '12px', color: '#166534' }}>
                            📋 Surat Sudah Selesai
                          </p>
                          <p style={{ marginBottom: '8px' }}>
                            Surat Keterangan Lulus sudah selesai dengan nomor:
                          </p>
                          <p style={{ fontWeight: 'bold', textAlign: 'center', margin: '12px 0', color: '#14532d', backgroundColor: 'rgba(255,255,255,0.5)', padding: '8px', borderRadius: '4px' }}>
                            {selectedSurat.nomorSkl}
                          </p>
                          <p style={{ marginBottom: '8px' }}>
                            Harap membawa pas foto 4x2 dan meminta cap basah di Akademik.
                          </p>
                          <p style={{ textAlign: 'center', fontWeight: '600', marginTop: '12px' }}>
                            Terima kasih 🙏
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Header AK.008 */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                      <div style={{ border: '1px solid #000', padding: '4px 16px' }}>
                        <span style={{ fontWeight: 'bold' }}>AK.008</span>
                      </div>
                    </div>

                    {/* Nomor Surat */}
                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ fontWeight: 'bold' }}>
                        No : {selectedSurat.nomorSuratPengantar}
                      </span>
                    </div>

                    {/* Perihal */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
                      <span style={{ fontWeight: 'bold' }}>Perihal</span>
                      <span>:</span>
                      <span style={{ fontWeight: 'bold' }}>Surat Keterangan Lulus</span>
                    </div>

                    {/* Content */}
                    <div style={{ fontSize: '14px', lineHeight: '1.8', textAlign: 'justify' }}>
                      <div style={{ display: 'flex', gap: '32px', marginBottom: '16px' }}>
                        <span style={{ width: '80px', flexShrink: 0 }}>Yth.</span>
                        <span>
                          Dekan<br/>
                          Fakultas Sains dan Matematika Universitas Diponegoro<br/>
                          Semarang.
                        </span>
                      </div>

                      <p style={{ marginBottom: '16px' }}>
                        Dengan ini kami mengajukan permohonan pembuatan Surat Keterangan Lulus atas nama :
                      </p>

                      <div style={{ marginLeft: '32px', marginBottom: '16px' }}>
                        <table style={{ width: '100%' }}>
                           <tbody>
                             <tr><td style={{ width: 160 }}>Nama</td><td>: {selectedSurat.namaSementara || selectedSurat.mahasiswa?.user?.name || 'N/A'}</td></tr>
                             <tr><td>NIM</td><td>: {selectedSurat.mahasiswa?.nim || 'N/A'}</td></tr>
                             <tr>
                               <td>Tempat/Tanggal Lahir</td>
                               <td>: {selectedSurat.tempatLahirSementara || selectedSurat.mahasiswa?.tempatLahir || 'N/A'}, {selectedSurat.tanggalLahirSementara ? new Date(selectedSurat.tanggalLahirSementara).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : (selectedSurat.mahasiswa?.tanggalLahir ? new Date(selectedSurat.mahasiswa.tanggalLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A')}</td>
                             </tr>
                             <tr><td>Alamat</td><td>: {selectedSurat.alamatSementara || selectedSurat.mahasiswa?.alamat || 'N/A'}</td></tr>
                             <tr><td>No Telepon/HP</td><td>: {selectedSurat.noHpSementara || selectedSurat.mahasiswa?.noHp || 'N/A'}</td></tr>
                             <tr><td>Program Studi</td><td>: {selectedSurat.mahasiswa?.programStudi?.name || 'N/A'}</td></tr>
                           </tbody>
                        </table>
                      </div>

                      <p style={{ marginBottom: '16px' }}>
                        Telah dinyatakan lulus ujian Sarjana pada Departemen/Program Studi {selectedSurat.mahasiswa?.programStudi?.name || 'N/A'} Fakultas Sains dan Matematika Universitas Diponegoro pada tanggal {new Date(selectedSurat.tglLulus).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} dengan Indeks Prestasi Kumulatif (IPK) {selectedSurat.ipkTerakhir}/4.00 dengan Jumlah Satuan Kredit Semester (SKS) 144
                      </p>

                      <p style={{ marginBottom: '48px' }}>
                        Demikian surat permohonan kami, atas perhatiannya kami sampaikan terimakasih.
                      </p>

                      {/* Signatures */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '48px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ marginBottom: '16px' }}>Ketua Program Studi</p>
                          {selectedSurat.ttdKetuaProdi && (
                            <div style={{ display: 'inline-block', marginBottom: '8px' }}>
                              <Image 
                                src={selectedSurat.ttdKetuaProdi}
                                alt="Tanda Tangan Kaprodi"
                                width={100}
                                height={60}
                                style={{ objectFit: 'contain' }}
                              />
                            </div>
                          )}
                          <div style={{ marginTop: '8px' }}>
                            <p style={{ fontWeight: '600' }}>
                              {selectedSurat.mahasiswa?.programStudi?.ketuaProdi?.user?.name || '(Nama Ketua Prodi)'}
                            </p>
                            <p>NIP. {selectedSurat.mahasiswa?.programStudi?.ketuaProdi?.nip || '(NIP Ketua Prodi)'}</p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ marginBottom: '8px' }}>
                            Semarang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          <p style={{ marginBottom: '16px' }}>Pemohon,</p>
                          {selectedSurat.tandatangan && (
                            <div style={{ display: 'inline-block', marginBottom: '8px' }}>
                              <Image 
                                src={selectedSurat.tandatangan}
                                alt="Tanda Tangan Mahasiswa"
                                width={100}
                                height={60}
                                style={{ objectFit: 'contain' }}
                              />
                            </div>
                          )}
                          <div style={{ marginTop: '8px' }}>
                            <p style={{ borderBottom: '1px solid #000', display: 'inline-block', fontWeight: '600' }}>
                              {selectedSurat.namaSementara || selectedSurat.mahasiswa?.user?.name || 'N/A'}
                            </p>
                            <p>NIM {selectedSurat.mahasiswa?.nim || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div> 
            ) : (
              /* Tampilan jika surat belum selesai (ELSE) */
              <div 
                style={{ 
                  transform: `scale(${zoom / 100})`, 
                  transformOrigin: 'top left',
                  width: `${10000 / zoom}%`,
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '32px',
                  position: 'relative'
                }}
              >
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                  <div style={{ textAlign: 'center', color: '#6b7280' }}>
                    <p>Surat masih dalam proses. Preview lengkap akan tersedia setelah surat selesai diproses.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function RiwayatPengajuan() {
  return (
    <App>
      <RiwayatPengajuanContent />
    </App>
  );
}