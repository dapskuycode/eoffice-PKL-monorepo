/**
 * Mock Database untuk E-Office FSM UNDIP
 * Simulasi database in-memory tanpa backend
 */

// ==================== TYPES ====================
export interface Mahasiswa {
  id_mahasiswa: number;
  userId?: number;
  nim: string;
  nama: string;
  prodi: string;
  fakultas: string;
  email: string;
  status_akademik: string;
  // Field tambahan untuk REQ-MHS-01
  tahunMasuk?: string;
  noHp?: string;
  emailKampus?: string;
  alamat?: string;
  tempatLahir?: string;
  tanggalLahir?: Date;
  departemenId?: number;
  programStudiId?: number;
  ipk?: string;
  tanggalLulus?: Date;
}

export interface Pegawai {
  id_pegawai: number;
  nip: string;
  nama: string;
  role: 'admin_prodi' | 'ketua_prodi' | 'admin_fakultas' | 'supervisor' | 'manajer_tu' | 'staff_fakultas';
  unit: string;
}

export interface Surat {
  id_surat: number;
  id_mahasiswa: number;
  jenis_surat: string;
  nomor_surat: string | null;
  status: 'draft' | 'diajukan' | 'disetujui_admin_prodi' | 'disetujui_kaprodi' | 'disetujui_admin_fakultas' | 'disetujui_supervisor' | 'disetujui_manajer_tu' | 'sudah_diberi_nomor' | 'completed' | 'ditolak' | 'revisi';
  catatan: string | null;
  kaprodi_signature: string | null; // Base64 or data URL dari signature kaprodi
  mahasiswa_signature?: string | null; // Base64 or data URL dari signature mahasiswa
  // Field tambahan untuk REQ-MHS-01
  ipk_pemohon?: string;
  tanggal_lulus_pemohon?: Date;
  // Field untuk REQ-MHS-04 (tracking)
  can_edit?: boolean;
  can_cancel?: boolean;
  instruksi_pengambilan?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SuratProses {
  id_proses: number;
  id_surat: number;
  id_pegawai: number;
  role: string;
  aksi: 'verifikasi' | 'approve' | 'reject' | 'revisi';
  catatan: string | null;
  tanggal_proses: Date;
}

export interface Lampiran {
  id_lampiran: number;
  id_surat: number;
  nama_file: string;
  tipe_file: string;
  path_file: string; // URL.createObjectURL() result
  file_object?: File; // actual File object for preview
  kategori_lampiran?: 'ktm' | 'pas_foto' | 'berita_acara_kelulusan' | 'berita_acara_ujian' | 'transkrip' | 'bukti_submit'; // REQ-MHS-02
  uploaded_at: Date;
}

export interface PenomoranSurat {
  id_penomoran: number;
  id_surat: number;
  id_pegawai: number;
  nomor_surat: string;
  tanggal_penomoran: Date;
}

// ==================== MOCK DATA ====================
export class MockDatabase {
  private static instance: MockDatabase;
  
  // Auto-increment counters
  private nextMahasiswaId = 16;
  private nextPegawaiId = 8;
  private nextSuratId = 39;
  private nextProsesId = 1;
  private nextLampiranId = 1;
  private nextPenomoranId = 1;

  // Tables
  public mahasiswa: Mahasiswa[] = [
    {
      id_mahasiswa: 1,
      userId: 1,
      nim: '24060121130063',
      nama: 'Ahmad Douglas',
      prodi: 'S1 Informatika',
      fakultas: 'Sains dan Matematika',
      email: 'ahmaddouglas@students.undip.ac.id',
      status_akademik: 'Aktif',
      tahunMasuk: '2021',
      noHp: '081234567890',
      emailKampus: 'ahmaddouglas@students.undip.ac.id',
      alamat: 'Semarang, Jl. Prof. Soedarto, SH., Tembalang',
      tempatLahir: 'Semarang',
      tanggalLahir: new Date('2003-08-17'),
      departemenId: 1,
      programStudiId: 1,
      ipk: '3.75',
      tanggalLulus: new Date('2025-01-25')
    },
    {
      id_mahasiswa: 2,
      userId: 2,
      nim: '24060121130064',
      nama: 'Siti Nurhaliza',
      prodi: 'S1 Matematika',
      fakultas: 'Sains dan Matematika',
      email: 'sitinurhaliza@students.undip.ac.id',
      status_akademik: 'Aktif',
      tahunMasuk: '2021',
      noHp: '081234567891',
      emailKampus: 'sitinurhaliza@students.undip.ac.id',
      alamat: 'Semarang, Jl. Pahlawan No. 10',
      tempatLahir: 'Jakarta',
      tanggalLahir: new Date('2003-05-20'),
      departemenId: 1,
      programStudiId: 2
    },
    {
      id_mahasiswa: 3,
      userId: 3,
      nim: '24060121130065',
      nama: 'Budi Prasetyo',
      prodi: 'S1 Fisika',
      fakultas: 'Sains dan Matematika',
      email: 'budiprasetyo@students.undip.ac.id',
      status_akademik: 'Aktif',
      tahunMasuk: '2021',
      noHp: '081229102909',
      emailKampus: 'budiprasetyo@students.undip.ac.id',
      alamat: 'Semarang, Jl. Prof. Soedarto, SH., Tembalang',
      tempatLahir: 'Semarang',
      tanggalLahir: new Date('2003-08-17'),
      departemenId: 1,
      programStudiId: 3
    },
    {
      id_mahasiswa: 4,
      nim: '24060121130066',
      nama: 'Rina Wulandari',
      prodi: 'S1 Kimia',
      fakultas: 'Sains dan Matematika',
      email: 'rinawulandari@students.undip.ac.id',
      status_akademik: 'Aktif'
    },
    {
      id_mahasiswa: 5,
      nim: '24060121130067',
      nama: 'Dimas Ardiansyah',
      prodi: 'S1 Biologi',
      fakultas: 'Sains dan Matematika',
      email: 'dimasardiansyah@students.undip.ac.id',
      status_akademik: 'Aktif'
    },
    {
      id_mahasiswa: 6,
      nim: '24060121130068',
      nama: 'Fitri Handayani',
      prodi: 'S1 Statistika',
      fakultas: 'Sains dan Matematika',
      email: 'fitrihandayani@students.undip.ac.id',
      status_akademik: 'Aktif'
    },
    {
      id_mahasiswa: 7,
      nim: '24060121130069',
      nama: 'Eko Saputra',
      prodi: 'S1 Informatika',
      fakultas: 'Sains dan Matematika',
      email: 'ekosaputra@students.undip.ac.id',
      status_akademik: 'Aktif'
    },
    {
      id_mahasiswa: 8,
      nim: '24060121130070',
      nama: 'Maya Sari',
      prodi: 'S1 Matematika',
      fakultas: 'Sains dan Matematika',
      email: 'mayasari@students.undip.ac.id',
      status_akademik: 'Aktif'
    },
    {
      id_mahasiswa: 9,
      nim: '24060121130071',
      nama: 'Rizki Ramadhan',
      prodi: 'S1 Fisika',
      fakultas: 'Sains dan Matematika',
      email: 'rizkiramadhan@students.undip.ac.id',
      status_akademik: 'Aktif'
    },
    {
      id_mahasiswa: 10,
      nim: '24060121130072',
      nama: 'Dewi Anggraini',
      prodi: 'S1 Kimia',
      fakultas: 'Sains dan Matematika',
      email: 'dewianggraini@students.undip.ac.id',
      status_akademik: 'Aktif'
    },
    {
      id_mahasiswa: 11,
      nim: '24060121130073',
      nama: 'Fajar Nugroho',
      prodi: 'S1 Biologi',
      fakultas: 'Sains dan Matematika',
      email: 'fajarnugroho@students.undip.ac.id',
      status_akademik: 'Aktif'
    },
    {
      id_mahasiswa: 12,
      nim: '24060121130074',
      nama: 'Indah Permata',
      prodi: 'S1 Statistika',
      fakultas: 'Sains dan Matematika',
      email: 'indahpermata@students.undip.ac.id',
      status_akademik: 'Aktif'
    },
    {
      id_mahasiswa: 13,
      nim: '24060121130075',
      nama: 'Hendra Wijaya',
      prodi: 'S1 Informatika',
      fakultas: 'Sains dan Matematika',
      email: 'hendrawijaya@students.undip.ac.id',
      status_akademik: 'Aktif'
    },
    {
      id_mahasiswa: 14,
      nim: '24060121130076',
      nama: 'Putri Maharani',
      prodi: 'S1 Matematika',
      fakultas: 'Sains dan Matematika',
      email: 'putrimaharani@students.undip.ac.id',
      status_akademik: 'Aktif'
    },
    {
      id_mahasiswa: 15,
      nim: '24060121130077',
      nama: 'Agus Setiawan',
      prodi: 'S1 Fisika',
      fakultas: 'Sains dan Matematika',
      email: 'agussetiawan@students.undip.ac.id',
      status_akademik: 'Aktif'
    }
  ];

