'use client';

import React from 'react';
import { Card, Typography, Row, Col, Button, Tag, Divider, Statistic } from 'antd';
import {
  FileTextOutlined,
  HistoryOutlined,
  RightOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  BookOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { mahasiswaService } from '@/services/mahasiswaService';
import { Skeleton } from 'antd';

const { Title, Text, Paragraph } = Typography;

export default function MahasiswaPortalPage() {
  const router = useRouter();
  const [stats, setStats] = React.useState({ diproses: 0, selesai: 0 });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await mahasiswaService.getDashboard();
        if (data && data.statistics) {
          setStats({
            diproses: data.statistics.menunggu + data.statistics.revisi,
            selesai: data.statistics.selesai
          });
        }
      } catch (error) {
        console.error('Error fetching portal stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Handler untuk mulai pengajuan baru
  const handleBuatSuratSKL = () => {
    // Reset data draft
    localStorage.removeItem('skl_draft_id');
    localStorage.removeItem('skl_data_diri');
    localStorage.removeItem('skl_detail_pengajuan');
    localStorage.removeItem('skl_lampiran');
    router.push('/mahasiswa/form/dataDiri');
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>

      {/* 1. SECTION JUDUL HALAMAN */}
      {/* Kita buat clean supaya nyambung sama header kamu */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ marginBottom: 0, color: '#003a8c' }}>
            Portal Layanan Akademik
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Fakultas Sains dan Matematika - Universitas Diponegoro
          </Text>
        </div>
        <Button
          icon={<HistoryOutlined />}
          size="large"
          onClick={() => router.push('/mahasiswa/riwayat')}
        >
          Cek Riwayat Saya
        </Button>
      </div>

      {/* 2. INFO BOX & STATISTIK (Sesuai Screenshot) */}
      <Card
        variant="borderless"
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          marginBottom: 32
        }}
        styles={{ body: { padding: '24px' } }}
      >
        <Row gutter={[32, 24]} align="middle">
          {/* Bagian Kiri: Teks Bantuan */}
          <Col xs={24} md={16}>
            <div style={{ display: 'flex', gap: 16 }}>
              <InfoCircleOutlined style={{ fontSize: 24, color: '#1890ff', marginTop: 4 }} />
              <div>
                <Title level={5} style={{ marginTop: 0, marginBottom: 8 }}>Pusat Bantuan</Title>
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  Pastikan data diri Anda di SIAP sudah terupdate sebelum melakukan pengajuan surat.
                  Jika mengalami kendala teknis, silakan hubungi Helpdesk Akademik.
                </Paragraph>
              </div>
            </div>
          </Col>

          {/* Divider Vertical (Hanya muncul di layar besar) */}
          <Col xs={0} md={1} style={{ display: 'flex', justifyContent: 'center' }}>
            <Divider orientation="vertical" style={{ height: '60px', borderColor: '#f0f0f0' }} />
          </Col>

          {/* Bagian Kanan: Statistik */}
          <Col xs={24} md={7}>
            <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              {loading ? (
                <Skeleton.Button active size="small" style={{ width: 60, height: 40 }} />
              ) : (
                <Statistic
                  title={<span style={{ fontSize: 13, color: '#8c8c8c' }}>Surat Diproses</span>}
                  value={stats.diproses}
                  prefix={<ClockCircleOutlined style={{ fontSize: 18 }} />}
                  styles={{ content: { fontSize: 20, fontWeight: 600 } }}
                />
              )}
              {loading ? (
                <Skeleton.Button active size="small" style={{ width: 60, height: 40, marginLeft: 20 }} />
              ) : (
                <Statistic
                  title={<span style={{ fontSize: 13, color: '#8c8c8c' }}>Surat Selesai</span>}
                  value={stats.selesai}
                  prefix={<CheckCircleOutlined style={{ fontSize: 18 }} />}
                  styles={{ content: { fontSize: 20, color: '#52c41a', fontWeight: 600 } }}
                />
              )}
            </div>
          </Col>
        </Row>
      </Card>

      {/* 3. LAYANAN SURAT (GRID) */}
      <Title level={4} style={{ marginBottom: 20, color: '#262626' }}>Layanan Persuratan</Title>

      <Row gutter={[24, 24]}>

        {/* CARD 1: SKL (AKTIF) */}
        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            style={{
              height: '100%',
              borderRadius: 12,
              border: '1px solid #d9d9d9',
              display: 'flex', flexDirection: 'column'
            }}
            styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 10,
                background: '#e6f7ff', color: '#1890ff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
              }}>
                <FileTextOutlined />
              </div>
            </div>

            <Title level={5} style={{ marginBottom: 8 }}>Surat Keterangan Lulus (SKL)</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 24, flex: 1 }}>
              Pengajuan surat keterangan tanda kelulusan sementara sebelum ijazah diterbitkan.
              <br /><span style={{ fontSize: 12, color: '#bfbfbf' }}>(Kode: AK-008)</span>
            </Text>

            <Button type="primary" block onClick={handleBuatSuratSKL} icon={<RightOutlined />}>
              Ajukan Sekarang
            </Button>
          </Card>
        </Col>

        {/* CARD 2: SURAT AKTIF (COMING SOON) */}
        <Col xs={24} sm={12} lg={8}>
          <Card
            style={{
              height: '100%', borderRadius: 12,
              background: '#fafafa', border: '1px dashed #d9d9d9',
              opacity: 0.8
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 10,
                background: '#f5f5f5', color: '#8c8c8c',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
              }}>
                <FileTextOutlined />
              </div>
              <Tag style={{ height: 22, borderRadius: 4 }}>Segera</Tag>
            </div>

            <Title level={5} style={{ marginBottom: 8, color: '#595959' }}>Surat Keterangan Aktif</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
              Dokumen yang menyatakan status aktif sebagai mahasiswa untuk beasiswa.
              <br /><span style={{ fontSize: 12, color: '#bfbfbf' }}>(Kode: AK-006)</span>
            </Text>

            <Button block disabled>Segera Hadir</Button>
          </Card>
        </Col>

        {/* CARD 3: TRANSKRIP (COMING SOON) */}
        <Col xs={24} sm={12} lg={8}>
          <Card
            style={{
              height: '100%', borderRadius: 12,
              background: '#fafafa', border: '1px dashed #d9d9d9',
              opacity: 0.8
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 10,
                background: '#f5f5f5', color: '#8c8c8c',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
              }}>
                <BookOutlined />
              </div>
              <Tag style={{ height: 22, borderRadius: 4 }}>Segera</Tag>
            </div>

            <Title level={5} style={{ marginBottom: 8, color: '#595959' }}>Transkrip Nilai Sementara</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
              Pengajuan cetak transkrip nilai akademik sementara untuk keperluan magang.
            </Text>

            <Button block disabled>Segera Hadir</Button>
          </Card>
        </Col>

      </Row>
    </div>
  );
}
