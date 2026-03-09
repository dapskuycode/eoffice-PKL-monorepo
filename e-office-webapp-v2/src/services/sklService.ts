const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper to get auth headers including Bearer token
function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export interface CreateSklPengajuanData {
  mahasiswaId: string;
  tglLulus: string;
  ipkTerakhir: number;
  jumlahSks?: number;
  // Optional temporary identity data
  namaSementara?: string;
  nimSementara?: string;
  emailSementara?: string;
  prodiSementara?: string;
  departemenSementara?: string;
  noHpSementara?: string;
  alamatSementara?: string;
  tempatLahirSementara?: string;
  tanggalLahirSementara?: string;
  tandatangan?: string;
}

export interface UpdateSklPengajuanData {
  tglLulus?: string;
  ipkTerakhir?: number;
  jumlahSks?: number;
  namaSementara?: string;
  nimSementara?: string;
  emailSementara?: string;
  prodiSementara?: string;
  departemenSementara?: string;
  noHpSementara?: string;
  alamatSementara?: string;
  tempatLahirSementara?: string;
  tanggalLahirSementara?: string;
  tandatangan?: string;
  // Note: status harus diubah melalui endpoint /status terpisah, bukan di sini
}

export interface SaveDraftData {
  id?: string; // Jika ada, berarti update draft yang sudah ada
  mahasiswaId: string;
  // Data diri (temporary)
  namaSementara?: string;
  nimSementara?: string;
  emailSementara?: string;
  prodiSementara?: string;
  departemenSementara?: string;
  noHpSementara?: string;
  alamatSementara?: string;
  tempatLahirSementara?: string;
  tanggalLahirSementara?: string;
  // Detail pengajuan (optional untuk draft)
  tglLulus?: string;
  ipkTerakhir?: number;
  jumlahSks?: number;
  // Draft step indicator
  draftStep?: number; // 1=dataDiri, 2=detail, 3=lampiran, 4=review
  createLog?: boolean; // Flag to create history entry
}

export interface SklPengajuan {
  id: string;
  mahasiswaId: string;
  tglLulus: Date;
  ipkTerakhir: number;
  jumlahSks?: number;
  status: string;
  nomorSkl?: string;
  nomorSuratPengantar?: string;
  // Temporary identity fields (tidak mengubah master mahasiswa)
  namaSementara?: string;
  nimSementara?: string;
  emailSementara?: string;
  prodiSementara?: string;
  departemenSementara?: string;
  noHpSementara?: string;
  alamatSementara?: string;
  tempatLahirSementara?: string;
  tanggalLahirSementara?: string;
  tandatangan?: string;
  ttdKetuaProdi?: string;
  createdAt: Date;
  updatedAt: Date;
  mahasiswa?: any;
  lampiran?: any[];
  riwayat?: any[];
}

export interface UpdateStatusData {
  status: string;
  actorId: string;
  catatan?: string;
  nomorSuratPengantar?: string;
  adminProdiId?: string;
  nomorSkl?: string;
  pegawaiUpaId?: string;
}

export interface LampiranData {
  jenisDokumen: 'KTM' | 'TRANSKRIP_NILAI' | 'BERITA_ACARA_UJIAN' | 'BEBAS_PUSTAKA' | 'PAS_FOTO' | 'BUKTI_SUBMIT' | 'LAINNYA';
  pathFile: string;
}

