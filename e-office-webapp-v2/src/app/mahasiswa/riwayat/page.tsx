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
import { useRouter, useSearchParams } from 'next/navigation';
import { mahasiswaService } from '@/services/mahasiswaService';
import { sklService } from '@/services/sklService';
import Image from 'next/image';

const { Title, Text } = Typography;

// Fungsi untuk print surat - SIMPLIFIED APPROACH
const printSurat = (selectedSurat: any) => {
  const element = document.getElementById('surat-only-content');
  if (!element) {
    console.error('Konten surat tidak ditemukan');
    return;
  }

  // Clone konten (dengan sticky note)
  const printContent = element.cloneNode(true) as HTMLElement;

  // Generate filename: NamaPengaju-Surat_Keterangan_Lulus
  const namaPengaju = selectedSurat?.namaSementara || selectedSurat?.mahasiswa?.user?.name || 'Unknown';
  const cleanName = namaPengaju.replace(/\s+/g, '_'); // Replace spaces with underscores
  const filename = `${cleanName}-Surat_Keterangan_Lulus`;

  // Buat window baru untuk print
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) {
    alert('Pop-up diblokir! Mohon izinkan pop-up untuk mencetak.');
    return;
  }

  // Inject HTML dengan styling yang lebih sederhana
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
      <style>
        /* ===== PAGE SETUP ===== */
        @page {
          size: A4 portrait;
          margin: 0; /* Zero margin for precise control */
        }
        
        /* ===== RESET & PRINT OPTIMIZATION ===== */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        /* ===== BODY STYLING ===== */
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          line-height: 1.5;
          color: black;
          background: white;
          width: 210mm;
          height: 297mm;
        }
        
        /* Enforce A4 container for print */
        #surat-only-content {
          width: 210mm !important;
          height: 297mm !important;
          padding: 2cm !important;
          margin: 0 !important;
          box-shadow: none !important;
          transform: none !important;
        }

        /* ===== TYPOGRAPHY ===== */
        p {
          text-align: justify;
        }
        
        /* ===== TABLE STYLING ===== */
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        table td {
          padding: 2px 0;
          vertical-align: top;
        }
        
        /* ===== IMAGE STYLING ===== */
        img {
          max-width: 120px;
          height: 80px;
          object-fit: contain;
          display: block;
          margin: 0 auto;
        }

        /* ===== SIGNATURE ALIGNMENT ===== */
        .signature-block {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          text-align: center !important;
          width: 250px !important;
        }

        .signature-wrapper {
          height: 80px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 100% !important;
          margin: 4px 0 !important;
        }
        
        /* ===== HIDE ELEMENTS ===== */
        .print\:hidden, [class*="print:hidden"] {
          display: none !important;
        }
      </style>
    </head>
    <body>
      ${element.outerHTML}
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
    'DITOLAK': { label: 'Ditolak', color: 'error', icon: <CloseCircleOutlined /> },
    'STEP_KONVENSIONAL': { label: 'Step Konvensional', color: 'magenta', icon: <SyncOutlined /> },
    'BATAL': { label: 'Dibatalkan', color: 'default', icon: <CloseCircleOutlined /> },
  };
  return statusMap[status] || { label: status, color: 'default' };
}

// --- Komponen Card Statistik Kecil ---
const StatCard = ({ title, value, icon, color, loading, onClick, isActive }: any) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      onClick={onClick}
      onMouseDown={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onClick?.()}
      style={{
        cursor: 'pointer',
        height: '100%',
        userSelect: 'none',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'transform 0.2s ease'
      }}
    >
      <Card
        bordered={false}
        bodyStyle={{ padding: 20 }}
        style={{
          borderRadius: 12,
          boxShadow: isHovered
            ? `0 8px 24px ${color}30`
            : isActive
              ? `0 4px 12px ${color}40`
              : '0 2px 10px rgba(0,0,0,0.03)',
          height: '100%',
          border: isActive ? `2px solid ${color}` : 'none',
          transition: 'all 0.3s ease',
          pointerEvents: 'none'
        }}
      >
        <Statistic
          title={<span style={{ fontSize: 13, fontWeight: 500, color: '#8c8c8c' }}>{title}</span>}
          value={value}
          valueStyle={{ fontSize: 24, fontWeight: 700, color: isActive ? color : '#262626' }}
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
          suffix={isActive && <span style={{ fontSize: 12, color: color, marginLeft: 8 }}>●</span>}
        />
      </Card>
    </div>
  );
};

function RiwayatPengajuanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { modal, message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [draftData, setDraftData] = useState<any[]>([]);
  const [ongoingData, setOngoingData] = useState<any[]>([]);

  const [selectedKlasifikasi, setSelectedKlasifikasi] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all'); // New: Status filter
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState<any>(null);
  const [zoom, setZoom] = useState(100);

  // State untuk Statistik
  const [stats, setStats] = useState({ draft: 0, process: 0, completed: 0, revisi: 0, ditolak: 0 });

  // Read filter from URL query params
  useEffect(() => {
    if (!searchParams) return;
    const filterParam = searchParams.get('filter');
    if (filterParam && ['all', 'process', 'completed', 'revisi', 'ditolak'].includes(filterParam)) {
      setStatusFilter(filterParam);
    }
  }, [searchParams]);

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
      const processCount = submitted.filter((item: any) => !['COMPLETED', 'DITOLAK', 'BATAL'].includes(item.statusRaw)).length;
      const draftCount = drafts.length;
      const revisiCount = submitted.filter((item: any) => item.statusRaw === 'REVISI').length;
      const ditolakCount = submitted.filter((item: any) => item.statusRaw === 'DITOLAK').length;

      setStats({ draft: draftCount, process: processCount, completed: completedCount, revisi: revisiCount, ditolak: ditolakCount });
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
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 0 200px' }}>
          <StatCard
            title="Total Pengajuan"
            value={stats.process + stats.completed + stats.revisi + stats.ditolak}
            color="#722ed1"
            icon={<FileTextOutlined />}
            loading={loading}
            onClick={() => setStatusFilter('all')}
            isActive={statusFilter === 'all'}
          />
        </div>
        <div style={{ flex: '1 0 200px' }}>
          <StatCard
            title="Sedang Diproses"
            value={stats.process}
            color="#1890ff"
            icon={<SyncOutlined spin={loading} />}
            loading={loading}
            onClick={() => setStatusFilter('process')}
            isActive={statusFilter === 'process'}
          />
        </div>
        <div style={{ flex: '1 0 200px' }}>
          <StatCard
            title="Selesai / Diterima"
            value={stats.completed}
            color="#52c41a"
            icon={<CheckCircleOutlined />}
            loading={loading}
            onClick={() => setStatusFilter('completed')}
            isActive={statusFilter === 'completed'}
          />
        </div>
        <div style={{ flex: '1 0 200px' }}>
          <StatCard
            title="Perlu Revisi"
            value={stats.revisi}
            color="#faad14"
            icon={<ExclamationCircleOutlined />}
            loading={loading}
            onClick={() => setStatusFilter('revisi')}
            isActive={statusFilter === 'revisi'}
          />
        </div>
        <div style={{ flex: '1 0 200px' }}>
          <StatCard
            title="Ditolak"
            value={stats.ditolak}
            color="#ff4d4f"
            icon={<CloseCircleOutlined />}
            loading={loading}
            onClick={() => setStatusFilter('ditolak')}
            isActive={statusFilter === 'ditolak'}
          />
        </div>
      </div>

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
                    dataSource={ongoingData.filter((item: any) => {
                      if (statusFilter === 'all') return true;
                      if (statusFilter === 'process') return !['COMPLETED', 'DITOLAK', 'BATAL', 'REVISI'].includes(item.statusRaw);
                      if (statusFilter === 'completed') return item.statusRaw === 'COMPLETED';
                      if (statusFilter === 'revisi') return item.statusRaw === 'REVISI';
                      if (statusFilter === 'ditolak') return item.statusRaw === 'DITOLAK';
                      return true;
                    })}
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
                printSurat(selectedSurat);
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
            {selectedSurat.status === 'COMPLETED' ? (
              <div>
                <div className="no-print" style={{ textAlign: 'center', padding: '20px', marginBottom: '20px', backgroundColor: '#d1fae5', borderRadius: '8px' }}>
                  <div style={{ color: '#10b981', fontWeight: 600, fontSize: '16px', marginBottom: '8px' }}>
                    ✓ Surat sudah difinalisasi oleh UPA {selectedSurat.nomorSkl ? `dengan nomor: SKL/${selectedSurat.nomorSkl}` : ''}
                  </div>
                  <div style={{ color: '#059669', fontSize: '14px' }}>
                    Silakan cetak surat Anda. Jangan lupa membawa pas foto 4x6 dan meminta cap basah di Akademik.
                  </div>
                </div>
                {/* Show the letter template */}
                <div
                  id="preview-surat-content"
                  className="bg-gray-100 p-4 sm:p-8 flex justify-center"
                  style={{ maxHeight: '70vh', overflow: 'auto' }}
                >
                  <div
                    id="surat-only-content"
                    style={{
                      width: '210mm',
                      minHeight: '297mm',
                      backgroundColor: 'white',
                      boxShadow: '0 0 20px rgba(0,0,0,0.1)',
                      padding: '2cm',
                      position: 'relative',
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: 'top center',
                      margin: '0 auto',
                      color: 'black',
                      fontFamily: "'Times New Roman', Times, serif"
                    }}
                  >

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
                          Dekan<br />
                          Fakultas Sains dan Matematika Universitas Diponegoro<br />
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

                      <div style={{ position: 'relative', marginTop: '100px' }}>
                        {/* Soft Green Sticky Note - Screen Only */}
                        {selectedSurat.nomorSkl && (
                          <div className="print:hidden" style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%) rotate(1deg)',
                            zIndex: 40,
                            pointerEvents: 'none',
                            width: '240px'
                          }}>
                            <div style={{
                              backgroundColor: '#f0fdf4',
                              border: '1px solid #bbf7d0',
                              borderRadius: '8px',
                              boxShadow: '0 8px 16px rgba(0,0,0,0.06)',
                              padding: '16px',
                              textAlign: 'center',
                              fontFamily: 'sans-serif'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#166534', fontWeight: '700', fontSize: '14px', marginBottom: '10px' }}>
                                <span style={{ fontSize: '18px' }}>📝</span>
                                <span style={{ textDecoration: 'underline', textDecorationColor: '#86efac', textUnderlineOffset: '4px' }}>Surat Sudah Selesai</span>
                              </div>

                              <p style={{ fontSize: '11px', color: '#374151', marginBottom: '8px', lineHeight: '1.5' }}>
                                Surat Keterangan Lulus<br />sudah selesai dengan nomor:
                              </p>

                              <div style={{ backgroundColor: '#fff', padding: '8px', borderRadius: '4px', border: '1.5px solid #dcfce7', marginBottom: '10px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                                <span style={{ fontSize: '14px', fontWeight: '800', color: '#064e3b', letterSpacing: '0.5px' }}>
                                  {selectedSurat.nomorSkl}
                                </span>
                              </div>

                              <p style={{ fontSize: '10.5px', color: '#4b5563', marginBottom: '8px', lineHeight: '1.4' }}>
                                Harap membawa pas foto <b style={{ color: '#1f2937' }}>4x2 (2 lembar)</b> dan meminta cap basah di Akademik.
                              </p>

                              <p style={{ fontSize: '12px', fontWeight: '600', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                Terima kasih <span style={{ fontSize: '14px' }}>🙏</span>
                              </p>
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div className="signature-block" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '250px' }}>
                            <p style={{ marginBottom: '4px' }}>Ketua Program Studi</p>
                            <div className="signature-wrapper" style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                              {selectedSurat.ttdKetuaProdi && (
                                <Image src={selectedSurat.ttdKetuaProdi} alt="TTD Kaprodi" width={120} height={80} style={{ objectFit: 'contain' }} />
                              )}
                            </div>
                            <div style={{ marginTop: '4px' }}>
                              <p style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '2px' }}>
                                {selectedSurat.mahasiswa?.programStudi?.ketuaProdi?.user?.name}
                              </p>
                              <p style={{ fontSize: '12px' }}>NIP. {selectedSurat.mahasiswa?.programStudi?.ketuaProdi?.nip || '-'}</p>
                            </div>
                          </div>

                          <div className="signature-block" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '250px' }}>
                            <p style={{ marginBottom: '4px' }}>
                              Semarang, {new Date(selectedSurat.createdAt || new Date()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                            <p style={{ marginBottom: '4px' }}>Pemohon,</p>
                            <div className="signature-wrapper" style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                              {selectedSurat.tandatangan && (
                                <Image src={selectedSurat.tandatangan} alt="TTD Mahasiswa" width={120} height={80} style={{ objectFit: 'contain' }} />
                              )}
                            </div>
                            <div style={{ marginTop: '4px' }}>
                              <p style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '2px' }}>
                                {selectedSurat.namaSementara || selectedSurat.mahasiswa?.user?.name}
                              </p>
                              <p style={{ fontSize: '12px' }}>NIM {selectedSurat.mahasiswa?.nim || '-'}</p>
                            </div>
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