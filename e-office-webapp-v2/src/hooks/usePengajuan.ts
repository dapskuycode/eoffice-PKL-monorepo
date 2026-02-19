'use client';

import { useCallback, useState } from 'react';
import { message } from 'antd';
import { client as apiClient } from '@/lib/api';
import { Pengajuan, PaginationQuery, PaginatedResponse } from '@/types';

export const usePengajuan = () => {
  const [loading, setLoading] = useState(false);

  const getPengajuanList = useCallback(
    async (query?: PaginationQuery): Promise<PaginatedResponse<Pengajuan> | null> => {
      try {
        setLoading(true);
        
        // Use Eden Treaty syntax
        const response = await apiClient.pengajuan.get({
          query: {
            page: query?.page,
            limit: query?.limit,
            status: query?.status,
            search: query?.search,
            sortBy: query?.sortBy,
            sortOrder: query?.sortOrder
          }
        });
        
        if (response.data) {
          return response.data as PaginatedResponse<Pengajuan>;
        }
        return null;
      } catch (error: any) {
        console.error('getPengajuanList error:', error);
        message.error('Gagal mengambil data');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getPengajuanDetail = useCallback(
    async (id: string): Promise<Pengajuan | null> => {
      try {
        setLoading(true);
        const response = await apiClient.pengajuan({ id }).get();
        
        if (response.data) {
          return response.data as Pengajuan;
        }
        return null;
      } catch (error: any) {
        console.error('getPengajuanDetail error:', error);
        message.error('Gagal mengambil detail');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createPengajuan = useCallback(
    async (data: Partial<Pengajuan>): Promise<Pengajuan | null> => {
      try {
        setLoading(true);
        const response = await apiClient.pengajuan.post(data);
        
        if (response.data) {
          message.success('Pengajuan berhasil dibuat');
          return response.data as Pengajuan;
        }
        return null;
      } catch (error: any) {
        console.error('createPengajuan error:', error);
        message.error('Gagal membuat pengajuan');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updatePengajuan = useCallback(
    async (id: string, data: Partial<Pengajuan>): Promise<Pengajuan | null> => {
      try {
        setLoading(true);
        const response = await apiClient.pengajuan({ id }).patch(data);
        
        if (response.data) {
          message.success('Pengajuan berhasil diperbarui');
          return response.data as Pengajuan;
        }
        return null;
      } catch (error: any) {
        console.error('updatePengajuan error:', error);
        message.error('Gagal memperbarui pengajuan');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const submitPengajuan = useCallback(
    async (id: string, message_text?: string): Promise<boolean> => {
      try {
        setLoading(true);
        const response = await apiClient.pengajuan({ id }).submit.post({
          message: message_text
        });
        
        if (response.data) {
          message.success('Pengajuan berhasil diajukan');
          return true;
        }
        return false;
      } catch (error: any) {
        console.error('submitPengajuan error:', error);
        message.error('Gagal mengajukan');
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const approvePengajuan = useCallback(
    async (id: string, note: string, nextApprover?: string): Promise<boolean> => {
      try {
        setLoading(true);
        const response = await apiClient.pengajuan({ id }).approve.post({
          note,
          nextApprover
        });
        
        if (response.data) {
          message.success('Pengajuan berhasil disetujui');
          return true;
        }
        return false;
      } catch (error: any) {
        console.error('approvePengajuan error:', error);
        message.error('Gagal menyetujui');
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const rejectPengajuan = useCallback(
    async (id: string, reason: string): Promise<boolean> => {
      try {
        setLoading(true);
        const response = await apiClient.pengajuan({ id }).reject.post({
          reason
        });
        
        if (response.data) {
          message.success('Pengajuan berhasil ditolak');
          return true;
        }
        return false;
      } catch (error: any) {
        console.error('rejectPengajuan error:', error);
        message.error('Gagal menolak');
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    getPengajuanList,
    getPengajuanDetail,
    createPengajuan,
    updatePengajuan,
    submitPengajuan,
    approvePengajuan,
    rejectPengajuan,
  };
};
