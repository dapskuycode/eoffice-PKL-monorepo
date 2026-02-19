"use client";

import React from 'react';
import { Card, Descriptions, Button, Space, Typography, Divider, Input, Row, Col } from 'antd';
import { FilePdfOutlined, DownloadOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;
const { TextArea } = Input;

export type UserRole = 'upa' | 'supervisor' | 'admin_fakultas' | 'kaprodi' | 'admin_prodi' | 'mahasiswa';

export interface SuratDetail {
  id: string;
  nomorSurat?: string;
  tanggalAjuan: string;
  penerima: string;
  status: 'pending' | 'disetujui' | 'ditolak' | 'revisi';
  catatan?: string;
  dokumen?: {
    nama: string;
    url: string;
  };
}

interface SuratDetailByRoleProps {
  role: UserRole;
  detail: SuratDetail;
  onApprove?: () => void;
  onReject?: () => void;
  rejectionReason?: string;
  onReasonChange?: (reason: string) => void;
  loading?: boolean;
}

const RoleConfig = {
  upa: {
    label: 'UPA',
    color: '#1890ff',
    description: 'Unit Pelayanan Administrasi',
  },
  supervisor: {
    label: 'Supervisor',
    color: '#722ed1',
    description: 'Dosen Pembimbing',
  },
  admin_fakultas: {
    label: 'Admin Fakultas',
    color: '#eb2f96',
    description: 'Administrasi Fakultas',
  },
  kaprodi: {
    label: 'Ketua Program Studi',
    color: '#fa8c16',
    description: 'Ketua Program Studi',
  },
  admin_prodi: {
    label: 'Admin Prodi',
    color: '#13c2c2',
    description: 'Administrasi Program Studi',
  },
  mahasiswa: {
    label: 'Mahasiswa',
    color: '#52c41a',
    description: 'Pengaju (Mahasiswa)',
  },
};

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'disetujui':
      return '#52c41a';
    case 'ditolak':
      return '#ff4d4f';
    case 'revisi':
      return '#faad14';
    default:
      return '#d9d9d9';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'disetujui':
      return 'Disetujui';
    case 'ditolak':
      return 'Ditolak';
    case 'revisi':
      return 'Revisi';
    default:
      return 'Pending';
  }
};

const SuratDetailByRole: React.FC<SuratDetailByRoleProps> = ({
  role,
  detail,
  onApprove,
  onReject,
  rejectionReason = '',
  onReasonChange,
  loading = false,
}) => {
  const config = RoleConfig[role];
  const canApproveReject = role !== 'mahasiswa';

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: config.color,
            }}
          />
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{config.label}</div>
            <div style={{ fontSize: 12, color: '#999' }}>{config.description}</div>
          </div>
        </div>
      }
      style={{
        borderRadius: '8px',
        marginBottom: 16,
        borderLeft: `4px solid ${config.color}`,
      }}
      bodyStyle={{ paddingTop: 0 }}
    >
      <Divider style={{ margin: '0 0 16px 0' }} />

      {/* Detail Surat */}
      <Descriptions column={2} size="small" style={{ marginBottom: 16 }}>
        {detail.nomorSurat && (
          <Descriptions.Item label="Nomor Surat">
            <Text>{detail.nomorSurat}</Text>
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Tanggal Ajuan">
          <Text>{detail.tanggalAjuan}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Penerima">
          <Text>{detail.penerima}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <div
            style={{
              display: 'inline-block',
              padding: '4px 8px',
              borderRadius: 4,
              backgroundColor: getStatusBadgeColor(detail.status),
              color: '#fff',
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {getStatusLabel(detail.status)}
          </div>
        </Descriptions.Item>
      </Descriptions>

      {/* Catatan */}
      {detail.catatan && (
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ fontSize: 12, color: '#666' }}>
            Catatan:
          </Text>
          <div
            style={{
              marginTop: 4,
              padding: 8,
              backgroundColor: '#fafafa',
              borderRadius: 4,
              fontSize: 12,
              color: '#666',
            }}
          >
            {detail.catatan}
          </div>
        </div>
      )}

      {/* Dokumen */}
      {detail.dokumen && (
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ fontSize: 12, color: '#666' }}>
            Dokumen:
          </Text>
          <div
            style={{
              marginTop: 4,
              padding: 8,
              backgroundColor: '#fafafa',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FilePdfOutlined style={{ fontSize: 16, color: '#ff4d4f' }} />
              <Text style={{ fontSize: 12 }}>{detail.dokumen.nama}</Text>
            </div>
            <Button
              type="text"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => {
                // TODO: Implement download logic
                console.log('Download:', detail.dokumen?.url);
              }}
            >
              Download
            </Button>
          </div>
        </div>
      )}

      {/* Action Buttons - hanya untuk role selain mahasiswa */}
      {canApproveReject && detail.status === 'pending' && (
        <div>
          <Divider style={{ margin: '16px 0' }} />
          <div style={{ marginBottom: 12 }}>
            <Text strong style={{ fontSize: 12, color: '#666' }}>
              Catatan Penolakan (opsional):
            </Text>
            <TextArea
              rows={3}
              placeholder="Masukkan alasan penolakan jika ada..."
              value={rejectionReason}
              onChange={(e) => onReasonChange?.(e.target.value)}
              style={{ marginTop: 4 }}
            />
          </div>

          <Space style={{ width: '100%' }} size="middle">
            <Button
              type="primary"
              icon={<CheckOutlined />}
              loading={loading}
              onClick={onApprove}
              style={{
                backgroundColor: '#52c41a',
                borderColor: '#52c41a',
              }}
            >
              Setujui
            </Button>
            <Button
              danger
              icon={<CloseOutlined />}
              loading={loading}
              onClick={onReject}
            >
              Tolak
            </Button>
          </Space>
        </div>
      )}

      {/* Status Badge - untuk non-pending status */}
      {detail.status !== 'pending' && (
        <div style={{ textAlign: 'center', padding: '16px 0', color: getStatusBadgeColor(detail.status) }}>
          <Text strong>
            {detail.status === 'disetujui' && '✓ Surat telah disetujui'}
            {detail.status === 'ditolak' && '✗ Surat ditolak'}
            {detail.status === 'revisi' && '! Memerlukan revisi'}
          </Text>
        </div>
      )}
    </Card>
  );
};

export default SuratDetailByRole;
