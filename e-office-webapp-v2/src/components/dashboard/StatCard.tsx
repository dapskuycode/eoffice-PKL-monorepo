// FILE: src/components/dashboard/StatCard.tsx
import React from 'react';
import { Card, Typography } from 'antd';

const { Text, Title } = Typography;

interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  description, 
  icon, 
  iconBgColor = '#1890ff' 
}) => {
  return (
    <Card
      bordered={false}
      style={{
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        height: '100%'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>
            {title}
          </Text>
          <Title level={2} style={{ margin: 0, fontWeight: 700, marginBottom: '4px' }}>
            {value}
          </Title>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {description}
          </Text>
        </div>
        
        {icon && (
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: iconBgColor + '15',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: iconBgColor,
              fontSize: '24px'
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
