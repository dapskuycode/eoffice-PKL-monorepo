// FILE: src/components/dashboard/DistributionChart.tsx
import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

interface DistributionData {
  status: string;
  count: number;
  color: string;
}

interface DistributionChartProps {
  title?: string;
  data?: DistributionData[];
}

const DistributionChart: React.FC<DistributionChartProps> = ({ 
  title = 'Distribusi Status',
  data 
}) => {
  // Default data jika tidak ada data yang diberikan
  const defaultData: DistributionData[] = [
    { status: 'Baru', count: 10, color: '#d9d9d9' },
    { status: 'Proses', count: 35, color: '#faad14' },
    { status: 'Disposisi', count: 45, color: '#1890ff' },
    { status: 'Selesai', count: 52, color: '#52c41a' },
    { status: 'Ditolak', count: 8, color: '#ff4d4f' },
  ];

  const chartData = data || defaultData;
  const maxValue = Math.max(...chartData.map(d => d.count));
  const yMax = Math.ceil(maxValue / 10) * 10 + 10;

  return (
    <Card
      bordered={false}
      style={{
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <Title level={5} style={{ marginBottom: 16 }}>
        {title}
      </Title>
      <div style={{ position: 'relative', height: 250 }}>
        <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
          {/* Grid lines */}
          {[0, 20, 40, 60].map((y) => (
            <line
              key={y}
              x1="0"
              y1={250 - (y / 60) * 200 - 30}
              x2="100%"
              y2={250 - (y / 60) * 200 - 30}
              stroke="#f0f0f0"
              strokeWidth="1"
            />
          ))}

          {/* Bars */}
          {chartData.map((d, i) => {
            const barWidth = 50;
            const spacing = 15;
            const x = i * (barWidth + spacing) + 40;
            const barHeight = (d.count / 60) * 200;
            const y = 250 - barHeight - 30;
            
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={d.color}
                  rx="8"
                  ry="8"
                  style={{
                    clipPath: 'inset(0 0 0 0 round 8px 8px 0 0)'
                  }}
                />
                <text
                  x={x + barWidth / 2}
                  y="235"
                  fontSize="12"
                  fill="#8c8c8c"
                  textAnchor="middle"
                >
                  {d.status}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </Card>
  );
};

export default DistributionChart;
