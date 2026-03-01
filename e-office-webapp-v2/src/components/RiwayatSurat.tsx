import React, { useEffect, useState } from 'react';
import { Card, Space, Spin } from 'antd';
import RiwayatCard, { RiwayatCardItem } from './RiwayatCard';

export type RiwayatItem = RiwayatCardItem;

interface RiwayatSuratProps {
  title?: string;
  pengajuanId: string; // ID pengajuan untuk fetch riwayat
}

// Map status to color - Hijau untuk yang sudah ditangani/disetujui
const getStatusColor = (status: string): 'gray' | 'blue' | 'green' | 'red' | 'orange' => {
  const statusColorMap: Record<string, 'gray' | 'blue' | 'green' | 'red' | 'orange'> = {
    DRAFT: 'gray',
    SUBMITTED: 'blue',
    VERIFIED_ADMIN: 'green',
    APPROVED_KAPRODI: 'green',
    REGISTERING: 'blue',
    REGISTERED: 'green',
    APPROVED_SUPERVISOR: 'green',
    SIAP_CETAK: 'green',
    STEP_KONVENSIONAL: 'blue',
    COMPLETED: 'green',
    REVISI: 'orange',
    DITOLAK: 'red',
  };
  return statusColorMap[status] || 'gray';
};

// Map status to readable label
const getStatusLabel = (status: string): string => {
  const statusLabelMap: Record<string, string> = {
    DRAFT: 'Draft',
    SUBMITTED: 'Diajukan',
    VERIFIED_ADMIN: 'Terverifikasi Admin',
    APPROVED_KAPRODI: 'Disetujui Kaprodi',
    REGISTERING: 'Proses Pendaftaran',
    REGISTERED: 'Terdaftar',
    APPROVED_SUPERVISOR: 'Disetujui Supervisor',
    SIAP_CETAK: 'Siap Cetak',
    STEP_KONVENSIONAL: 'Proses Pencetakan',
    COMPLETED: 'Selesai',
    REVISI: 'Perlu Revisi',
    DITOLAK: 'Ditolak',
  };
  return statusLabelMap[status] || status;
};

// Map actor role to display name - Prioritaskan status mapping, baru catatan
const getRoleDisplayName = (actor: any, statusBaru: string, catatan?: string): string => {
  if (!actor) return 'Sistem';

  // Priority 1: Use status to role mapping for most statuses (most reliable)
  const statusToRoleMap: Record<string, string> = {
    DRAFT: 'Mahasiswa',
    SUBMITTED: 'Mahasiswa',
    VERIFIED_ADMIN: 'Admin Prodi',
    APPROVED_KAPRODI: 'Ketua Prodi',
    REGISTERING: 'Admin Prodi',
    REGISTERED: 'Admin Fakultas',
    APPROVED_SUPERVISOR: 'Supervisor',
    SIAP_CETAK: 'Supervisor',
    STEP_KONVENSIONAL: 'Staff Fakultas',
    COMPLETED: 'Pegawai UPA',
  };

  // For most statuses, role can be determined from status alone
  if (statusToRoleMap[statusBaru]) {
    return statusToRoleMap[statusBaru];
  }

  // Priority 2: For REVISI and DITOLAK, check catatan for role keywords
  // (multiple roles can do revisi/tolak, so we need to check catatan)
  if (statusBaru === 'REVISI' || statusBaru === 'DITOLAK') {
    if (catatan) {
      const catatanLower = catatan.toLowerCase();
      // Check for explicit role mentions in format "dari [Role]:" or "oleh [Role]:"
      if (catatanLower.includes('dari supervisor:') || catatanLower.includes('oleh supervisor:')) return 'Supervisor';
      if (catatanLower.includes('dari admin prodi:') || catatanLower.includes('oleh admin prodi:')) return 'Admin Prodi';
      if (catatanLower.includes('dari ketua prodi:') || catatanLower.includes('oleh ketua prodi:') || catatanLower.includes('dari kaprodi:') || catatanLower.includes('oleh kaprodi:')) return 'Ketua Prodi';
      if (catatanLower.includes('dari admin fakultas:') || catatanLower.includes('oleh admin fakultas:')) return 'Admin Fakultas';
      if (catatanLower.includes('dari staff fakultas:') || catatanLower.includes('oleh staff fakultas:')) return 'Staff Fakultas';
      if (catatanLower.includes('dari manajer tu:') || catatanLower.includes('oleh manajer tu:')) return 'Manajer TU';
      if (catatanLower.includes('dari pegawai upa:') || catatanLower.includes('oleh pegawai upa:')) return 'Pegawai UPA';
    }
  }

  // Priority 3: Try to infer from actor name
  const actorName = (actor.name || '').toLowerCase();
  if (actorName.includes('supervisor')) return 'Supervisor';
  if (actorName.includes('ketua') || actorName.includes('kaprodi')) return 'Ketua Prodi';
  if (actorName.includes('admin fakultas')) return 'Admin Fakultas';
  if (actorName.includes('admin prodi') || actorName.includes('admin')) return 'Admin Prodi';
  if (actorName.includes('staff')) return 'Staff Fakultas';
  if (actorName.includes('manajer')) return 'Manajer TU';
  if (actorName.includes('pegawai') || actorName.includes('upa')) return 'Pegawai UPA';

  // Fallback: return actor name or Sistem
  return actor.name || 'Sistem';
};

const RiwayatSurat: React.FC<RiwayatSuratProps> = ({
  title = 'Riwayat Surat',
  pengajuanId
}) => {
  const [items, setItems] = useState<RiwayatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRiwayat();
  }, [pengajuanId]);

  const fetchRiwayat = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/skl/pengajuan/${pengajuanId}/riwayat`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch riwayat:', response.status);
        setItems([]);
        return;
      }

      const riwayatData = await response.json();
      console.log('[RiwayatSurat] Fetched riwayat:', riwayatData);

      // Sort by timestamp descending (newest first)
      const sortedRiwayat = riwayatData.sort((a: any, b: any) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      console.log('[RiwayatSurat] Sorted riwayat:', sortedRiwayat);

      // Transform data to RiwayatItem format
      const transformedItems: RiwayatItem[] = sortedRiwayat.map((item: any) => ({
        role: getRoleDisplayName(item.actor, item.statusBaru, item.catatan),
        timestamp: new Date(item.timestamp).toLocaleString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: getStatusLabel(item.statusBaru),
        catatan: item.catatan || 'Tidak ada catatan',
        color: getStatusColor(item.statusBaru),
        showDownload: item.statusBaru === 'COMPLETED' && !!item.nomorSkl,
      }));

      setItems(transformedItems);
    } catch (error) {
      console.error('[RiwayatSurat] Error fetching riwayat:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={`${title} (${items.length})`}
      style={{
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
      styles={{ body: { padding: '16px' } }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <Spin>
            <div style={{ padding: '20px' }}>Memuat riwayat...</div>
          </Spin>
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px', color: '#999' }}>
          Belum ada riwayat
        </div>
      ) : (
        <Space orientation="vertical" size={0} style={{ width: '100%' }}>
          {items.map((item, index) => (
            <RiwayatCard key={index} item={item} />
          ))}
        </Space>
      )}
    </Card>
  );
};

export default RiwayatSurat;
