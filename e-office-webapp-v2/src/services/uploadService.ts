const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface UploadResult {
  success: boolean;
  url: string;
  fileName: string;
  originalName: string;
  size: number;
  type: string;
}

export const uploadService = {
  /**
   * Upload a file to MinIO storage
   */
  async uploadFile(file: File, category?: string): Promise<UploadResult | null> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (category) {
        formData.append('category', category);
      }

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to upload file:', response.status, errorText);
        throw new Error('Gagal mengupload file');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  /**
   * Upload multiple files
   */
  async uploadFiles(files: File[], category?: string): Promise<UploadResult[]> {
    const promises = files.map(file => this.uploadFile(file, category));
    return Promise.all(promises);
  },
};
