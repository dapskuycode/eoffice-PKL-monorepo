/*
  Warnings:

  - You are about to drop the column `tandatanganKaprodi` on the `pengajuan_skl` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "pengajuan_skl" DROP COLUMN "tandatanganKaprodi";

-- AlterTable
ALTER TABLE "program_studi" ADD COLUMN     "ketuaProdiId" TEXT;

-- AddForeignKey
ALTER TABLE "program_studi" ADD CONSTRAINT "program_studi_ketuaProdiId_fkey" FOREIGN KEY ("ketuaProdiId") REFERENCES "pegawai"("id") ON DELETE SET NULL ON UPDATE CASCADE;
