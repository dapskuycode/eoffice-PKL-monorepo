// FILE: src/components/dashboard/SuratTable.tsx
import React, { useState } from 'react';
import { Card, Table, Tag, Button, Input, DatePicker, Select, Space, Tooltip } from 'antd';
import { SearchOutlined, CalendarOutlined, FilterOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;

interface SuratData {
  key: string;
  idAgenda: string;
  sumber: string;
  pengirim: string;
  perihal: string;
  tanggalDiterima: string;
  tujuanSaatIni: string;
  status: 'menunggu_verifikasi' | 'selesai' | 'dalam_proses' | 'ditolak';
}

interface SuratTableProps {
  data?: SuratData[];
  loading?: boolean;
  onViewDetail?: (record: SuratData) => void;
}

const SuratTable: React.FC<SuratTableProps> = ({ 
  data, 
  loading = false,
  onViewDetail 
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<any>(null);

  // Default data jika tidak ada data yang diberikan
  const defaultData: SuratData[] = [
    {
      key: '1',
      idAgenda: 'SM/2023/08/123',
      sumber: 'Internal',
      pengirim: 'Ahmad Syaifullah',
      perihal: 'Surat Pengantar PKL',
      tanggalDiterima: '15 Agu 2023',
      tujuanSaatIni: 'Admin Surat',
      status: 'menunggu_verifikasi',
    },
    {
      key: '2',
      idAgenda: 'SI/2023/08/045',
      sumber: 'Internal',
      pengirim: 'Dr. Budi Santoso, M.Kom',
      perihal: 'Permohonan Izin Penelitian',
      tanggalDiterima: '14 Agu 2023',
      tujuanSaatIni: 'WD Akademik',
      status: 'selesai',
    },
    {
      key: '3',
      idAgenda: 'SK/2023/08/012',
      sumber: 'Internal',
      pengirim: 'Himpunan Mahasiswa Informatika',
      perihal: 'Peminjaman Ruangan Seminar',
      tanggalDiterima: '12 Agu 2023',
      tujuanSaatIni: 'WD Sumber Daya',
      status: 'dalam_proses',
    },
    {
      key: '4',
      idAgenda: 'SI/2023/08/044',
      sumber: 'Internal',
      pengirim: 'Ani Wijayanti (Mahasiswa)',
      perihal: 'Permohonan Transkrip Nilai',
      tanggalDiterima: '11 Agu 2023',
      tujuanSaatIni: 'Kasubag Akademik',
      status: 'ditolak',
    },
    {
      key: '5',
      idAgenda: 'SM/2023/08/122',
      sumber: 'Internal',
      pengirim: 'Himpunan Mahasiswa Biologi',
      perihal: 'Permohonan Kerjasama Magang',
      tanggalDiterima: '10 Agu 2023',
      tujuanSaatIni: 'Admin TU',
      status: 'menunggu_verifikasi',
    },
  ];

  const tableData = data || defaultData;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      menunggu_verifikasi: 'orange',
      selesai: 'green',
      dalam_proses: 'blue',
      ditolak: 'red',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      menunggu_verifikasi: 'Menunggu Verifikasi',
      selesai: 'Selesai',
      dalam_proses: 'Dalam Proses',
      ditolak: 'Ditolak',
    };
    return texts[status] || status;
  };

  const columns: ColumnsType<SuratData> = [
    {
      title: 'ID/AGENDA',
      dataIndex: 'idAgenda',
      key: 'idAgenda',
      width: 150,
      fixed: 'left',
    },
    {
      title: 'SUMBER',
      dataIndex: 'sumber',
      key: 'sumber',
      width: 100,
    },
    {
      title: 'PENGIRIM/PENGAJU',
      dataIndex: 'pengirim',
      key: 'pengirim',
      width: 200,
    },
    {
      title: 'PERIHAL',
      dataIndex: 'perihal',
      key: 'perihal',
      width: 250,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: 'TANGGAL DITERIMA',
      dataIndex: 'tanggalDiterima',
      key: 'tanggalDiterima',
      width: 150,
    },
    {
      title: 'TUJUAN SAAT INI',
      dataIndex: 'tujuanSaatIni',
      key: 'tujuanSaatIni',
      width: 180,
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: (status) => (
        <Tag color={getStatusColor(status)} style={{ borderRadius: '4px' }}>
          {status === 'menunggu_verifikasi' && '● '}
          {status === 'selesai' && '● '}
          {status === 'dalam_proses' && '★ '}
          {status === 'ditolak' && '● '}
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'AKSI',
      key: 'aksi',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => onViewDetail?.(record)}
          style={{ color: '#8c8c8c' }}
        />
      ),
    },
  ];

  // Filter data berdasarkan pencarian dan filter
  const filteredData = tableData.filter((item) => {
    const matchSearch = !searchText || 
      item.idAgenda.toLowerCase().includes(searchText.toLowerCase()) ||
      item.pengirim.toLowerCase().includes(searchText.toLowerCase()) ||
      item.perihal.toLowerCase().includes(searchText.toLowerCase());
    
    const matchStatus = !selectedStatus || item.status === selectedStatus;
    
    return matchSearch && matchStatus;
  });

  return (
    <Card
      bordered={false}
      style={{
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
      title={
        <div style={{ fontSize: '16px', fontWeight: 600 }}>
          Semua Surat
        </div>
      }
    >
      {/* Filter Section */}
      <div style={{ marginBottom: 16 }}>
        <Space size={12} wrap>
          <Input
            placeholder="Cari surat..."
            prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
            style={{ width: 250 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          
          <RangePicker
            placeholder={['Tanggal Mulai', 'Tanggal Akhir']}
            style={{ width: 280 }}
            suffixIcon={<CalendarOutlined style={{ color: '#8c8c8c' }} />}
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
          />
          
          <Select
            placeholder="Status"
            style={{ width: 200 }}
            suffixIcon={<FilterOutlined style={{ color: '#8c8c8c' }} />}
            value={selectedStatus}
            onChange={setSelectedStatus}
            allowClear
            options={[
              { label: 'Menunggu Verifikasi', value: 'menunggu_verifikasi' },
              { label: 'Selesai', value: 'selesai' },
              { label: 'Dalam Proses', value: 'dalam_proses' },
              { label: 'Ditolak', value: 'ditolak' },
            ]}
          />
        </Space>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        scroll={{ x: 1300 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Showing 1-5 of ${total}`,
          style: { marginTop: 16 },
        }}
      />
    </Card>
  );
};

export default SuratTable;
