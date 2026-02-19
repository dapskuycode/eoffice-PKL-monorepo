import React from 'react';
import { Input, Select, DatePicker, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

interface FilterBarProps {
  searchValue?: string;
  statusValue?: string;
  onSearchChange?: (value: string) => void;
  onStatusChange?: (value: string) => void;
  onDateRangeChange?: (dates: any) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchValue,
  statusValue,
  onSearchChange,
  onStatusChange,
  onDateRangeChange,
}) => {
  return (
    <div
      style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      <Space vertical size={12} style={{ width: '100%' }}>
        {/* Search Bar */}
        <Input
          placeholder="Cari berdasarkan nomor surat, pengirim, atau perihal..."
          prefix={<SearchOutlined style={{ color: '#999' }} />}
          size="large"
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          style={{
            borderRadius: '6px',
          }}
        />

        {/* Filter Row */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <Select
              placeholder="Filter berdasarkan status"
              style={{ width: '100%' }}
              size="large"
              allowClear
              value={statusValue}
              onChange={onStatusChange}
              options={[
                { value: 'selesai', label: '✓ Selesai' },
                { value: 'revisi', label: '⚠ Revisi' },
                { value: 'ditolak', label: '✗ Ditolak' },
                { value: 'menunggu-verifikasi', label: '⚫ Menunggu Verifikasi' },
              ]}
            />
          </div>
          <div style={{ flex: 1 }}>
            <RangePicker
              style={{ width: '100%' }}
              size="large"
              placeholder={['Tanggal mulai', 'Tanggal akhir']}
              onChange={onDateRangeChange}
              format="DD MMM YYYY"
            />
          </div>
        </div>
      </Space>
    </div>
  );
};

export default FilterBar;
