import { client as apiClient } from '@/lib/api';
import { Lampiran } from '@/types';

export const lampiranService = {
  async uploadLampiran(
    pengajuanId: string,
    file: File
  ): Promise<Lampiran | null> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pengajuanId', pengajuanId);

    try {
      const response = await apiClient.upload<Lampiran>(
        '/lampiran',
        formData
      );
      return response.data || null;
    } catch (error) {
      console.error('Upload lampiran error:', error);
      return null;
    }
  },

  async deleteLampiran(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete(`/lampiran/${id}`);
      return response.success;
    } catch (error) {
      console.error('Delete lampiran error:', error);
      return false;
    }
  },

  async downloadLampiran(url: string, fileName: string): Promise<void> {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download lampiran error:', error);
    }
  },
};