  public pegawai: Pegawai[] = [
    {
      id_pegawai: 1,
      nip: '199001012015041001',
      nama: 'Dr. Budi Santoso, M.Kom',
      role: 'admin_prodi',
      unit: 'Prodi Informatika'
    },
    {
      id_pegawai: 2,
      nip: '198505102010121001',
      nama: 'Prof. Dr. Ani Wijaya, M.T',
      role: 'ketua_prodi',
      unit: 'Prodi Informatika'
    },
    {
      id_pegawai: 3,
      nip: '197803152005011002',
      nama: 'Drs. Cahyo Prasetyo, M.Si',
      role: 'admin_fakultas',
      unit: 'Fakultas Sains dan Matematika'
    },
    {
      id_pegawai: 4,
      nip: '196912011994031001',
      nama: 'Dr. Dewi Kusuma, S.Si, M.Si',
      role: 'supervisor',
      unit: 'Fakultas Sains dan Matematika'
    },
    {
      id_pegawai: 5,
      nip: '197205101998032001',
      nama: 'Dra. Erna Sari, M.M',
      role: 'manajer_tu',
      unit: 'Tata Usaha Fakultas'
    },
    {
      id_pegawai: 6,
      nip: '198801152010121002',
      nama: 'Fajar Nugroho, S.Sos',
      role: 'staff_fakultas',
      unit: 'Staff Administrasi Fakultas'
    }
  ];

