'use client';

import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Tag,
  Space,
  Timeline,
  Empty,
  message,
  Statistic,
  Divider,
} from 'antd';
import {
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  HistoryOutlined,
  LogoutOutlined,
  ArrowRightOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { authService } from '@/services/authService';

const { Title, Text } = Typography;

interface DashboardContentProps {
  data: {
    nama: string;
    statistics: {
      totalPengajuan: number;
      menunggu: number;
      selesai: number;
      revisi: number;
      ditolak: number;
    };
    latestPengajuan: any;
    allPengajuan: any[];
  };
  session: any;
}

// Status color mapping
const statusColors: Record<string, string> = {
  DRAFT: 'default',
  SUBMITTED: 'blue',
  REVISI: 'warning',
  DITOLAK: 'error',
  VERIFIED_ADMIN: 'cyan',
  APPROVED_KAPRODI: 'cyan',
  REGISTERING: 'geekblue',
  REGISTERED: 'purple',
  APPROVED_SUPERVISOR: 'purple',
  SIAP_CETAK: 'magenta',
  STEP_KONVENSIONAL: 'magenta',
  COMPLETED: 'success',
  BATAL: 'default',
};

// Status label mapping
const statusLabels: Record<string, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Diajukan',
  REVISI: 'Perlu Revisi',
  DITOLAK: 'Ditolak',
  VERIFIED_ADMIN: 'Verifikasi Admin',
  APPROVED_KAPRODI: 'Disetujui Kaprodi',
  REGISTERING: 'Registrasi',
  REGISTERED: 'Terdaftar',
  APPROVED_SUPERVISOR: 'Acc Supervisor',
  SIAP_CETAK: 'Siap Cetak',
  STEP_KONVENSIONAL: 'Step Konvensional',
  COMPLETED: 'Selesai',
  BATAL: 'Dibatalkan',
};

