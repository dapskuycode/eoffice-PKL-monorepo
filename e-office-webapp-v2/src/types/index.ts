// User Types
export type UserRole = 'mahasiswa' | 'admin_prodi' | 'ketua_prodi' | 'admin_fakultas' | 'supervisor';

export interface User {
  id: string;
  email: string;
  nama: string;
  role: UserRole;
  prodiId?: string;
  fakultasId?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Pengajuan Types
export type PengajuanStatus =
  | 'draft'
  | 'submitted'
  | 'verifikasi_prodi'
  | 'persetujuan_ketua'
  | 'final_fakultas'
  | 'selesai'
  | 'rejected'
  | 'revisi_diminta'
  | 'DRAFT'
  | 'SUBMITTED'
  | 'VERIFIED_ADMIN'
  | 'APPROVED_KAPRODI'
  | 'REGISTERED'
  | 'SIAP_CETAK'
  | 'COMPLETED'
  | 'DITOLAK'
  | 'REVISI'
  | 'REVISION';

export type PengajuanType = 'skl' | 'pkl';

export interface Mahasiswa {
  id: string;
  nim: string;
  nama: string;
  tahunMasuk: string;
  noHp: string;
  emailKampus?: string;
  alamat?: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  prodi?: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  departemen?: {
    id: number;
    name: string;
    code: string;
  };
  programStudi?: {
    id: number;
    name: string;
    code: string;
  };
}

// Detail SKL - relational model
export interface DetailSKL {
  id: string;
  pengajuanId: string;
  jenisSurat: string;
  tanggalLulus: string;
  ipk: number | string;
  noIjazah?: string;
  createdAt: string;
  updatedAt: string;
}

// Lampiran - relational model
export interface LampiranPengajuan {
  id: string;
  pengajuanId: string;
  namaFile: string;
  tipeFile: string;
  ukuranFile: number;
  dataUrl?: string;
  filePath?: string;
  kategori?: string;
  createdAt: string;
}

export interface Pengajuan {
  id: string;
  mahasiswaId: string;
  tipeAjuan: PengajuanType;
  status: PengajuanStatus;
  signature?: string; // Base64 signature
  tandatangan?: string; // Alias untuk signature
  catatan?: string; // Catatan revisi dari admin/supervisor

  // Relations
  mahasiswa?: Mahasiswa;
  detailSKL?: DetailSKL;
  lampiranList?: LampiranPengajuan[];
  approvalLogs?: ApprovalLog[];

  createdAt: string;
  updatedAt: string;
}

// Lampiran Types
export interface Lampiran {
  id: string;
  pengajuanId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

// Approval Log Types
export type ApprovalAction = 'verify' | 'approve' | 'reject' | 'request_revision' | 'submit' | 'create' | 'complete' | 'revise' | 'update';

export interface ApprovalLog {
  id: string;
  pengajuanId: string;
  approverId: string;
  action: ApprovalAction;
  note?: string;
  createdAt: string;
}

// Pagination
export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: PengajuanStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
