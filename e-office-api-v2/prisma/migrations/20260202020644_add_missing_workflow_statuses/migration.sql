-- AlterEnum: Add missing workflow statuses to status_pengajuan enum
ALTER TYPE "status_pengajuan" ADD VALUE IF NOT EXISTS 'REGISTERING'; -- Admin Prodi kasih nomor, kirim ke Admin Fakultas
ALTER TYPE "status_pengajuan" ADD VALUE IF NOT EXISTS 'APPROVED_SUPERVISOR'; -- Supervisor approve, kirim ke Manajer TU
ALTER TYPE "status_pengajuan" ADD VALUE IF NOT EXISTS 'STEP_KONVENSIONAL'; -- Staff Fakultas cetak, kirim ke UPA