  public surat: Surat[] = [
    // Admin Prodi: 5 surat dengan status "diajukan"
    { id_surat: 1, id_mahasiswa: 1, jenis_surat: 'Surat Keterangan Lulus', nomor_surat: null, status: 'diajukan', catatan: null, created_at: new Date('2026-01-25T08:00:00'), updated_at: new Date('2026-01-25T08:00:00') },
    { id_surat: 2, id_mahasiswa: 3, jenis_surat: 'Surat Keterangan Aktif Kuliah', nomor_surat: null, status: 'diajukan', catatan: null, created_at: new Date('2026-01-25T09:00:00'), updated_at: new Date('2026-01-25T09:00:00') },
    { id_surat: 3, id_mahasiswa: 5, jenis_surat: 'Surat Pengantar PKL', nomor_surat: null, status: 'diajukan', catatan: null, created_at: new Date('2026-01-25T10:00:00'), updated_at: new Date('2026-01-25T10:00:00') },
    { id_surat: 4, id_mahasiswa: 7, jenis_surat: 'Surat Rekomendasi Beasiswa', nomor_surat: null, status: 'diajukan', catatan: null, created_at: new Date('2026-01-26T08:00:00'), updated_at: new Date('2026-01-26T08:00:00') },
    { id_surat: 5, id_mahasiswa: 9, jenis_surat: 'Surat Keterangan Bebas Pustaka', nomor_surat: null, status: 'diajukan', catatan: null, created_at: new Date('2026-01-26T09:00:00'), updated_at: new Date('2026-01-26T09:00:00') },
    
    // Ketua Prodi: 7 surat dengan status "disetujui_admin_prodi"
    { id_surat: 6, id_mahasiswa: 2, jenis_surat: 'Surat Izin Penelitian', nomor_surat: null, status: 'disetujui_admin_prodi', catatan: null, created_at: new Date('2026-01-24T08:00:00'), updated_at: new Date('2026-01-26T10:00:00') },
    { id_surat: 7, id_mahasiswa: 4, jenis_surat: 'Surat Keterangan Pindah Prodi', nomor_surat: null, status: 'disetujui_admin_prodi', catatan: null, created_at: new Date('2026-01-24T09:00:00'), updated_at: new Date('2026-01-26T11:00:00') },
    { id_surat: 8, id_mahasiswa: 6, jenis_surat: 'Surat Keterangan Cuti Akademik', nomor_surat: null, status: 'disetujui_admin_prodi', catatan: null, created_at: new Date('2026-01-24T10:00:00'), updated_at: new Date('2026-01-26T12:00:00') },
    { id_surat: 9, id_mahasiswa: 8, jenis_surat: 'Surat Pengantar Magang', nomor_surat: null, status: 'disetujui_admin_prodi', catatan: null, created_at: new Date('2026-01-24T11:00:00'), updated_at: new Date('2026-01-26T13:00:00') },
    { id_surat: 10, id_mahasiswa: 10, jenis_surat: 'Surat Keterangan Mahasiswa Aktif', nomor_surat: null, status: 'disetujui_admin_prodi', catatan: null, created_at: new Date('2026-01-25T08:00:00'), updated_at: new Date('2026-01-27T08:00:00') },
    { id_surat: 11, id_mahasiswa: 11, jenis_surat: 'Surat Rekomendasi Lomba', nomor_surat: null, status: 'disetujui_admin_prodi', catatan: null, created_at: new Date('2026-01-25T09:00:00'), updated_at: new Date('2026-01-27T09:00:00') },
    { id_surat: 12, id_mahasiswa: 13, jenis_surat: 'Surat Keterangan Kelakuan Baik', nomor_surat: null, status: 'disetujui_admin_prodi', catatan: null, created_at: new Date('2026-01-25T10:00:00'), updated_at: new Date('2026-01-27T10:00:00') },
    
    // Admin Fakultas: 4 surat dengan status "disetujui_kaprodi"
    { id_surat: 13, id_mahasiswa: 1, jenis_surat: 'Surat Pengantar Skripsi', nomor_surat: null, status: 'disetujui_kaprodi', catatan: null, created_at: new Date('2026-01-23T08:00:00'), updated_at: new Date('2026-01-27T11:00:00') },
    { id_surat: 14, id_mahasiswa: 12, jenis_surat: 'Surat Izin Seminar Proposal', nomor_surat: null, status: 'disetujui_kaprodi', catatan: null, created_at: new Date('2026-01-23T09:00:00'), updated_at: new Date('2026-01-27T12:00:00') },
    { id_surat: 15, id_mahasiswa: 14, jenis_surat: 'Surat Keterangan Lulus', nomor_surat: null, status: 'disetujui_kaprodi', catatan: null, created_at: new Date('2026-01-23T10:00:00'), updated_at: new Date('2026-01-27T13:00:00') },
    { id_surat: 16, id_mahasiswa: 15, jenis_surat: 'Surat Rekomendasi Program Pertukaran', nomor_surat: null, status: 'disetujui_kaprodi', catatan: null, created_at: new Date('2026-01-23T11:00:00'), updated_at: new Date('2026-01-27T14:00:00') },
    
    // Supervisor: 6 surat dengan status "disetujui_admin_fakultas"
    { id_surat: 17, id_mahasiswa: 3, jenis_surat: 'Surat Pengantar Penelitian Lapangan', nomor_surat: null, status: 'disetujui_admin_fakultas', catatan: null, created_at: new Date('2026-01-22T08:00:00'), updated_at: new Date('2026-01-28T08:00:00') },
    { id_surat: 18, id_mahasiswa: 5, jenis_surat: 'Surat Keterangan Prestasi', nomor_surat: null, status: 'disetujui_admin_fakultas', catatan: null, created_at: new Date('2026-01-22T09:00:00'), updated_at: new Date('2026-01-28T09:00:00') },
    { id_surat: 19, id_mahasiswa: 7, jenis_surat: 'Surat Rekomendasi Beasiswa S2', nomor_surat: null, status: 'disetujui_admin_fakultas', catatan: null, created_at: new Date('2026-01-22T10:00:00'), updated_at: new Date('2026-01-28T10:00:00') },
    { id_surat: 20, id_mahasiswa: 9, jenis_surat: 'Surat Izin Observasi', nomor_surat: null, status: 'disetujui_admin_fakultas', catatan: null, created_at: new Date('2026-01-22T11:00:00'), updated_at: new Date('2026-01-28T11:00:00') },
    { id_surat: 21, id_mahasiswa: 11, jenis_surat: 'Surat Keterangan MBKM', nomor_surat: null, status: 'disetujui_admin_fakultas', catatan: null, created_at: new Date('2026-01-22T12:00:00'), updated_at: new Date('2026-01-28T12:00:00') },
    { id_surat: 22, id_mahasiswa: 13, jenis_surat: 'Surat Pengantar Studi Banding', nomor_surat: null, status: 'disetujui_admin_fakultas', catatan: null, created_at: new Date('2026-01-22T13:00:00'), updated_at: new Date('2026-01-28T13:00:00') },
    
    // Manajer TU: 3 surat dengan status "disetujui_supervisor"
    { id_surat: 23, id_mahasiswa: 2, jenis_surat: 'Surat Keterangan Pindah Kampus', nomor_surat: null, status: 'disetujui_supervisor', catatan: null, created_at: new Date('2026-01-21T08:00:00'), updated_at: new Date('2026-01-29T08:00:00') },
    { id_surat: 24, id_mahasiswa: 6, jenis_surat: 'Surat Keterangan Aktif Organisasi', nomor_surat: null, status: 'disetujui_supervisor', catatan: null, created_at: new Date('2026-01-21T09:00:00'), updated_at: new Date('2026-01-29T09:00:00') },
    { id_surat: 25, id_mahasiswa: 10, jenis_surat: 'Surat Rekomendasi Magang Internasional', nomor_surat: null, status: 'disetujui_supervisor', catatan: null, created_at: new Date('2026-01-21T10:00:00'), updated_at: new Date('2026-01-29T10:00:00') },
    
    // Staff Fakultas: 5 surat dengan status "disetujui_manajer_tu"
    { id_surat: 26, id_mahasiswa: 4, jenis_surat: 'Surat Keterangan Wisuda', nomor_surat: null, status: 'disetujui_manajer_tu', catatan: null, created_at: new Date('2026-01-20T08:00:00'), updated_at: new Date('2026-01-29T11:00:00') },
    { id_surat: 27, id_mahasiswa: 8, jenis_surat: 'Surat Pengantar Legalisir', nomor_surat: null, status: 'disetujui_manajer_tu', catatan: null, created_at: new Date('2026-01-20T09:00:00'), updated_at: new Date('2026-01-29T12:00:00') },
    { id_surat: 28, id_mahasiswa: 12, jenis_surat: 'Surat Keterangan Alumni', nomor_surat: null, status: 'disetujui_manajer_tu', catatan: null, created_at: new Date('2026-01-20T10:00:00'), updated_at: new Date('2026-01-29T13:00:00') },
    { id_surat: 29, id_mahasiswa: 14, jenis_surat: 'Surat Keterangan Nilai', nomor_surat: null, status: 'disetujui_manajer_tu', catatan: null, created_at: new Date('2026-01-20T11:00:00'), updated_at: new Date('2026-01-29T14:00:00') },
    { id_surat: 30, id_mahasiswa: 15, jenis_surat: 'Surat Rekomendasi Kerja', nomor_surat: null, status: 'disetujui_manajer_tu', catatan: null, created_at: new Date('2026-01-20T12:00:00'), updated_at: new Date('2026-01-29T15:00:00') },
    
    // Sudah Selesai (Arsip): 8 surat dengan status "sudah_diberi_nomor"
    { id_surat: 31, id_mahasiswa: 1, jenis_surat: 'Surat Keterangan Transkrip', nomor_surat: 'INV/2026/01/001', status: 'sudah_diberi_nomor', catatan: null, created_at: new Date('2026-01-15T08:00:00'), updated_at: new Date('2026-01-28T15:00:00') },
    { id_surat: 32, id_mahasiswa: 3, jenis_surat: 'Surat Keterangan Bebas Tanggungan', nomor_surat: 'INV/2026/01/002', status: 'sudah_diberi_nomor', catatan: null, created_at: new Date('2026-01-16T08:00:00'), updated_at: new Date('2026-01-28T16:00:00') },
    { id_surat: 33, id_mahasiswa: 5, jenis_surat: 'Surat Pengantar KP', nomor_surat: 'INV/2026/01/003', status: 'sudah_diberi_nomor', catatan: null, created_at: new Date('2026-01-17T08:00:00'), updated_at: new Date('2026-01-29T08:00:00') },
    { id_surat: 34, id_mahasiswa: 7, jenis_surat: 'Surat Keterangan Lulus Sidang', nomor_surat: 'INV/2026/01/004', status: 'sudah_diberi_nomor', catatan: null, created_at: new Date('2026-01-18T08:00:00'), updated_at: new Date('2026-01-29T09:00:00') },
    { id_surat: 35, id_mahasiswa: 9, jenis_surat: 'Surat Rekomendasi Dosen', nomor_surat: 'INV/2026/01/005', status: 'sudah_diberi_nomor', catatan: null, created_at: new Date('2026-01-19T08:00:00'), updated_at: new Date('2026-01-29T10:00:00') },
    { id_surat: 36, id_mahasiswa: 11, jenis_surat: 'Surat Keterangan Dispensasi', nomor_surat: 'INV/2026/01/006', status: 'sudah_diberi_nomor', catatan: null, created_at: new Date('2026-01-19T09:00:00'), updated_at: new Date('2026-01-29T11:00:00') },
    { id_surat: 37, id_mahasiswa: 13, jenis_surat: 'Surat Izin Mengikuti Konferensi', nomor_surat: 'INV/2026/01/007', status: 'sudah_diberi_nomor', catatan: null, created_at: new Date('2026-01-19T10:00:00'), updated_at: new Date('2026-01-29T12:00:00') },
    { id_surat: 38, id_mahasiswa: 15, jenis_surat: 'Surat Keterangan Selesai Studi', nomor_surat: 'INV/2026/01/008', status: 'sudah_diberi_nomor', catatan: null, created_at: new Date('2026-01-19T11:00:00'), updated_at: new Date('2026-01-29T13:00:00') }
  ];