// Helper component for Stat Cards
const StatCard = ({ title, value, icon, color, bgColor, onClick }: any) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        transform: isHovered && onClick ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'transform 0.2s ease',
        height: '100%'
      }}
    >
      <Card
        bordered={false}
        style={{
          height: '100%',
          borderRadius: 12,
          boxShadow: isHovered && onClick
            ? `0 8px 24px ${color}30`
            : '0 2px 8px rgba(0,0,0,0.05)',
          transition: 'box-shadow 0.3s ease',
          pointerEvents: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Text type="secondary" style={{ fontSize: 14 }}>{title}</Text>
            <Title level={2} style={{ margin: '4px 0 0' }}>{value}</Title>
          </div>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
            fontSize: 24
          }}>
            {icon}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default function DashboardContent({ data, session }: DashboardContentProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { nama, statistics, latestPengajuan, allPengajuan } = data;

  React.useEffect(() => {
    const dismissed = sessionStorage.getItem('dashboard_notification_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  // Check for issues (revisi or ditolak)
  const attentionRequired = allPengajuan.filter((p: any) => ['REVISI', 'DITOLAK'].includes(p.status));
  const revisiCount = allPengajuan.filter((p: any) => p.status === 'REVISI').length;
  const ditolakCount = allPengajuan.filter((p: any) => p.status === 'DITOLAK').length;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authService.logout();
      message.success('Logout berhasil');
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      message.error('Gagal logout');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Data for pie chart
  const distributionData = [
    { name: 'Menunggu', value: statistics.menunggu, color: '#1890ff' }, // Blue
    { name: 'Selesai', value: statistics.selesai, color: '#52c41a' },  // Green
    { name: 'Revisi', value: statistics.revisi, color: '#faad14' },   // Orange
    { name: 'Ditolak', value: statistics.ditolak, color: '#ff4d4f' }, // Red
  ].filter((item) => item.value > 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '24px' }}>

      {/* Header Section */}
      <div style={{
        marginBottom: 32,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#fff',
        padding: '24px',
        borderRadius: 16,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Halo, {nama}! 👋</Title>
          <Text type="secondary">
            Selamat datang di Dashboard SKL. Pantau status pengajuan Anda di sini.
          </Text>
        </div>
        <Space>
          <Button
            type="default"
            size="large"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            loading={isLoggingOut}
            danger
            style={{ borderRadius: 8 }}
          >
            Logout
          </Button>
        </Space>
      </div>

      {/* Notifikasi Perhatian (Revisi & Ditolak) */}
      {!isDismissed && attentionRequired.length > 0 && (
        <Card
          bordered={false}
          style={{
            marginBottom: 24,
            borderRadius: 12,
            borderLeft: `5px solid ${ditolakCount > 0 ? '#ff4d4f' : '#faad14'}`,
            background: ditolakCount > 0 ? '#fff2f0' : '#fffbe6'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <Space>
              <ExclamationCircleOutlined style={{ fontSize: 24, color: ditolakCount > 0 ? '#ff4d4f' : '#faad14' }} />
              <div>
                <Title level={5} style={{ margin: 0, color: ditolakCount > 0 ? '#cf1322' : '#d48806' }}>Perhatian Diperlukan</Title>
                <Text style={{ color: ditolakCount > 0 ? '#cf1322' : '#d48806' }}>
                  Terdapat <b>{attentionRequired.length} pengajuan</b> yang memerlukan perhatian Anda
                  ({revisiCount > 0 ? `${revisiCount} perlu revisi` : ''}
                  {revisiCount > 0 && ditolakCount > 0 ? ' dan ' : ''}
                  {ditolakCount > 0 ? `${ditolakCount} ditolak` : ''}).
                </Text>
              </div>
            </Space>
            <Button
              type="primary"
              style={{
                backgroundColor: ditolakCount > 0 ? '#ff4d4f' : '#faad14',
                borderColor: ditolakCount > 0 ? '#ff4d4f' : '#faad14',
                borderRadius: 6,
                color: '#fff'
              }}
              onClick={() => {
                sessionStorage.setItem('dashboard_notification_dismissed', 'true');
                setIsDismissed(true);
                if (attentionRequired.length === 1) {
                  router.push(`/mahasiswa/detail?id=${attentionRequired[0].id}`);
                } else {
                  router.push('/mahasiswa/riwayat');
                }
              }}
            >
              Lihat Detail
            </Button>
          </div>
        </Card>
      )}

      {/* Statistics Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 0 200px' }}>
          <StatCard
            title="Total Pengajuan"
            value={statistics.totalPengajuan}
            icon={<FileTextOutlined />}
            color="#1890ff"
            bgColor="#e6f7ff"
            onClick={() => router.push('/mahasiswa/riwayat?filter=all')}
          />
        </div>
        <div style={{ flex: '1 0 200px' }}>
          <StatCard
            title="Sedang Proses"
            value={statistics.menunggu}
            icon={<ClockCircleOutlined />}
            color="#faad14"
            bgColor="#fffbe6"
            onClick={() => router.push('/mahasiswa/riwayat?filter=process')}
          />
        </div>
        <div style={{ flex: '1 0 200px' }}>
          <StatCard
            title="Selesai"
            value={statistics.selesai}
            icon={<CheckCircleOutlined />}
            color="#52c41a"
            bgColor="#f6ffed"
            onClick={() => router.push('/mahasiswa/riwayat?filter=completed')}
          />
        </div>
        <div style={{ flex: '1 0 200px' }}>
          <StatCard
            title="Perlu Revisi"
            value={statistics.revisi}
            icon={<HistoryOutlined />}
            color="#faad14"
            bgColor="#fffbe6"
            onClick={() => router.push('/mahasiswa/riwayat?filter=revisi')}
          />
        </div>
        <div style={{ flex: '1 0 200px' }}>
          <StatCard
            title="Ditolak"
            value={statistics.ditolak}
            icon={<ExclamationCircleOutlined />}
            color="#ff4d4f"
            bgColor="#fff1f0"
            onClick={() => router.push('/mahasiswa/riwayat?filter=ditolak')}
          />
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* Latest Submission - Left Side */}
        <Col xs={24} lg={14} xl={16}>
          <Card
            title={<Title level={4} style={{ margin: 0 }}>Pengajuan Terakhir</Title>}
            bordered={false}
            style={{ borderRadius: 12, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            extra={
              latestPengajuan && (
                <Button type="link" onClick={() => router.push('/mahasiswa/riwayat')}>
                  Lihat Semua <ArrowRightOutlined />
                </Button>
              )
            }
          >
            {latestPengajuan ? (
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                      <Text type="secondary">Status Saat Ini</Text>
                      <div style={{ marginTop: 8 }}>
                        <Tag color={statusColors[latestPengajuan.status]} style={{ padding: '4px 12px', fontSize: 14, borderRadius: 4 }}>
                          {statusLabels[latestPengajuan.status]}
                        </Tag>
                      </div>
                    </div>

                    <div style={{ background: '#fafafa', padding: 16, borderRadius: 8 }}>
                      <Row gutter={[16, 16]}>
                        <Col span={24}>
                          <Text type="secondary" style={{ fontSize: 12 }}>Tanggal Pengajuan</Text><br />
                          <Text strong>
                            {latestPengajuan.createdAt ? new Date(latestPengajuan.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric', month: 'long', year: 'numeric'
                            }) : '-'}
                          </Text>
                        </Col>
                        {latestPengajuan.nomorSurat && (
                          <Col span={24}>
                            <Text type="secondary" style={{ fontSize: 12 }}>Nomor Surat</Text><br />
                            <Text copyable>{latestPengajuan.nomorSurat}</Text>
                          </Col>
                        )}
                      </Row>
                    </div>

                    {!isDismissed && ['REVISI', 'DITOLAK'].includes(latestPengajuan.status) && (
                      <div style={{
                        padding: '12px 16px',
                        backgroundColor: latestPengajuan.status === 'DITOLAK' ? '#fff2f0' : '#fffbe6',
                        border: `1px solid ${latestPengajuan.status === 'DITOLAK' ? '#ffccc7' : '#ffe58f'}`,
                        borderRadius: 8,
                        marginBottom: 16
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Space align="start">
                            <ExclamationCircleOutlined style={{ color: latestPengajuan.status === 'DITOLAK' ? '#ff4d4f' : '#faad14', marginTop: 3 }} />
                            <div>
                              <Text strong style={{ color: latestPengajuan.status === 'DITOLAK' ? '#cf1322' : '#d48806', fontSize: 13 }}>
                                {latestPengajuan.status === 'DITOLAK' ? 'Pengajuan Ditolak' : 'Perlu Revisi'}
                              </Text>
                              <br />
                              <Text style={{ fontSize: 12, color: latestPengajuan.status === 'DITOLAK' ? '#cf1322' : '#d48806' }}>
                                Silakan cek riwayat kegiatan untuk melihat alasan.
                              </Text>
                            </div>
                          </Space>
                          <Button
                            size="small"
                            type="primary"
                            ghost
                            style={{
                              fontSize: 12,
                              borderRadius: 4,
                              borderColor: latestPengajuan.status === 'DITOLAK' ? '#ff4d4f' : '#faad14',
                              color: latestPengajuan.status === 'DITOLAK' ? '#ff4d4f' : '#faad14'
                            }}
                            onClick={() => {
                              sessionStorage.setItem('dashboard_notification_dismissed', 'true');
                              setIsDismissed(true);
                              router.push(`/mahasiswa/detail?id=${latestPengajuan.id}`);
                            }}
                          >
                            Lihat Detail
                          </Button>
                        </div>
                      </div>
                    )}

                    <Button
                      type="primary"
                      ghost
                      block
                      size="large"
                      style={{ borderRadius: 8 }}
                      onClick={() => {
                        if (['REVISI', 'DITOLAK'].includes(latestPengajuan.status)) {
                          sessionStorage.setItem('dashboard_notification_dismissed', 'true');
                          setIsDismissed(true);
                        }
                        router.push(`/mahasiswa/detail?id=${latestPengajuan.id}`);
                      }}
                    >
                      Lihat Detail & Tracking
                    </Button>
                  </Space>
                </Col>

                <Col xs={24} md={12}>
                  <div style={{ paddingLeft: 0, borderLeft: '1px solid #f0f0f0' }}>
                    <div style={{ padding: '0 0 16px 16px' }}>
                      <Text strong>Aktivitas Terakhir</Text>
                    </div>
                    {latestPengajuan.riwayat && latestPengajuan.riwayat.length > 0 ? (
                      <Timeline
                        mode="left"
                        style={{ marginLeft: 16 }}
                        items={latestPengajuan.riwayat.slice(0, 3).map((r: any) => ({
                          color: r.status === 'COMPLETED' ? 'green' : r.status === 'DITOLAK' ? 'red' : 'blue',
                          children: (() => {
                            const roles = r.actor?.userRole?.map((ur: any) => ur.role?.name).join(', ') || 'Sistem';
                            const actorDisplay = r.actor?.name ? `${r.actor.name} (${roles})` : 'Sistem';
                            return (
                              <div style={{ paddingBottom: 12 }}>
                                <div style={{ marginBottom: 4 }}>
                                  <Text strong style={{ fontSize: 13, display: 'block' }}>{actorDisplay}</Text>
                                </div>
                                <div style={{ marginBottom: 8 }}>
                                  <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                                    {r.timestamp ? new Date(r.timestamp).toLocaleDateString('id-ID', {
                                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                    }) : '-'}
                                  </Text>
                                </div>
                                {r.catatan && (
                                  <div style={{
                                    marginTop: 4,
                                    background: '#fff7e6',
                                    padding: '8px 12px',
                                    borderRadius: 6,
                                    border: '1px dashed #ffd591',
                                    position: 'relative'
                                  }}>
                                    <div style={{
                                      position: 'absolute',
                                      left: 0,
                                      top: 0,
                                      bottom: 0,
                                      width: 3,
                                      background: '#faad14',
                                      borderRadius: '3px 0 0 3px'
                                    }} />
                                    <Text style={{ fontSize: 12, color: '#d46b08', fontStyle: 'italic' }}>
                                      "{r.catatan}"
                                    </Text>
                                  </div>
                                )}
                              </div>
                            );
                          })(),
                        }))}
                      />
                    ) : (
                      <div style={{ padding: 16, textAlign: 'center' }}><Text type="secondary">Belum ada riwayat</Text></div>
                    )}
                  </div>
                </Col>
              </Row>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div style={{ textAlign: 'center' }}>
                    <Text type="secondary">Belum ada pengajuan aktif</Text>
                    <br />
                    <Button
                      type="primary"
                      style={{ marginTop: 16, borderRadius: 8 }}
                      onClick={() => router.push('/mahasiswa/surat/skl/ajukan')}
                    >
                      Buat Pengajuan Sekarang
                    </Button>
                  </div>
                }
              />
            )}
          </Card>
        </Col>

        {/* Chart - Right Side */}
        <Col xs={24} lg={10} xl={8}>
          <Card
            title={<Title level={5} style={{ margin: 0 }}>Statistik Pengajuan</Title>}
            bordered={false}
            style={{ borderRadius: 12, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
          >
            {distributionData.length > 0 ? (
              <div style={{ width: '100%', height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Custom Legend */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: -20 }}>
                  {distributionData.map((entry, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', fontSize: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.color, marginRight: 6 }} />
                      <Text type="secondary">{entry.name}: <b>{entry.value}</b></Text>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Empty description="Belum ada data statistik" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}