export const sklService = {
  /**
   * Get all SKL pengajuan
   */
  async getPengajuanList(): Promise<SklPengajuan[]> {
    try {
      const response = await fetch(`${API_URL}/skl/pengajuan`, {
        method: 'GET',
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        console.error('Failed to fetch pengajuan list:', response.status);
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching SKL pengajuan list:', error);
      return [];
    }
  },

  /**
   * Get single SKL pengajuan detail
   */
  async getPengajuanDetail(id: string): Promise<SklPengajuan | null> {
    try {
      const response = await fetch(`${API_URL}/skl/pengajuan/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errBody = await response.text();
        console.error('Failed to fetch pengajuan detail:', response.status, errBody);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching SKL pengajuan detail:', error);
      return null;
    }
  },

  /**
   * Save draft pengajuan to database
   */
  async saveDraft(data: SaveDraftData): Promise<SklPengajuan | null> {
    try {
      const url = data.id
        ? `${API_URL}/skl/pengajuan/${data.id}`
        : `${API_URL}/skl/pengajuan/draft`;
      const method = data.id ? 'PATCH' : 'POST';

      console.log('Saving draft:', { url, method, data });

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to save draft:', response.status, errorText);
        throw new Error(`Gagal menyimpan draft: ${response.status}`);
      }

      const result = await response.json();
      console.log('Draft saved successfully:', result);
      return result;
    } catch (error) {
      console.error('Error saving draft:', error);
      throw error;
    }
  },

  /**
   * Delete draft pengajuan
   */
  async deleteDraft(id: string): Promise<boolean> {
    try {
      console.log('Deleting draft:', id);
      const response = await fetch(`${API_URL}/skl/pengajuan/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to delete draft:', response.status, errorText);
        throw new Error('Gagal menghapus draft');
      }

      console.log('Draft deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting draft:', error);
      throw error;
    }
  },

  /**   * Create new SKL pengajuan
   */
  async createPengajuan(data: CreateSklPengajuanData): Promise<SklPengajuan | null> {
    try {
      const response = await fetch(`${API_URL}/skl/pengajuan`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to create pengajuan:', response.status, errorText);
        throw new Error('Gagal membuat pengajuan SKL');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating SKL pengajuan:', error);
      throw error;
    }
  },

  /**
   * Update existing SKL pengajuan (for revision/edit)
   */
  async updatePengajuan(id: string, data: UpdateSklPengajuanData): Promise<SklPengajuan | null> {
    try {
      const response = await fetch(`${API_URL}/skl/pengajuan/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to update pengajuan:', response.status, errorText);
        throw new Error('Gagal memperbarui pengajuan SKL');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating SKL pengajuan:', error);
      throw error;
    }
  },

  /**
   * Update SKL pengajuan status
   */
  async updateStatus(id: string, data: UpdateStatusData): Promise<SklPengajuan | null> {
    try {
      const response = await fetch(`${API_URL}/skl/pengajuan/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to update status:', response.status, errorText);
        throw new Error('Gagal memperbarui status pengajuan');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating SKL status:', error);
      throw error;
    }
  },

  /**
   * Get riwayat (history) of pengajuan
   */
  async getRiwayat(id: string): Promise<any[]> {
    try {
      const response = await fetch(`${API_URL}/skl/pengajuan/${id}/riwayat`, {
        method: 'GET',
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        console.error('Failed to fetch riwayat:', response.status);
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching riwayat:', error);
      return [];
    }
  },

  /**
   * Add lampiran to pengajuan
   */
  async addLampiran(pengajuanId: string, data: LampiranData): Promise<any | null> {
    try {
      const response = await fetch(`${API_URL}/skl/pengajuan/${pengajuanId}/lampiran`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to add lampiran:', response.status, errorText);
        throw new Error('Gagal menambah lampiran');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding lampiran:', error);
      throw error;
    }
  },

  /**
   * Delete lampiran from pengajuan by category
   */
  async deleteLampiranByCategory(pengajuanId: string, jenis: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/skl/pengajuan/${pengajuanId}/lampiran/${jenis}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        console.error('Failed to delete lampiran:', response.status);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting lampiran:', error);
      return false;
    }
  },

  /**
   * Submit pengajuan (change status from DRAFT to SUBMITTED)
   */
  async submitPengajuan(id: string, actorId: string): Promise<SklPengajuan | null> {
    return this.updateStatus(id, {
      status: 'SUBMITTED',
      actorId,
      catatan: 'Pengajuan diajukan oleh mahasiswa',
    });
  },
};
