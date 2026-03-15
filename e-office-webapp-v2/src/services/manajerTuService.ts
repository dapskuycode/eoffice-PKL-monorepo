const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const manajerTuService = {
  async getDashboard() {
    try {
      console.log('[manajerTuService] Fetching dashboard from:', `${API_URL}/skl/pengajuan`);
      const response = await fetch(`${API_URL}/skl/pengajuan`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('[manajerTuService] Failed to fetch:', response.status);
        throw new Error('Failed to fetch pengajuan');
      }

      const allPengajuan = await response.json();

      // Filter: Manajer TU processes APPROVED_SUPERVISOR -> SIAP_CETAK dan monitors selanjutnya
      const pengajuanList = allPengajuan.filter((p: any) => {
        // Status normal yang ditangani manajer TU
        if (p.status === 'APPROVED_SUPERVISOR' || // Perlu dikirim ke Staf
          p.status === 'SIAP_CETAK' ||        // Monitoring cetak
          p.status === 'STEP_KONVENSIONAL' || // Monitoring konvensional
          p.status === 'COMPLETED') {         // Monitoring selesai
          return true;
        }

        // DITOLAK: Special case untuk Manajer TU
        // Manajer TU lihat DITOLAK jika:
        // 1. Surat pernah sampai ke Manajer TU (ada APPROVED_SUPERVISOR atau SIAP_CETAK)
        // 2. ATAU ditolak oleh Supervisor (ada APPROVED_SUPERVISOR di riwayat, meskipun belum sampai ke Manajer TU)
        if (p.status === 'DITOLAK' && p.riwayat && p.riwayat.length > 0) {
          const pernahApprovedSupervisor = p.riwayat.some((r: any) =>
            r.statusBaru === 'APPROVED_SUPERVISOR'
          );
          // Jika pernah APPROVED_SUPERVISOR, berarti supervisor pernah handle
          // Maka Manajer TU harus bisa lihat (baik ditolak oleh supervisor atau role selanjutnya)
          if (pernahApprovedSupervisor) return true;

          // Atau jika sudah sampai ke tahap SIAP_CETAK
          const pernahSiapCetak = p.riwayat.some((r: any) => r.statusBaru === 'SIAP_CETAK');
          if (pernahSiapCetak) return true;
        }

        return false;
      });

      console.log('[manajerTuService] Dashboard data:', pengajuanList);

      // Calculate stats
      const perluTindakan = allPengajuan.filter((p: any) => p.status === 'APPROVED_SUPERVISOR');

      return {
        pengajuan: pengajuanList,
        perluTindakan: perluTindakan.length,
      };
    } catch (error) {
      console.error('[manajerTuService] Error fetching dashboard:', error);
      throw error;
    }
  },

  async getPengajuanDetail(id: string) {
    try {
      console.log('[manajerTuService] Fetching detail for:', id);
      const response = await fetch(`${API_URL}/skl/pengajuan/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('[manajerTuService] Failed to fetch detail:', response.status);
        throw new Error('Failed to fetch pengajuan detail');
      }

      const data = await response.json();
      console.log('[manajerTuService] Detail data:', data);
      return data;
    } catch (error) {
      console.error('[manajerTuService] Error fetching detail:', error);
      throw error;
    }
  },

  async kirimKeStaf(id: string, actorId: string, catatan?: string) {
    try {
      console.log('[manajerTuService] Sending to Staf Fakultas:', id);
      const response = await fetch(`${API_URL}/skl/pengajuan/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'SIAP_CETAK',
          actorId,
          catatan: catatan || 'Dikirim ke Staf Fakultas untuk pencetakan',
        }),
      });

      if (!response.ok) {
        console.error('[manajerTuService] Failed to send:', response.status);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[manajerTuService] Error sending to staff:', error);
      return false;
    }
  },

};