  public surat_proses: SuratProses[] = [];

  public lampiran: Lampiran[] = [];

  public penomoran_surat: PenomoranSurat[] = [];

  private constructor() {
    // Load data from localStorage if available (for persistence across pages)
    this.loadFromLocalStorage();
  }

  static getInstance(): MockDatabase {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase();
    }
    return MockDatabase.instance;
  }
  
  // Save data to localStorage for persistence
  public saveToLocalStorage() {
    if (typeof window !== 'undefined') {
      try {
        const data = {
          surat: this.surat.map(s => ({
            ...s,
            created_at: s.created_at.toISOString(),
            updated_at: s.updated_at.toISOString(),
            tanggal_lulus_pemohon: s.tanggal_lulus_pemohon?.toISOString()
          })),
          lampiran: this.lampiran.map(l => ({
            ...l,
            uploaded_at: l.uploaded_at.toISOString(),
            file_object: undefined // Don't store File objects
          })),
          mahasiswa: this.mahasiswa.map(m => ({
            ...m,
            tanggalLahir: m.tanggalLahir?.toISOString(),
            tanggalLulus: m.tanggalLulus?.toISOString()
          })),
          nextSuratId: this.nextSuratId,
          nextLampiranId: this.nextLampiranId
        };
        localStorage.setItem('__mockdb_data__', JSON.stringify(data));
        console.log('[MockDB] Data saved to localStorage');
      } catch (error) {
        console.error('[MockDB] Failed to save to localStorage:', error);
      }
    }
  }
  
