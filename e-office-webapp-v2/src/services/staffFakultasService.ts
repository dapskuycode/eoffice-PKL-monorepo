const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const staffFakultasService = {
  async getDashboard() {
    try {
      console.log('[staffFakultasService] Fetching dashboard from:', `${API_URL}/skl/pengajuan`);
      const response = await fetch(`${API_URL}/skl/pengajuan`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('[staffFakultasService] Failed to fetch:', response.status);
        throw new Error('Failed to fetch pengajuan');
      }

      const allPengajuan = await response.json();

      // Filter: Staf Fakultas sees SIAP_CETAK, STEP_KONVENSIONAL, dan COMPLETED
      const pengajuanList = allPengajuan.filter((p: any) => {
        // Status normal yang ditangani staf fakultas
        if (p.status === 'SIAP_CETAK' ||        // Perlu cetak
          p.status === 'STEP_KONVENSIONAL' || // Sudah dicetak = selesai untuk staf fakultas
          p.status === 'COMPLETED') {         // Tetap tampil untuk tracking
          return true;
        }

        // DITOLAK hanya muncul jika surat pernah sampai ke Staf Fakultas
        // (pernah ada status SIAP_CETAK atau STEP_KONVENSIONAL di riwayat)
        if (p.status === 'DITOLAK' && p.riwayat && p.riwayat.length > 0) {
          const pernahDiStafFakultas = p.riwayat.some((r: any) =>
            r.statusBaru === 'SIAP_CETAK' || r.statusBaru === 'STEP_KONVENSIONAL'
          );
          if (pernahDiStafFakultas) return true;
        }

        return false;
      });

      console.log('[staffFakultasService] Dashboard data:', pengajuanList);

      // Calculate stats
      const perluTindakan = allPengajuan.filter((p: any) => p.status === 'SIAP_CETAK');

      return {
        pengajuan: pengajuanList,
        perluTindakan: perluTindakan.length,
      };
    } catch (error) {
      console.error('[staffFakultasService] Error fetching dashboard:', error);
      throw error;
    }
  },

  async getPengajuanDetail(id: string) {
    try {
      console.log('[staffFakultasService] Fetching detail for:', id);
      const response = await fetch(`${API_URL}/skl/pengajuan/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('[staffFakultasService] Failed to fetch detail:', response.status);
        throw new Error('Failed to fetch pengajuan detail');
      }

      const data = await response.json();
      console.log('[staffFakultasService] Detail data:', data);
      return data;
    } catch (error) {
      console.error('[staffFakultasService] Error fetching detail:', error);
      throw error;
    }
  },

  async cetakDanKirimKeUPA(id: string, actorId: string, catatan?: string) {
    try {
      console.log('[staffFakultasService] Cetak dan kirim ke UPA:', { id, actorId, catatan });
      const response = await fetch(`${API_URL}/skl/pengajuan/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'STEP_KONVENSIONAL',
          actorId,
          catatan: catatan || 'Surat telah dicetak oleh Staf Fakultas dan dikirim ke UPA',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[staffFakultasService] Failed to update status:', response.status, errorText);
        throw new Error('Failed to update status');
      }

      console.log('[staffFakultasService] Status updated successfully');
      return true;
    } catch (error) {
      console.error('[staffFakultasService] Error updating status:', error);
      return false;
    }
  },
};
