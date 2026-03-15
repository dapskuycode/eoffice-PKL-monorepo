const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const adminFakultasService = {
  /**
   * Get dashboard data for Admin Fakultas
   */
  async getDashboard() {
    try {
      const response = await fetch(`${API_URL}/skl/pengajuan`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch dashboard data:', response.status);
        return null;
      }

      const allPengajuan = await response.json();

      console.log('[adminFakultasService] Total pengajuan from API:', allPengajuan.length);
      console.log('[adminFakultasService] All statuses:', allPengajuan.map((p: any) => ({ id: p.id.substring(0, 8), status: p.status })));

      // Filter: Admin Fakultas sees REGISTERING dan REGISTERED serta status seterusnya (tetap tampil)
      const pengajuanList = allPengajuan.filter((p: any) => {
        // Status normal yang ditangani admin fakultas
        if (p.status === 'REGISTERING' ||      // Perlu tindakan registrasi
          p.status === 'REGISTERED' ||       // Sudah diregister = selesai untuk admin fakultas
          p.status === 'APPROVED_SUPERVISOR' || // Tracking
          p.status === 'SIAP_CETAK' ||       // Tetap tampil untuk tracking
          p.status === 'STEP_KONVENSIONAL' || // Tetap tampil untuk tracking
          p.status === 'COMPLETED') {        // Tetap tampil untuk tracking
          return true;
        }

        // DITOLAK hanya muncul jika surat pernah sampai ke Admin Fakultas
        // (pernah ada status REGISTERING atau REGISTERED di riwayat)
        if (p.status === 'DITOLAK' && p.riwayat && p.riwayat.length > 0) {
          const pernahDiAdminFakultas = p.riwayat.some((r: any) =>
            r.statusBaru === 'REGISTERING' || r.statusBaru === 'REGISTERED'
          );
          if (pernahDiAdminFakultas) return true;
        }

        return false;
      });

      console.log('[adminFakultasService] Filtered pengajuan:', pengajuanList.length);
      console.log('[adminFakultasService] Filtered statuses:', pengajuanList.map((p: any) => ({ id: p.id.substring(0, 8), status: p.status })));

      return {
        pengajuan: pengajuanList || [],
      };
    } catch (error) {
      console.error('Error fetching admin fakultas dashboard:', error);
      return null;
    }
  },

  /**
   * Get detail of a specific pengajuan
   */
  async getPengajuanDetail(id: string) {
    try {
      const response = await fetch(`${API_URL}/skl/pengajuan/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch pengajuan detail:', response.status);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching pengajuan detail:', error);
      return null;
    }
  },

  /**
   * Register/Approve pengajuan (Admin Fakultas action)
   * REGISTERING -> REGISTERED (Admin Fakultas melakukan registrasi)
   */
  async registerPengajuan(id: string, actorId: string, catatan?: string): Promise<boolean> {
    try {
      console.log('=== Calling registerPengajuan API (Admin Fakultas) ===');
      console.log('URL:', `${API_URL}/skl/pengajuan/${id}/status`);
      console.log('Payload:', {
        status: 'REGISTERED',
        actorId,
        catatan: catatan || 'Surat telah diregistrasi oleh Admin Fakultas, siap untuk ditinjau Supervisor',
      });

      const response = await fetch(`${API_URL}/skl/pengajuan/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'REGISTERED',
          actorId,
          catatan: catatan || 'Surat telah diregistrasi oleh Admin Fakultas, siap untuk ditinjau Supervisor',
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        alert(`Backend error: ${errorText}`);
      }

      return response.ok;
    } catch (error) {
      console.error('Error registering pengajuan:', error);
      return false;
    }
  },

  /**
   * Request revision for a pengajuan (Admin Fakultas action)
   */
  async requestRevision(id: string, actorId: string, catatan: string): Promise<boolean> {
    try {
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

      return response.ok;
    } catch (error) {
      console.error('Error requesting revision:', error);
      return false;
    }
  },

  /**
   * Reject a pengajuan (Admin Fakultas action)
   */
  async rejectPengajuan(id: string, actorId: string, catatan: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/skl/pengajuan/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'DITOLAK',
          actorId,
          catatan,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error rejecting pengajuan:', error);
      return false;
    }
  },
};