  // Load data from localStorage
  private loadFromLocalStorage() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('__mockdb_data__');
        if (stored) {
          const data = JSON.parse(stored);
          
          // Restore surat
          if (data.surat) {
            this.surat = data.surat.map((s: any) => ({
              ...s,
              created_at: new Date(s.created_at),
              updated_at: new Date(s.updated_at),
              tanggal_lulus_pemohon: s.tanggal_lulus_pemohon ? new Date(s.tanggal_lulus_pemohon) : undefined
            }));
          }
          
          // Restore lampiran
          if (data.lampiran) {
            this.lampiran = data.lampiran.map((l: any) => ({
              ...l,
              uploaded_at: new Date(l.uploaded_at)
            }));
          }
          
          // Restore mahasiswa (might have updated data)
          if (data.mahasiswa) {
            this.mahasiswa = data.mahasiswa.map((m: any) => ({
              ...m,
              tanggalLahir: m.tanggalLahir ? new Date(m.tanggalLahir) : undefined,
              tanggalLulus: m.tanggalLulus ? new Date(m.tanggalLulus) : undefined
            }));
          }
          
          // Restore counters
          if (data.nextSuratId) this.nextSuratId = data.nextSuratId;
          if (data.nextLampiranId) this.nextLampiranId = data.nextLampiranId;
          
          console.log('[MockDB] Data loaded from localStorage:', {
            surat: this.surat.length,
            lampiran: this.lampiran.length,
            nextSuratId: this.nextSuratId
          });
        }
      } catch (error) {
        console.error('[MockDB] Failed to load from localStorage:', error);
      }
    }
  }

  static getInstance(): MockDatabase {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase();
    }
    return MockDatabase.instance;
  }

  // ==================== HELPER METHODS ====================
  
  getMahasiswaById(id: number): Mahasiswa | undefined {
    return this.mahasiswa.find(m => m.id_mahasiswa === id);
  }

  getPegawaiById(id: number): Pegawai | undefined {
    return this.pegawai.find(p => p.id_pegawai === id);
  }

  getSuratById(id: number): Surat | undefined {
    return this.surat.find(s => s.id_surat === id);
  }

  getSuratByMahasiswa(idMahasiswa: number): Surat[] {
    return this.surat.filter(s => s.id_mahasiswa === idMahasiswa);
  }

  getProsesBySurat(idSurat: number): SuratProses[] {
    return this.surat_proses.filter(sp => sp.id_surat === idSurat);
  }

  getLampiranBySurat(idSurat: number): Lampiran[] {
    return this.lampiran.filter(l => l.id_surat === idSurat);
  }

  getPenomoranBySurat(idSurat: number): PenomoranSurat | undefined {
    return this.penomoran_surat.find(p => p.id_surat === idSurat);
  }

  /**
   * Get surat berdasarkan role pegawai
   * - admin_prodi: surat dengan status "diajukan"
   * - ketua_prodi: surat dengan status "disetujui_admin_prodi"
   * - admin_fakultas: surat dengan status "disetujui_kaprodi"
   * - supervisor: surat dengan status "disetujui_admin_fakultas"
   * - manajer_tu: surat dengan status "disetujui_supervisor"
   * - staff_fakultas: surat dengan status "disetujui_manajer_tu"
   */
  getSuratByRole(role: string): Surat[] {
    const statusMap: Record<string, string> = {
      'admin_prodi': 'diajukan',
      'ketua_prodi': 'disetujui_admin_prodi',
      'admin_fakultas': 'disetujui_kaprodi',
      'supervisor': 'disetujui_admin_fakultas',
      'manajer_tu': 'disetujui_supervisor',
      'staff_fakultas': 'disetujui_manajer_tu'
    };

    const targetStatus = statusMap[role];
    if (!targetStatus) return [];

    return this.surat.filter(s => s.status === targetStatus);
  }

  /**
   * Get semua surat yang sudah selesai (untuk arsip)
   */
  getSuratSelesai(): Surat[] {
    return this.surat.filter(s => s.status === 'sudah_diberi_nomor');
  }

  /**
   * REQ-MHS-04: Get surat by mahasiswa dengan tracking status
   */
  getSuratByMahasiswa(idMahasiswa: number): Surat[] {
    return this.surat
      .filter(s => s.id_mahasiswa === idMahasiswa)
      .map(s => ({
        ...s,
        can_edit: s.status === 'draft' || s.status === 'revisi',
        can_cancel: s.status === 'draft' || s.status === 'diajukan',
        instruksi_pengambilan: s.status === 'completed' 
          ? 'Silakan ke Akademik membawa pas foto 2x3 untuk cap basah' 
          : undefined
      }));
  }

  /**
   * REQ-MHS-03: Update data surat (untuk edit)
   */
  updateSurat(idSurat: number, data: Partial<Surat>): boolean {
    const index = this.surat.findIndex(s => s.id_surat === idSurat);
    if (index === -1) return false;

    const surat = this.surat[index];
    // Hanya bisa edit jika draft atau revisi
    if (surat.status !== 'draft' && surat.status !== 'revisi') {
      return false;
    }

    this.surat[index] = {
      ...surat,
      ...data,
      updated_at: new Date()
    };
    return true;
  }

  /**
   * REQ-MHS-03: Cancel surat (hanya jika pending/draft)
   */
  cancelSurat(idSurat: number): boolean {
    const index = this.surat.findIndex(s => s.id_surat === idSurat);
    if (index === -1) return false;

    const surat = this.surat[index];
    // Hanya bisa cancel jika draft atau baru diajukan
    if (surat.status !== 'draft' && surat.status !== 'diajukan') {
      return false;
    }

    // Hapus surat dari daftar
    this.surat.splice(index, 1);
    return true;
  }

  /**
   * Update mahasiswa data
   */
  updateMahasiswa(idMahasiswa: number, data: Partial<Mahasiswa>): boolean {
    const index = this.mahasiswa.findIndex(m => m.id_mahasiswa === idMahasiswa);
    if (index === -1) return false;

    this.mahasiswa[index] = {
      ...this.mahasiswa[index],
      ...data
    };
    return true;
  }

  // ==================== SIMULATION FUNCTIONS ====================

  /**
   * Mahasiswa mengajukan surat baru
   */
  ajukanSurat(idMahasiswa: number, jenisSurat: string): Surat {
    const mahasiswa = this.getMahasiswaById(idMahasiswa);
    if (!mahasiswa) {
      throw new Error('Mahasiswa tidak ditemukan');
    }

    const newSurat: Surat = {
      id_surat: this.nextSuratId++,
      id_mahasiswa: idMahasiswa,
      jenis_surat: jenisSurat,
      nomor_surat: null,
      status: 'diajukan',
      catatan: null,
      created_at: new Date(),
      updated_at: new Date()
    };

    this.surat.push(newSurat);
    console.log(`✓ Surat ${jenisSurat} berhasil diajukan oleh ${mahasiswa.nama}`);
    return newSurat;
  }

  /**
   * Upload lampiran ke surat
   * File disimpan sebagai File object, path_file menggunakan URL.createObjectURL()
   */
  uploadLampiran(idSurat: number, file: File): Lampiran {
    const surat = this.getSuratById(idSurat);
    if (!surat) {
      throw new Error('Surat tidak ditemukan');
    }

    // Create object URL for preview
    const objectURL = URL.createObjectURL(file);

    const newLampiran: Lampiran = {
      id_lampiran: this.nextLampiranId++,
      id_surat: idSurat,
      nama_file: file.name,
      tipe_file: file.type,
      path_file: objectURL,
      file_object: file,
      uploaded_at: new Date()
    };

    this.lampiran.push(newLampiran);
    console.log(`✓ Lampiran ${file.name} berhasil diupload ke surat ID ${idSurat}`);
    return newLampiran;
  }

  /**
   * Pegawai memproses surat (approve/reject/revisi)
   * Status flow:
   * diajukan -> disetujui_admin_prodi -> disetujui_kaprodi -> disetujui_admin_fakultas 
   * -> disetujui_supervisor -> disetujui_manajer_tu -> sudah_diberi_nomor
   */
  prosesSurat(
    idSurat: number,
    idPegawai: number,
    aksi: 'verifikasi' | 'approve' | 'reject' | 'revisi',
    catatan: string | null = null
  ): SuratProses {
    const surat = this.getSuratById(idSurat);
    const pegawai = this.getPegawaiById(idPegawai);

    if (!surat) throw new Error('Surat tidak ditemukan');
    if (!pegawai) throw new Error('Pegawai tidak ditemukan');

    const newProses: SuratProses = {
      id_proses: this.nextProsesId++,
      id_surat: idSurat,
      id_pegawai: idPegawai,
      role: pegawai.role,
      aksi: aksi,
      catatan: catatan,
      tanggal_proses: new Date()
    };

    this.surat_proses.push(newProses);

    // Update status surat berdasarkan aksi dan role
    if (aksi === 'reject') {
      surat.status = 'ditolak';
      surat.catatan = catatan;
    } else if (aksi === 'revisi') {
      surat.status = 'revisi';
      surat.catatan = catatan;
    } else if (aksi === 'approve' || aksi === 'verifikasi') {
      // Update status berdasarkan role yang approve
      const statusFlow: Record<string, typeof surat.status> = {
        'admin_prodi': 'disetujui_admin_prodi',
        'ketua_prodi': 'disetujui_kaprodi',
        'admin_fakultas': 'disetujui_admin_fakultas',
        'supervisor': 'disetujui_supervisor',
        'manajer_tu': 'disetujui_manajer_tu',
        'staff_fakultas': 'sudah_diberi_nomor' // staff fakultas yang memberikan nomor
      };

      if (statusFlow[pegawai.role]) {
        surat.status = statusFlow[pegawai.role];
      }
    }

    surat.updated_at = new Date();

    console.log(`✓ ${pegawai.nama} (${pegawai.role}) melakukan ${aksi} pada surat ID ${idSurat}`);
    console.log(`  Status surat sekarang: ${surat.status}`);
    return newProses;
  }

  /**
   * Staff fakultas memberikan nomor surat
   */
  beriNomorSurat(idSurat: number, idPegawai: number, nomorSurat?: string): PenomoranSurat {
    const surat = this.getSuratById(idSurat);
    const pegawai = this.getPegawaiById(idPegawai);

    if (!surat) throw new Error('Surat tidak ditemukan');
    if (!pegawai) throw new Error('Pegawai tidak ditemukan');
    if (surat.status !== 'disetujui_manajer_tu' && surat.status !== 'sudah_diberi_nomor') {
      throw new Error('Surat harus disetujui manajer TU terlebih dahulu sebelum diberi nomor');
    }

    // Generate nomor surat jika tidak diberikan
    const generatedNomor = nomorSurat || this.generateNomorSurat(surat);

    const newPenomoran: PenomoranSurat = {
      id_penomoran: this.nextPenomoranId++,
      id_surat: idSurat,
      id_pegawai: idPegawai,
      nomor_surat: generatedNomor,
      tanggal_penomoran: new Date()
    };

    this.penomoran_surat.push(newPenomoran);

    // Update nomor surat dan status
    surat.nomor_surat = generatedNomor;
    surat.status = 'sudah_diberi_nomor';
    surat.updated_at = new Date();

    console.log(`✓ Nomor surat ${generatedNomor} diberikan pada surat ID ${idSurat}`);
    return newPenomoran;
  }

  /**
   * Generate nomor surat otomatis
   */
  private generateNomorSurat(surat: Surat): string {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const counter = String(this.penomoran_surat.length + 1).padStart(3, '0');
    
    // Format: INV/YYYY/MM/XXX
    return `INV/${year}/${month}/${counter}`;
  }

  /**
   * Get detail surat lengkap dengan relasi
   */
  getSuratDetail(idSurat: number) {
    const surat = this.getSuratById(idSurat);
    if (!surat) return null;

    const mahasiswa = this.getMahasiswaById(surat.id_mahasiswa);
    const proses = this.getProsesBySurat(idSurat).map(p => ({
      ...p,
      pegawai: this.getPegawaiById(p.id_pegawai)
    }));
    const lampiran = this.getLampiranBySurat(idSurat);
    const penomoran = this.getPenomoranBySurat(idSurat);

    return {
      ...surat,
      mahasiswa,
      proses,
      lampiran,
      penomoran
    };
  }

  /**
   * Reset database ke state awal
   */
  reset() {
    this.surat = [
      // Admin Prodi: 5 surat
      { id_surat: 1, id_mahasiswa: 1, jenis_surat: 'Surat Keterangan Lulus', nomor_surat: null, status: 'diajukan', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-25T08:00:00'), updated_at: new Date('2026-01-25T08:00:00') },
      { id_surat: 2, id_mahasiswa: 3, jenis_surat: 'Surat Keterangan Aktif Kuliah', nomor_surat: null, status: 'diajukan', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-25T09:00:00'), updated_at: new Date('2026-01-25T09:00:00') },
      { id_surat: 3, id_mahasiswa: 5, jenis_surat: 'Surat Pengantar PKL', nomor_surat: null, status: 'diajukan', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-25T10:00:00'), updated_at: new Date('2026-01-25T10:00:00') },
      { id_surat: 4, id_mahasiswa: 7, jenis_surat: 'Surat Rekomendasi Beasiswa', nomor_surat: null, status: 'diajukan', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-26T08:00:00'), updated_at: new Date('2026-01-26T08:00:00') },
      { id_surat: 5, id_mahasiswa: 9, jenis_surat: 'Surat Keterangan Bebas Pustaka', nomor_surat: null, status: 'diajukan', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-26T09:00:00'), updated_at: new Date('2026-01-26T09:00:00') },
      
      // Ketua Prodi: 7 surat
      { id_surat: 6, id_mahasiswa: 2, jenis_surat: 'Surat Izin Penelitian', nomor_surat: null, status: 'disetujui_admin_prodi', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-24T08:00:00'), updated_at: new Date('2026-01-26T10:00:00') },
      { id_surat: 7, id_mahasiswa: 4, jenis_surat: 'Surat Keterangan Pindah Prodi', nomor_surat: null, status: 'disetujui_admin_prodi', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-24T09:00:00'), updated_at: new Date('2026-01-26T11:00:00') },
      { id_surat: 8, id_mahasiswa: 6, jenis_surat: 'Surat Keterangan Cuti Akademik', nomor_surat: null, status: 'disetujui_admin_prodi', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-24T10:00:00'), updated_at: new Date('2026-01-26T12:00:00') },
      { id_surat: 9, id_mahasiswa: 8, jenis_surat: 'Surat Pengantar Magang', nomor_surat: null, status: 'disetujui_admin_prodi', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-24T11:00:00'), updated_at: new Date('2026-01-26T13:00:00') },
      { id_surat: 10, id_mahasiswa: 10, jenis_surat: 'Surat Keterangan Mahasiswa Aktif', nomor_surat: null, status: 'disetujui_admin_prodi', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-25T08:00:00'), updated_at: new Date('2026-01-27T08:00:00') },
      { id_surat: 11, id_mahasiswa: 11, jenis_surat: 'Surat Rekomendasi Lomba', nomor_surat: null, status: 'disetujui_admin_prodi', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-25T09:00:00'), updated_at: new Date('2026-01-27T09:00:00') },
      { id_surat: 12, id_mahasiswa: 13, jenis_surat: 'Surat Keterangan Kelakuan Baik', nomor_surat: null, status: 'disetujui_admin_prodi', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-25T10:00:00'), updated_at: new Date('2026-01-27T10:00:00') },
      
      // Admin Fakultas: 4 surat
      { id_surat: 13, id_mahasiswa: 1, jenis_surat: 'Surat Pengantar Skripsi', nomor_surat: null, status: 'disetujui_kaprodi', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-23T08:00:00'), updated_at: new Date('2026-01-27T11:00:00') },
      { id_surat: 14, id_mahasiswa: 12, jenis_surat: 'Surat Izin Seminar Proposal', nomor_surat: null, status: 'disetujui_kaprodi', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-23T09:00:00'), updated_at: new Date('2026-01-27T12:00:00') },
      { id_surat: 15, id_mahasiswa: 14, jenis_surat: 'Surat Keterangan Lulus', nomor_surat: null, status: 'disetujui_kaprodi', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-23T10:00:00'), updated_at: new Date('2026-01-27T13:00:00') },
      { id_surat: 16, id_mahasiswa: 15, jenis_surat: 'Surat Rekomendasi Program Pertukaran', nomor_surat: null, status: 'disetujui_kaprodi', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-23T11:00:00'), updated_at: new Date('2026-01-27T14:00:00') },
      
      // Supervisor: 6 surat
      { id_surat: 17, id_mahasiswa: 3, jenis_surat: 'Surat Pengantar Penelitian Lapangan', nomor_surat: null, status: 'disetujui_admin_fakultas', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-22T08:00:00'), updated_at: new Date('2026-01-28T08:00:00') },
      { id_surat: 18, id_mahasiswa: 5, jenis_surat: 'Surat Keterangan Prestasi', nomor_surat: null, status: 'disetujui_admin_fakultas', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-22T09:00:00'), updated_at: new Date('2026-01-28T09:00:00') },
      { id_surat: 19, id_mahasiswa: 7, jenis_surat: 'Surat Rekomendasi Beasiswa S2', nomor_surat: null, status: 'disetujui_admin_fakultas', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-22T10:00:00'), updated_at: new Date('2026-01-28T10:00:00') },
      { id_surat: 20, id_mahasiswa: 9, jenis_surat: 'Surat Izin Observasi', nomor_surat: null, status: 'disetujui_admin_fakultas', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-22T11:00:00'), updated_at: new Date('2026-01-28T11:00:00') },
      { id_surat: 21, id_mahasiswa: 11, jenis_surat: 'Surat Keterangan MBKM', nomor_surat: null, status: 'disetujui_admin_fakultas', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-22T12:00:00'), updated_at: new Date('2026-01-28T12:00:00') },
      { id_surat: 22, id_mahasiswa: 13, jenis_surat: 'Surat Pengantar Studi Banding', nomor_surat: null, status: 'disetujui_admin_fakultas', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-22T13:00:00'), updated_at: new Date('2026-01-28T13:00:00') },
      
      // Manajer TU: 3 surat
      { id_surat: 23, id_mahasiswa: 2, jenis_surat: 'Surat Keterangan Pindah Kampus', nomor_surat: null, status: 'disetujui_supervisor', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-21T08:00:00'), updated_at: new Date('2026-01-29T08:00:00') },
      { id_surat: 24, id_mahasiswa: 6, jenis_surat: 'Surat Keterangan Aktif Organisasi', nomor_surat: null, status: 'disetujui_supervisor', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-21T09:00:00'), updated_at: new Date('2026-01-29T09:00:00') },
      { id_surat: 25, id_mahasiswa: 10, jenis_surat: 'Surat Rekomendasi Magang Internasional', nomor_surat: null, status: 'disetujui_supervisor', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-21T10:00:00'), updated_at: new Date('2026-01-29T10:00:00') },
      
      // Staff Fakultas: 5 surat
      { id_surat: 26, id_mahasiswa: 4, jenis_surat: 'Surat Keterangan Wisuda', nomor_surat: null, status: 'disetujui_manajer_tu', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-20T08:00:00'), updated_at: new Date('2026-01-29T11:00:00') },
      { id_surat: 27, id_mahasiswa: 8, jenis_surat: 'Surat Pengantar Legalisir', nomor_surat: null, status: 'disetujui_manajer_tu', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-20T09:00:00'), updated_at: new Date('2026-01-29T12:00:00') },
      { id_surat: 28, id_mahasiswa: 12, jenis_surat: 'Surat Keterangan Alumni', nomor_surat: null, status: 'disetujui_manajer_tu', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-20T10:00:00'), updated_at: new Date('2026-01-29T13:00:00') },
      { id_surat: 29, id_mahasiswa: 14, jenis_surat: 'Surat Keterangan Nilai', nomor_surat: null, status: 'disetujui_manajer_tu', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-20T11:00:00'), updated_at: new Date('2026-01-29T14:00:00') },
      { id_surat: 30, id_mahasiswa: 15, jenis_surat: 'Surat Rekomendasi Kerja', nomor_surat: null, status: 'disetujui_manajer_tu', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-20T12:00:00'), updated_at: new Date('2026-01-29T15:00:00') },
      
      // Arsip: 8 surat
      { id_surat: 31, id_mahasiswa: 1, jenis_surat: 'Surat Keterangan Transkrip', nomor_surat: 'INV/2026/01/001', status: 'sudah_diberi_nomor', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-15T08:00:00'), updated_at: new Date('2026-01-28T15:00:00') },
      { id_surat: 32, id_mahasiswa: 3, jenis_surat: 'Surat Keterangan Bebas Tanggungan', nomor_surat: 'INV/2026/01/002', status: 'sudah_diberi_nomor', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-16T08:00:00'), updated_at: new Date('2026-01-28T16:00:00') },
      { id_surat: 33, id_mahasiswa: 5, jenis_surat: 'Surat Pengantar KP', nomor_surat: 'INV/2026/01/003', status: 'sudah_diberi_nomor', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-17T08:00:00'), updated_at: new Date('2026-01-29T08:00:00') },
      { id_surat: 34, id_mahasiswa: 7, jenis_surat: 'Surat Keterangan Lulus Sidang', nomor_surat: 'INV/2026/01/004', status: 'sudah_diberi_nomor', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-18T08:00:00'), updated_at: new Date('2026-01-29T09:00:00') },
      { id_surat: 35, id_mahasiswa: 9, jenis_surat: 'Surat Rekomendasi Dosen', nomor_surat: 'INV/2026/01/005', status: 'sudah_diberi_nomor', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-19T08:00:00'), updated_at: new Date('2026-01-29T10:00:00') },
      { id_surat: 36, id_mahasiswa: 11, jenis_surat: 'Surat Keterangan Dispensasi', nomor_surat: 'INV/2026/01/006', status: 'sudah_diberi_nomor', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-19T09:00:00'), updated_at: new Date('2026-01-29T11:00:00') },
      { id_surat: 37, id_mahasiswa: 13, jenis_surat: 'Surat Izin Mengikuti Konferensi', nomor_surat: 'INV/2026/01/007', status: 'sudah_diberi_nomor', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-19T10:00:00'), updated_at: new Date('2026-01-29T12:00:00') },
      { id_surat: 38, id_mahasiswa: 15, jenis_surat: 'Surat Keterangan Selesai Studi', nomor_surat: 'INV/2026/01/008', status: 'sudah_diberi_nomor', catatan: null, kaprodi_signature: null, created_at: new Date('2026-01-19T11:00:00'), updated_at: new Date('2026-01-29T13:00:00') }
    ];
    this.surat_proses = [];
    this.lampiran = [];
    this.penomoran_surat = [];
    this.nextSuratId = 39;
    this.nextProsesId = 1;
    this.nextLampiranId = 1;
    this.nextPenomoranId = 1;
    console.log('✓ Database direset ke state awal');
  }
}

// ==================== EXPORT SINGLETON ====================
export const db = MockDatabase.getInstance();

// ==================== CONTOH PENGGUNAAN ====================
export function demoAlurSurat() {
  console.log('\n========== DEMO ALUR LENGKAP PENGAJUAN SURAT ==========\n');

  const db = MockDatabase.getInstance();
  
  // Reset database
  db.reset();

  // 1. Mahasiswa mengajukan surat (sudah ada di state awal)
  console.log('1️⃣ Mahasiswa mengajukan surat...');
  const surat = db.getSuratById(1)!;
  console.log('   Jenis Surat:', surat.jenis_surat);
  console.log('   Status:', surat.status);
  console.log('');

  // 2. Admin Prodi melakukan verifikasi (approve)
  console.log('2️⃣ Admin Prodi melakukan verifikasi...');
  db.prosesSurat(surat.id_surat, 1, 'approve', 'Dokumen lengkap dan sesuai');
  console.log('');

  // 3. Ketua Prodi melakukan persetujuan (approve)
  console.log('3️⃣ Ketua Prodi melakukan persetujuan...');
  db.prosesSurat(surat.id_surat, 2, 'approve', 'Disetujui untuk diteruskan');
  console.log('');

  // 4. Admin Fakultas melakukan verifikasi
  console.log('4️⃣ Admin Fakultas melakukan verifikasi...');
  db.prosesSurat(surat.id_surat, 3, 'approve', 'Data valid, disetujui');
  console.log('');

  // 5. Supervisor melakukan persetujuan
  console.log('5️⃣ Supervisor melakukan persetujuan...');
  db.prosesSurat(surat.id_surat, 4, 'approve', 'Disetujui untuk penerbitan');
  console.log('');

  // 6. Manajer TU melakukan verifikasi final
  console.log('6️⃣ Manajer TU melakukan verifikasi final...');
  db.prosesSurat(surat.id_surat, 5, 'approve', 'Siap untuk diberi nomor');
  console.log('');

  // 7. Staff Fakultas memberikan nomor surat
  console.log('7️⃣ Staff Fakultas memberikan nomor surat...');
  db.beriNomorSurat(surat.id_surat, 6);
  const suratFinal = db.getSuratById(surat.id_surat)!;
  console.log('   Nomor Surat:', suratFinal.nomor_surat);
  console.log('');

  // 8. Tampilkan detail lengkap
  console.log('8️⃣ Detail Surat Lengkap:');
  const detail = db.getSuratDetail(surat.id_surat);
  console.log(JSON.stringify(detail, null, 2));
  console.log('');

  console.log('========== DEMO SELESAI ==========\n');
}

// ==================== CONTOH KASUS REVISI ====================
export function demoAlurRevisi() {
  console.log('\n========== DEMO ALUR REVISI SURAT ==========\n');

  const db = MockDatabase.getInstance();
  db.reset();

  // Ambil surat yang sudah diajukan
  const surat = db.getSuratById(1)!;
  console.log('1️⃣ Surat diajukan, status:', surat.status);

  // Admin prodi melakukan revisi
  db.prosesSurat(surat.id_surat, 1, 'revisi', 'Mohon lengkapi data alamat yang lebih detail');
  const suratRevisi = db.getSuratById(surat.id_surat)!;
  console.log('2️⃣ Admin Prodi meminta revisi, status:', suratRevisi.status);
  console.log('   Catatan:', suratRevisi.catatan);

  console.log('\n========== DEMO SELESAI ==========\n');
}

// ==================== CONTOH KASUS TOLAK ====================
export function demoAlurTolak() {
  console.log('\n========== DEMO ALUR TOLAK SURAT ==========\n');

  const db = MockDatabase.getInstance();
  db.reset();

  const surat = db.getSuratById(1)!;
  console.log('1️⃣ Surat diajukan, status:', surat.status);

  // Ketua prodi menolak
  db.prosesSurat(surat.id_surat, 2, 'reject', 'Dokumen tidak lengkap');
  const suratDitolak = db.getSuratById(surat.id_surat)!;
  console.log('2️⃣ Ketua Prodi menolak surat, status:', suratDitolak.status);
  console.log('   Catatan:', suratDitolak.catatan);

  console.log('\n========== DEMO SELESAI ==========\n');
}

// ==================== DEMO GET SURAT BY ROLE ====================
export function demoGetSuratByRole() {
  console.log('\n========== DEMO GET SURAT BY ROLE ==========\n');

  const db = MockDatabase.getInstance();
  db.reset();

  const roles = ['admin_prodi', 'ketua_prodi', 'admin_fakultas', 'supervisor', 'manajer_tu', 'staff_fakultas'];

  roles.forEach(role => {
    const surat = db.getSuratByRole(role);
    console.log(`\n${role.toUpperCase()}:`);
    console.log(`Jumlah surat: ${surat.length}`);
    surat.forEach(s => {
      const mhs = db.getMahasiswaById(s.id_mahasiswa);
      console.log(`  - ID ${s.id_surat}: ${s.jenis_surat} (${mhs?.nama})`);
    });
  });

  console.log('\n\nSURAT SELESAI (ARSIP):');
  const selesai = db.getSuratSelesai();
  console.log(`Jumlah: ${selesai.length}`);
  selesai.forEach(s => {
    const mhs = db.getMahasiswaById(s.id_mahasiswa);
    console.log(`  - ${s.nomor_surat}: ${s.jenis_surat} (${mhs?.nama})`);
  });

  console.log('\n========== DEMO SELESAI ==========\n');
}
