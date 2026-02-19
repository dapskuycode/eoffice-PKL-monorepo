import { client as apiClient } from '@/lib/api';
import { Pengajuan, PaginatedResponse, PaginationQuery } from '@/types';

export const pengajuanService = {
  async getPengajuanList(
    query?: PaginationQuery
  ): Promise<PaginatedResponse<Pengajuan> | null> {
    try {
      const response = await apiClient.pengajuan.get({
        query: {
          page: query?.page?.toString(),
          limit: query?.limit?.toString(),
          status: query?.status
        }
      });
      
      console.log('getPengajuanList response:', response);
      
      if (response.data?.success) {
        return {
          data: response.data.data || [],
          total: response.data.pagination?.total || 0,
          page: response.data.pagination?.page || 1,
          limit: response.data.pagination?.limit || 10,
          totalPages: response.data.pagination?.totalPages || 1
        };
      }
      return null;
    } catch (error) {
      console.error('Get pengajuan list error:', error);
      return null;
    }
  },

  async getPengajuanDetail(id: string): Promise<Pengajuan | null> {
    try {
      console.log('Fetching pengajuan detail for ID:', id);
      const response = await apiClient.pengajuan({ id }).get();
      console.log('getPengajuanDetail response:', response);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data as Pengajuan;
      }
      return null;
    } catch (error) {
      console.error('Get pengajuan detail error:', error);
      return null;
    }
  },

  async createPengajuan(data: Partial<Pengajuan>): Promise<Pengajuan | null> {
    try {
      const response = await apiClient.pengajuan.post(data as any);
      console.log('createPengajuan response:', response);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data as Pengajuan;
      }
      
      console.error('Create pengajuan failed:', response.data?.error || 'Unknown error');
      return null;
    } catch (error) {
      console.error('Create pengajuan error:', error);
      return null;
    }
  },

  async updatePengajuan(
    id: string,
    data: Partial<Pengajuan>
  ): Promise<Pengajuan | null> {
    try {
      const response = await apiClient.pengajuan({ id }).patch(data as any);
      console.log('updatePengajuan response:', response);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data as Pengajuan;
      }
      return null;
    } catch (error) {
      console.error('Update pengajuan error:', error);
      return null;
    }
  },

  async submitPengajuan(
    id: string,
    msg?: string
  ): Promise<Pengajuan | null> {
    try {
      const response = await apiClient.pengajuan({ id }).submit.post({ message: msg } as any);
      console.log('submitPengajuan response:', response);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data as Pengajuan;
      }
      return null;
    } catch (error) {
      console.error('Submit pengajuan error:', error);
      return null;
    }
  },

  async approvePengajuan(
    id: string,
    note: string,
    nextApprover?: string
  ): Promise<Pengajuan | null> {
    try {
      const response = await apiClient.pengajuan({ id }).approve.post({ note, nextApprover } as any);
      console.log('approvePengajuan response:', response);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data as Pengajuan;
      }
      return null;
    } catch (error) {
      console.error('Approve pengajuan error:', error);
      return null;
    }
  },

  async rejectPengajuan(id: string, reason: string): Promise<Pengajuan | null> {
    try {
      const response = await apiClient.pengajuan({ id }).reject.post({ reason } as any);
      console.log('rejectPengajuan response:', response);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data as Pengajuan;
      }
      return null;
    } catch (error) {
      console.error('Reject pengajuan error:', error);
      return null;
    }
  },

  async deletePengajuan(id: string): Promise<boolean> {
    try {
      const response = await apiClient.pengajuan({ id }).delete();
      return response.data?.success || false;
    } catch (error) {
      console.error('Delete pengajuan error:', error);
      return false;
    }
  },

  async getApprovalLogs(pengajuanId: string): Promise<any[]> {
    try {
      console.log('Fetching approval logs for pengajuan ID:', pengajuanId);
      const response = await apiClient.pengajuan({ id: pengajuanId })['approval-logs'].get();
      console.log('getApprovalLogs response:', response);
      
      if (response.data) {
        return Array.isArray(response.data) ? response.data : [];
      }
      
      return [];
    } catch (error) {
      console.error('Get approval logs error:', error);
      return [];
    }
  },
};
