'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, Descriptions, Tag, Avatar, Row, Col, Typography, Divider } from 'antd';
import { UserOutlined, MailOutlined, BookOutlined, CalendarOutlined, PhoneOutlined, HomeOutlined, CrownOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function KetuaProdiProfile() {
  const { user } = useAuth();

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="p-6">
      <Title level={2}>Profile Ketua Program Studi</Title>
      
      <Row gutter={24}>
        {/* Profile Card */}
        <Col xs={24} lg={8}>
          <Card className="text-center mb-6">
            <Avatar size={120} icon={<CrownOutlined />} className="mb-4" />
            <Title level={3} className="mb-2">{user?.nama || user?.name || 'Nama Ketua'}</Title>
            <Tag color="purple" className="mb-2">
              Ketua Program Studi
            </Tag>
            <div className="text-gray-600">
              <MailOutlined className="mr-2" />
              {user?.email}
            </div>
          </Card>
        </Col>

        {/* Detail Information */}
        <Col xs={24} lg={16}>
          <Card title="Informasi Personal" className="mb-6">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Nama Lengkap">
                {user?.nama || user?.name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {user?.email || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Role">
                <Tag color="purple">Ketua Program Studi</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="ID User">
                {user?.id || '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Informasi Pegawai" className="mb-6">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="NIP">
                {user?.pegawai?.nip || '-'}
              </Descriptions.Item>
              <Descriptions.Item label={<><PhoneOutlined className="mr-2" />No. HP</>}>
                {user?.pegawai?.noHp || '-'}
              </Descriptions.Item>
              <Descriptions.Item label={<><HomeOutlined className="mr-2" />Alamat</>}>
                {user?.pegawai?.alamat || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Tempat Lahir">
                {user?.pegawai?.tempatLahir || '-'}
              </Descriptions.Item>
              <Descriptions.Item label={<><CalendarOutlined className="mr-2" />Tanggal Lahir</>}>
                {formatDate(user?.pegawai?.tanggalLahir)}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
