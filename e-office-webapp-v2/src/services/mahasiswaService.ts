const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface MahasiswaProfile {
  id: string;
  nim: string;
  nama: string;
  email: string;
  tahunMasuk: string;
  noHp: string;
  alamat: string | null;
  tempatLahir: string | null;
  tanggalLahir: Date | string | null;
  programStudi: string;
  departemen: string;
  userId: string;
}

export interface MahasiswaDashboard {
  nama: string;
  statistics: {
    totalPengajuan: number;
    menunggu: number;
    selesai: number;
    revisi: number;
    ditolak: number;
  };
  latestPengajuan: any | null;
  allPengajuan: any[];
}

export interface UpdateProfileData {
  nama?: string;
  email?: string;
  noHp?: string;
  tahunMasuk?: string;
  alamat?: string;
  tempatLahir?: string;
  tanggalLahir?: string;
}

export const mahasiswaService = {
  /**
   * Get mahasiswa profile data (client-side)
   */
  async getProfile(): Promise<MahasiswaProfile | null> {
    try {
      const response = await fetch(`${API_URL}/mahasiswa/dashboard/profile`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch profile:', response.status);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching mahasiswa profile:', error);
      return null;
    }
  },

  /**
   * Get mahasiswa dashboard data (client-side)
   */
  async getDashboard(): Promise<MahasiswaDashboard | null> {
    try {
      const response = await fetch(`${API_URL}/mahasiswa/dashboard`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch dashboard:', response.status);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching mahasiswa dashboard:', error);
      return null;
    }
  },

  /**
   * Update mahasiswa profile (client-side)
   */
  async updateProfile(data: UpdateProfileData): Promise<MahasiswaProfile | null> {
    try {
      const response = await fetch(`${API_URL}/mahasiswa/dashboard/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to update profile:', response.status, errorText);
        throw new Error('Gagal memperbarui profil');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating mahasiswa profile:', error);
      throw error;
    }
  },
};
