const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface AdminProdiDashboard {
  pengajuan: any[];
  stats: {
    perluTindakan: number;
    perluNomor: number;
    selesai: number;
    totalSurat: number;
  };
}

export const adminProdiService = {
  /**
   * Get dashboard data for admin-prodi
   */
  async getDashboard(): Promise<AdminProdiDashboard | null> {
    try {
      // Fetch ALL pengajuan (we'll filter on frontend for now)
      const response = await fetch(`${API_URL}/skl/pengajuan`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch admin-prodi dashboard:', response.status);
        return null;
      }

      const allPengajuan = await response.json();
      console.log('[adminProdiService] All pengajuan:', allPengajuan.length);

      // Filter: Admin Prodi sees workflow sampai REGISTERING dan seterusnya (tetap tampil setelah beri nomor)
      const pengajuanList = allPengajuan.filter((p: any) =>
        p.status === 'SUBMITTED' ||        // Perlu verifikasi
        p.status === 'REVISI' ||           // Perlu verifikasi ulang
        p.status === 'DITOLAK' ||          // Ditolak (tetap tampil untuk tracking)
        p.status === 'VERIFIED_ADMIN' ||   // Sudah diverifikasi, ke Kaprodi
        p.status === 'APPROVED_KAPRODI' || // Sudah TTD Kaprodi, perlu nomor
        p.status === 'REGISTERING' ||      // Sudah diberi nomor = selesai untuk admin prodi
        p.status === 'REGISTERED' ||       // Tetap tampil untuk tracking
        p.status === 'SIAP_CETAK' ||       // Tetap tampil untuk tracking
        p.status === 'STEP_KONVENSIONAL' || // Tetap tampil untuk tracking
        p.status === 'COMPLETED' ||        // Tetap tampil untuk tracking
        p.status === 'APPROVED_SUPERVISOR' // Tetap tampil untuk tracking
      );

      console.log('[adminProdiService] Filtered pengajuan:', pengajuanList.length);
      console.log('[adminProdiService] Status breakdown:', {
        SUBMITTED: allPengajuan.filter((p: any) => p.status === 'SUBMITTED').length,
        REVISI: allPengajuan.filter((p: any) => p.status === 'REVISI').length,
        APPROVED_KAPRODI: allPengajuan.filter((p: any) => p.status === 'APPROVED_KAPRODI').length,
        COMPLETED: allPengajuan.filter((p: any) => p.status === 'COMPLETED').length,
      });

      // Calculate stats
      const perluTindakan = pengajuanList.filter((p: any) =>
        p.status === 'SUBMITTED'
      ).length;

      const perluNomor = pengajuanList.filter((p: any) =>
        p.status === 'APPROVED_KAPRODI'
      ).length;

      // Untuk admin prodi, "selesai" adalah surat yang sudah diberi nomor (REGISTERING dan seterusnya), ditolak, atau perlu revisi
      const selesai = pengajuanList.filter((p: any) =>
        p.status === 'REGISTERING' ||
        p.status === 'REGISTERED' ||
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
          perluNomor,
          selesai,
          totalSurat: pengajuanList.length,
        },
      };
    } catch (error) {
      console.error('Error fetching admin-prodi dashboard:', error);
      return null;
    }
  },

  /**
   * Verify/approve pengajuan (Admin Prodi action)
   * Phase 1: SUBMITTED -> VERIFIED_ADMIN (tanpa nomor)
   */
  async verifyPengajuan(id: string, actorId: string, adminProdiId?: string, catatan?: string, nomorSuratPengantar?: string): Promise<boolean> {
    try {
      console.log('=== Calling verifyPengajuan API ===');
      console.log('URL:', `${API_URL}/skl/pengajuan/${id}/status`);
      console.log('Payload:', {
        status: 'VERIFIED_ADMIN',
        actorId,
        ...(adminProdiId && { adminProdiId }),
        catatan: catatan || 'Diverifikasi oleh Admin Prodi',
        ...(nomorSuratPengantar && { nomorSuratPengantar }),
      });

      const response = await fetch(`${API_URL}/skl/pengajuan/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'VERIFIED_ADMIN',
          actorId,
          ...(adminProdiId && { adminProdiId }), // Only send if exists
          catatan: catatan || 'Diverifikasi oleh Admin Prodi',
          ...(nomorSuratPengantar && { nomorSuratPengantar }),
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
      console.error('Error verifying pengajuan:', error);
      return false;
    }
  },

  /**
   * Register pengajuan with nomor surat
   * Phase 2: APPROVED_KAPRODI -> REGISTERING (dengan nomor, menunggu registrasi admin fakultas)
   */
  async registerPengajuan(id: string, actorId: string, catatan?: string, nomorSuratPengantar?: string): Promise<boolean> {
    try {
      console.log('=== Calling registerPengajuan API ===');
      console.log('URL:', `${API_URL}/skl/pengajuan/${id}/status`);
      console.log('Payload:', {
        status: 'REGISTERING',
        actorId,
        catatan: catatan || 'Nomor surat didaftarkan oleh Admin Prodi, menunggu registrasi Admin Fakultas',
        nomorSuratPengantar: nomorSuratPengantar || '',
      });

      const response = await fetch(`${API_URL}/skl/pengajuan/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'REGISTERING',
          actorId,
          catatan: catatan || 'Nomor surat didaftarkan oleh Admin Prodi, menunggu registrasi Admin Fakultas',
          nomorSuratPengantar: nomorSuratPengantar || '',
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
   * Request revision
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
          catatan: `Revisi dari Admin Prodi: ${catatan}`,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error requesting revision:', error);
      return false;
    }
  },

  /**
   * Reject pengajuan
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
          catatan: `Ditolak oleh Admin Prodi: ${catatan}`,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error rejecting pengajuan:', error);
      return false;
    }
  },
};
