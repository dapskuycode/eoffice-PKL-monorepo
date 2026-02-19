import React from 'react';
import { Typography, Badge, Button } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, DownloadOutlined } from '@ant-design/icons';

const { Text } = Typography;

export interface RiwayatCardItem {
  role: string;
  timestamp?: string;
  status: string;
  catatan?: string;
  color?: 'gray' | 'blue' | 'green' | 'red' | 'orange';
  onDownload?: () => void;
  showDownload?: boolean;
}

interface RiwayatCardProps {
  item: RiwayatCardItem;
}

const RiwayatCard: React.FC<RiwayatCardProps> = ({ item }) => {
  const getStatusColor = (color?: string) => {
    switch (color) {
      case 'blue':
        return '#1890ff';
      case 'green':
        return '#52c41a';
      case 'red':
        return '#ff4d4f';
      case 'orange':
        return '#fa8c16';
      default:
        return '#d9d9d9';
    }
  };

  const getBadgeStatus = (color?: string): 'success' | 'processing' | 'error' | 'default' | 'warning' => {
    switch (color) {
      case 'green':
        return 'success';
      case 'blue':
        return 'processing';
      case 'red':
        return 'error';
      case 'orange':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
      {/* Bullet/Icon */}
      <div style={{ marginTop: '4px', flexShrink: 0 }}>
        {item.color === 'green' ? (
          <CheckCircleOutlined style={{ fontSize: '16px', color: getStatusColor(item.color) }} />
        ) : (
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: getStatusColor(item.color),
              marginTop: '4px'
            }}
          />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Role */}
        <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>
          {item.role}
        </Text>

        {/* Timestamp */}
        {item.timestamp && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <ClockCircleOutlined style={{ fontSize: '12px', color: '#999' }} />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {item.timestamp}
            </Text>
          </div>
        )}

        {/* Status */}
        <div style={{ marginBottom: '4px' }}>
          <Text style={{ fontSize: '12px', color: '#666' }}>Status: </Text>
          <Badge 
            status={getBadgeStatus(item.color)}
            text={
              <Text style={{ fontSize: '12px', color: getStatusColor(item.color), fontWeight: 500 }}>
                {item.status}
              </Text>
            }
          />
        </div>

        {/* Catatan */}
        <div>
          <Text style={{ fontSize: '12px', color: '#666' }}>Catatan: </Text>
          <Text style={{ fontSize: '12px', color: '#666' }}>
            {item.catatan || 'Tidak ada catatan'}
          </Text>
        </div>

        {/* Download Button */}
        {item.showDownload && (
          <div style={{ marginTop: '8px' }}>
            <Button 
              type="dashed" 
              size="small"
              icon={<DownloadOutlined />}
              onClick={item.onDownload}
            >
              Download Surat
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiwayatCard;
