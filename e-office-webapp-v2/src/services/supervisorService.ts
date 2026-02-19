const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3079';

export interface SupervisorDashboard {
  pengajuan: any[];
  stats: {
    perluTindakan: number;
    selesai: number;
    totalSurat: number;
  };
}

export const supervisorService = {
  /**
   * Get dashboard data for supervisor
   * Shows pengajuan with status REGISTERED (belum ditinjau, waiting for supervisor approval)
   */
  async getDashboard(): Promise<SupervisorDashboard | null> {
    try {
      console.log('[supervisorService] Fetching dashboard from:', `${API_URL}/skl/pengajuan`);
      const response = await fetch(`${API_URL}/skl/pengajuan`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('[supervisorService] Failed to fetch dashboard:', response.status);
        return null;
      }

      const allPengajuan = await response.json();

      // Filter: Supervisor sees REGISTERED, APPROVED_SUPERVISOR, SIAP_CETAK, STEP_KONVENSIONAL, COMPLETED
      // dan REVISI/DITOLAK yang berasal dari supervisor (sudah pernah sampai ke supervisor)
      const pengajuanList = allPengajuan.filter((p: any) => {
        // Status normal yang ditangani supervisor
        if (p.status === 'REGISTERED' ||         // Perlu verifikasi
          p.status === 'APPROVED_SUPERVISOR' || // Sudah terverifikasi = selesai untuk supervisor
          p.status === 'SIAP_CETAK' ||         // Tetap tampil untuk tracking
          p.status === 'STEP_KONVENSIONAL' ||  // Tetap tampil untuk tracking
          p.status === 'COMPLETED') {          // Tetap tampil untuk tracking
          return true;
        }

        // DITOLAK hanya muncul jika surat pernah sampai ke Supervisor
        // (pernah ada status REGISTERED atau APPROVED_SUPERVISOR di riwayat)
        if (p.status === 'DITOLAK' && p.riwayat && p.riwayat.length > 0) {
          const pernahDiSupervisor = p.riwayat.some((r: any) =>
            r.statusBaru === 'REGISTERED' || r.statusBaru === 'APPROVED_SUPERVISOR'
          );
          if (pernahDiSupervisor) return true;
        }

        // Untuk status REVISI, periksa riwayat untuk menentukan apakah revisi dari supervisor
        if (p.status === 'REVISI' && p.riwayat && p.riwayat.length > 0) {
          // Cari riwayat REVISI terakhir
          const revisiRiwayat = p.riwayat.find((r: any) => r.statusBaru === 'REVISI');
          if (revisiRiwayat) {
            // Cari status sebelum REVISI dengan melihat riwayat yang timestamp-nya lebih lama
            const statusSebelumRevisi = p.riwayat.find((r: any) =>
              r.timestamp < revisiRiwayat.timestamp &&
              r.statusBaru !== 'REVISI'
            );

            // Jika status sebelum revisi adalah REGISTERED atau APPROVED_SUPERVISOR, 
            // berarti ini revisi dari supervisor
            if (statusSebelumRevisi &&
              (statusSebelumRevisi.statusBaru === 'REGISTERED' ||
                statusSebelumRevisi.statusBaru === 'APPROVED_SUPERVISOR')) {
              return true;
            }
          }
        }

        return false;
      });

      console.log('[supervisorService] Dashboard data:', pengajuanList);

      // Calculate stats
      // Perlu tindakan: hanya REGISTERED (menunggu verifikasi supervisor)
      const perluTindakan = pengajuanList.filter((p: any) =>
        p.status === 'REGISTERED'
      ).length;

      // Untuk supervisor, "selesai" adalah surat yang sudah diverifikasi (APPROVED_SUPERVISOR dan seterusnya), ditolak, atau perlu revisi
      const selesai = pengajuanList.filter((p: any) =>
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
      console.error('[supervisorService] Error fetching dashboard:', error);
      return null;
    }
  },

  /**
   * Get pengajuan detail
   */
  async getPengajuanDetail(id: string): Promise<any | null> {
    try {
      console.log('[supervisorService] Fetching detail for:', id);
      const response = await fetch(`${API_URL}/skl/pengajuan/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('[supervisorService] Failed to fetch detail:', response.status);
        return null;
      }

      const data = await response.json();
      console.log('[supervisorService] Detail data:', data);
      return data;
    } catch (error) {
      console.error('[supervisorService] Error fetching detail:', error);
      return null;
    }
  },

  /**
   * Approve pengajuan (Supervisor action)
   * REGISTERED -> SIAP_CETAK (langsung ke Staf Fakultas, paralel monitoring oleh Manajer TU)
   */
  async approvePengajuan(id: string, actorId: string, catatan?: string): Promise<boolean> {
    try {
      console.log('[supervisorService] Approving pengajuan:', { id, actorId, catatan });
      const response = await fetch(`${API_URL}/skl/pengajuan/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'SIAP_CETAK',
          actorId,
          catatan: catatan || 'Disetujui oleh Supervisor, siap dicetak oleh Staf Fakultas',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[supervisorService] Approval failed:', response.status, errorText);
        return false;
      }

      console.log('[supervisorService] Approval successful');
      return true;
    } catch (error) {
      console.error('[supervisorService] Error approving pengajuan:', error);
      return false;
    }
  },

  /**
   * Request revision (Supervisor action)
   * REGISTERED -> REVISI (dikembalikan ke mahasiswa untuk revisi)
   */
  async requestRevision(id: string, actorId: string, catatan: string): Promise<boolean> {
    try {
      console.log('[supervisorService] Requesting revision:', { id, actorId, catatan });
      const response = await fetch(`${API_URL}/skl/pengajuan/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'REVISI',
          actorId,
          catatan: `Revisi dari Supervisor: ${catatan}`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[supervisorService] Revision request failed:', response.status, errorText);
        return false;
      }

      console.log('[supervisorService] Revision request successful');
      return true;
    } catch (error) {
      console.error('[supervisorService] Error requesting revision:', error);
      return false;
    }
  },

  /**
   * Reject pengajuan (Supervisor action)
   * REGISTERED -> DITOLAK
   */
  async rejectPengajuan(id: string, actorId: string, catatan: string): Promise<boolean> {
    try {
      console.log('[supervisorService] Rejecting pengajuan:', { id, actorId, catatan });
      const response = await fetch(`${API_URL}/skl/pengajuan/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'DITOLAK',
          actorId,
          catatan: `Ditolak oleh Supervisor: ${catatan}`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[supervisorService] Rejection failed:', response.status, errorText);
        return false;
      }

      console.log('[supervisorService] Rejection successful');
      return true;
    } catch (error) {
      console.error('[supervisorService] Error rejecting pengajuan:', error);
      return false;
    }
  },
};
