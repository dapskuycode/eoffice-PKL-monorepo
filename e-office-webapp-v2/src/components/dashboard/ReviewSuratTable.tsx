import React from 'react';
import { Table, Tag, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

export interface ReviewSuratData {
  key: string;
  idAgenda: string;
  sumber: string;
  pengirim: string;
  perihal: string;
  tanggalDiterima: string;
  status: 'Selesai' | 'Revisi' | 'Ditolak' | 'Menunggu Verifikasi';
}

interface ReviewSuratTableProps {
  data: ReviewSuratData[];
  loading?: boolean;
  onViewDetail?: (record: ReviewSuratData) => void;
}

const ReviewSuratTable: React.FC<ReviewSuratTableProps> = ({
  data,
  loading = false,
  onViewDetail,
}) => {
  const columns: ColumnsType<ReviewSuratData> = [
    {
      title: 'ID/AGENDA',
      dataIndex: 'idAgenda',
      key: 'idAgenda',
      width: 140,
    },
    {
      title: 'SUMBER',
      dataIndex: 'sumber',
      key: 'sumber',
      width: 100,
    },
    {
      title: 'PENGIRIM/PEMOHON',
      dataIndex: 'pengirim',
      key: 'pengirim',
      width: 150,
    },
    {
      title: 'PERIHAL',
      dataIndex: 'perihal',
      key: 'perihal',
      ellipsis: true,
    },
    {
      title: 'TANGGAL DITERIMA',
      dataIndex: 'tanggalDiterima',
      key: 'tanggalDiterima',
      width: 140,
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: (status: string) => {
        let color = 'default';
        let icon = '';

        switch (status) {
          case 'Selesai':
            color = 'green';
            icon = '✓';
            break;
          case 'Revisi':
            color = 'orange';
            icon = '⚠';
            break;
          case 'Ditolak':
            color = 'red';
            icon = '✗';
            break;
          case 'Menunggu Verifikasi':
            color = 'blue';
            icon = '⚫';
            break;
        }

        return (
          <Tag color={color} style={{ fontSize: '13px' }}>
            {icon && <span style={{ marginRight: 4 }}>{icon}</span>}
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'AKSI',
      key: 'aksi',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => onViewDetail?.(record)}
        />
      ),
    },
  ];

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          total: data.length,
          showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total}`,
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default ReviewSuratTable;
