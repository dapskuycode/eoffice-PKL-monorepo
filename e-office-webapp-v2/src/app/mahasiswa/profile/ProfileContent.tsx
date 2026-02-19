'use client';

import React, { useState } from 'react';
import {
  Card,
  Descriptions,
  Avatar,
  Row,
  Col,
  Typography,
  Space,
  Alert,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  IdcardOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  BookOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface ProfileContentProps {
  mahasiswa: {
    id: string;
    nim: string;
    nama: string;
    email: string;
    tahunMasuk: string;
    noHp: string;
    alamat: string;
    tempatLahir: string;
    tanggalLahir: Date;
    programStudi: string;
    departemen: string;
  };
}

export default function ProfileContent({ mahasiswa }: ProfileContentProps) {
  const [profileData] = useState(mahasiswa);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Profil Mahasiswa</Title>
        <Text type="secondary">Informasi lengkap data mahasiswa</Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Profile Card */}
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Avatar size={120} icon={<UserOutlined />} />
              <Title level={3} style={{ marginTop: 16, marginBottom: 4 }}>
                {profileData.nama}
              </Title>
              <Text type="secondary">{profileData.nim}</Text>
              <div style={{ marginTop: 16 }}>
                <Space vertical style={{ width: '100%' }}>
                  <div>
                    <MailOutlined style={{ marginRight: 8 }} />
                    <Text>{profileData.email}</Text>
                  </div>
                  <div>
                    <PhoneOutlined style={{ marginRight: 8 }} />
                    <Text>{profileData.noHp}</Text>
                  </div>
                </Space>
              </div>
            </div>
          </Card>
        </Col>

        {/* Detail Information */}
        <Col xs={24} lg={16}>
          <Card title="Informasi Personal">
            <Descriptions column={1} bordered>
              <Descriptions.Item label={<><IdcardOutlined /> NIM</>}>
                {profileData.nim}
              </Descriptions.Item>
              <Descriptions.Item label={<><UserOutlined /> Nama Lengkap</>}>
                {profileData.nama}
              </Descriptions.Item>
              <Descriptions.Item label={<><MailOutlined /> Email</>}>
                {profileData.email}
              </Descriptions.Item>
              <Descriptions.Item label={<><PhoneOutlined /> No. HP</>}>
                {profileData.noHp}
              </Descriptions.Item>
              <Descriptions.Item label={<><CalendarOutlined /> Tahun Masuk</>}>
                {profileData.tahunMasuk}
              </Descriptions.Item>
              <Descriptions.Item label={<><BookOutlined /> Program Studi</>}>
                {profileData.programStudi}
              </Descriptions.Item>
              <Descriptions.Item label="Departemen">
                {profileData.departemen}
              </Descriptions.Item>
              <Descriptions.Item label={<><EnvironmentOutlined /> Tempat Lahir</>}>
                {profileData.tempatLahir}
              </Descriptions.Item>
              <Descriptions.Item label="Tanggal Lahir">
                {profileData.tanggalLahir ? new Date(profileData.tanggalLahir).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label={<><HomeOutlined /> Alamat</>}>
                {profileData.alamat}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Admin Contact Alert */}
          <Alert
            message="Informasi Kontak Admin"
            description="Ketika ada perubahan atau pertanyaan, silakan hubungi admin dengan nomor: 0812-3456-7890"
            type="info"
            icon={<InfoCircleOutlined />}
            showIcon
            style={{ marginTop: 24 }}
          />
        </Col>
      </Row>
    </div>
  );
}
