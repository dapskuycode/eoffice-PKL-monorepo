-- CreateEnum
CREATE TYPE "status_pengajuan" AS ENUM ('DRAFT', 'SUBMITTED', 'REVISI', 'VERIFIED_ADMIN', 'APPROVED_KAPRODI', 'REGISTERED', 'SIAP_CETAK', 'COMPLETED');

-- CreateEnum
CREATE TYPE "jenis_lampiran_skl" AS ENUM ('KTM', 'TRANSKRIP_NILAI', 'BERITA_ACARA_UJIAN', 'BEBAS_PUSTAKA', 'PAS_FOTO', 'LAINNYA');

-- CreateTable
CREATE TABLE "pengajuan_skl" (
    "id" TEXT NOT NULL,
    "mahasiswaId" TEXT NOT NULL,
    "tglLulus" TIMESTAMP(3) NOT NULL,
    "ipkTerakhir" DOUBLE PRECISION NOT NULL,
    "judulSkripsiIna" TEXT NOT NULL,
    "judulSkripsiEng" TEXT NOT NULL,
    "nomorSuratPengantar" TEXT,
    "adminProdiId" TEXT,
    "nomorSkl" TEXT,
    "pegawaiUpaId" TEXT,
    "status" "status_pengajuan" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "pengajuan_skl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "riwayat_pengajuan_skl" (
    "id" TEXT NOT NULL,
    "pengajuanSklId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "statusBaru" "status_pengajuan" NOT NULL,
    "catatan" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "riwayat_pengajuan_skl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lampiran_skl" (
    "id" TEXT NOT NULL,
    "pengajuanSklId" TEXT NOT NULL,
    "jenisDokumen" "jenis_lampiran_skl" NOT NULL,
    "pathFile" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "lampiran_skl_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pengajuan_skl" ADD CONSTRAINT "pengajuan_skl_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "mahasiswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_skl" ADD CONSTRAINT "pengajuan_skl_adminProdiId_fkey" FOREIGN KEY ("adminProdiId") REFERENCES "pegawai"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_skl" ADD CONSTRAINT "pengajuan_skl_pegawaiUpaId_fkey" FOREIGN KEY ("pegawaiUpaId") REFERENCES "pegawai"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riwayat_pengajuan_skl" ADD CONSTRAINT "riwayat_pengajuan_skl_pengajuanSklId_fkey" FOREIGN KEY ("pengajuanSklId") REFERENCES "pengajuan_skl"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riwayat_pengajuan_skl" ADD CONSTRAINT "riwayat_pengajuan_skl_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lampiran_skl" ADD CONSTRAINT "lampiran_skl_pengajuanSklId_fkey" FOREIGN KEY ("pengajuanSklId") REFERENCES "pengajuan_skl"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
