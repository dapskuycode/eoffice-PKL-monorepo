-- AlterTable
ALTER TABLE "pengajuan_skl" ADD COLUMN     "alamatSementara" TEXT,
ADD COLUMN     "emailSementara" TEXT,
ADD COLUMN     "namaSementara" TEXT,
ADD COLUMN     "noHpSementara" TEXT,
ADD COLUMN     "tandatangan" TEXT,
ADD COLUMN     "tanggalLahirSementara" TIMESTAMP(3),
ADD COLUMN     "tempatLahirSementara" TEXT;
