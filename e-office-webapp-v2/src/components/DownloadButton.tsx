import React from 'react';
import { Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

interface DownloadButtonProps {
  isActive?: boolean;
  onClick?: () => void;
  loading?: boolean;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ 
  isActive = false, 
  onClick,
  loading = false 
}) => {
  return (
    <Button
      type="primary"
      icon={<DownloadOutlined />}
      onClick={onClick}
      loading={loading}
      style={{
        backgroundColor: isActive ? '#1890ff' : '#d9d9d9',
        borderColor: isActive ? '#1890ff' : '#d9d9d9',
        color: isActive ? '#fff' : '#8c8c8c',
        cursor: isActive ? 'pointer' : 'not-allowed',
      }}
      disabled={!isActive}
    >
      Download Surat
    </Button>
  );
};

export default DownloadButton;
