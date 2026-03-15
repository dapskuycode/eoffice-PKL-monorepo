const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface KaprodiDashboard {
  pengajuan: any[];
  stats: {
    perluTindakan: number;
    selesai: number;
    totalSurat: number;
  };
}

export const kaprodiService = {
  /**
   * Get dashboard data for kaprodi (ketua prodi)
   * Shows pengajuan with status VERIFIED_ADMIN (ready for kaprodi approval)
   */
  async getDashboard(): Promise<KaprodiDashboard | null> {
    try {
      console.log('[kaprodiService] Fetching dashboard from:', `${API_URL}/skl/pengajuan`);
      const response = await fetch(`${API_URL}/skl/pengajuan`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('[kaprodiService] Failed to fetch dashboard:', response.status);
        return null;
      }

      const allPengajuan = await response.json();

      // Filter: Kaprodi sees VERIFIED_ADMIN (perlu TTD), APPROVED_KAPRODI (setelah TTD), 
      // REGISTERING (sudah diberi nomor), dan status selanjutnya untuk tracking
      const pengajuanList = allPengajuan.filter((p: any) => {
        // Status normal yang ditangani kaprodi
        if (p.status === 'VERIFIED_ADMIN' ||   // Perlu tindakan TTD & approve
          p.status === 'APPROVED_KAPRODI' || // Sudah di-TTD, menunggu nomor
          p.status === 'REGISTERING' ||      // Sudah diberi nomor admin prodi
          p.status === 'REGISTERED' ||       // Sudah diregistrasi admin fakultas
          p.status === 'APPROVED_SUPERVISOR' || // Tracking
          p.status === 'SIAP_CETAK' ||       // Tracking
          p.status === 'STEP_KONVENSIONAL' || // Tracking
          p.status === 'COMPLETED') {        // Selesai
          return true;
        }

        // DITOLAK hanya muncul jika surat pernah sampai ke Kaprodi
        // (pernah ada status VERIFIED_ADMIN atau APPROVED_KAPRODI di riwayat)
        if (p.status === 'DITOLAK' && p.riwayat && p.riwayat.length > 0) {
          const pernahDiKaprodi = p.riwayat.some((r: any) =>
            r.statusBaru === 'VERIFIED_ADMIN' || r.statusBaru === 'APPROVED_KAPRODI'
          );
          if (pernahDiKaprodi) return true;
        }

        return false;
      });

      console.log('[kaprodiService] Dashboard data:', pengajuanList);

      // Calculate stats
      // Untuk ketua prodi, yang perlu tindakan hanya VERIFIED_ADMIN
      const perluTindakan = pengajuanList.filter((p: any) => p.status === 'VERIFIED_ADMIN').length;

      // "selesai" adalah surat yang sudah ditandatangani (APPROVED_KAPRODI dan seterusnya), ditolak, atau perlu revisi
      const selesai = pengajuanList.filter((p: any) =>
        p.status === 'APPROVED_KAPRODI' ||
        p.status === 'REGISTERING' ||
        p.status === 'REGISTERED' ||
        p.status === 'APPROVED_SUPERVISOR' ||
        p.status === 'SIAP_CETAK' ||
        p.status === 'STEP_KONVENSIONAL' ||
        p.status === 'COMPLETED' ||
        p.status === 'DITOLAK' ||
        p.status === 'REVISI'
      ).length;

      return {
        pengajuan: pengajuanList,
        stats: {
          perluTindakan,
          selesai,
          totalSurat: pengajuanList.length,
        },
      };
    } catch (error) {
      console.error('[kaprodiService] Error fetching dashboard:', error);
      return null;
    }
  },

  /**
   * Approve pengajuan (Kaprodi signs the letter)
   */
  async approvePengajuan(id: string, actorId: string, catatan?: string, tandatanganKaprodi?: string): Promise<boolean> {
    try {
      console.log('[kaprodiService] Approving pengajuan:', { id, actorId, catatan });
      const response = await fetch(`${API_URL}/skl/pengajuan/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'APPROVED_KAPRODI',
          actorId,
          catatan: catatan || 'Disetujui oleh Ketua Program Studi',
          ...(tandatanganKaprodi && { tandatanganKaprodi }),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[kaprodiService] Approval failed:', response.status, errorText);
        return false;
      }

      console.log('[kaprodiService] Approval successful');
      return true;
    } catch (error) {
      console.error('[kaprodiService] Error approving pengajuan:', error);
      return false;
    }
  },

  /**
   * Request revision
   */
  async requestRevision(id: string, actorId: string, catatan: string): Promise<boolean> {
    try {
      console.log('[kaprodiService] Requesting revision:', { id, actorId, catatan });
      const response = await fetch(`${API_URL}/skl/pengajuan/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'REVISI',
          actorId,
          catatan,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[kaprodiService] Revision request failed:', response.status, errorText);
        return false;
      }

      console.log('[kaprodiService] Revision requested successfully');
      return true;
    } catch (error) {
      console.error('[kaprodiService] Error requesting revision:', error);
      return false;
    }
  },
};
