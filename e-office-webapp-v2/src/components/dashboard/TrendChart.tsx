// FILE: src/components/dashboard/TrendChart.tsx
import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

interface TrendChartProps {
  title?: string;
  data?: Array<{ period: string; value: number }>;
}

const TrendChart: React.FC<TrendChartProps> = ({ 
  title = 'Tren Volume 30 Hari',
  data 
}) => {
  // Default data jika tidak ada data yang diberikan
  const defaultData = [
    { period: '1-7', value: 20 },
    { period: '8-15', value: 35 },
    { period: '16-23', value: 28 },
    { period: '24-30', value: 52 },
  ];

  const chartData = data || defaultData;

  // Find max value for Y axis
  const maxValue = Math.max(...chartData.map(d => d.value));
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
          {[0, 25, 50, 75].map((y) => (
            <line
              key={y}
              x1="40"
              y1={250 - (y / 75) * 200 - 30}
              x2="100%"
              y2={250 - (y / 75) * 200 - 30}
              stroke="#f0f0f0"
              strokeWidth="1"
            />
          ))}
          
          {/* Y axis labels */}
          {[0, 25, 50, 75].map((y) => (
            <text
              key={y}
              x="5"
              y={250 - (y / 75) * 200 - 26}
              fontSize="12"
              fill="#8c8c8c"
            >
              {y}
            </text>
          ))}

          {/* Line path */}
          <polyline
            fill="none"
            stroke="#1890ff"
            strokeWidth="2"
            points={chartData.map((d, i) => {
              const x = 60 + (i * ((100 / chartData.length) * 10));
              const y = 250 - (d.value / 75) * 200 - 30;
              return `${x},${y}`;
            }).join(' ')}
          />

          {/* Data points */}
          {chartData.map((d, i) => {
            const x = 60 + (i * ((100 / chartData.length) * 10));
            const y = 250 - (d.value / 75) * 200 - 30;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="5"
                fill="#1890ff"
                stroke="#fff"
                strokeWidth="2"
              />
            );
          })}

          {/* X axis labels */}
          {chartData.map((d, i) => {
            const x = 60 + (i * ((100 / chartData.length) * 10));
            return (
              <text
                key={i}
                x={x}
                y="235"
                fontSize="12"
                fill="#8c8c8c"
                textAnchor="middle"
              >
                {d.period}
              </text>
            );
          })}
        </svg>
      </div>
    </Card>
  );
};

export default TrendChart;
