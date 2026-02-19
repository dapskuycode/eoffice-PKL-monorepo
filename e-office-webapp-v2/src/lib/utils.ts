import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Status utilities
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    draft: 'default',
    submitted: 'processing',
    approved_prodi: 'processing',
    approved_fakultas: 'success',
    rejected: 'error',
  };
  return statusColors[status] || 'default';
}

export function getStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Diajukan',
    approved_prodi: 'Disetujui Prodi',
    approved_fakultas: 'Disetujui Fakultas',
    rejected: 'Ditolak',
  };
  return statusLabels[status] || status;
}

// Date formatting
export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
