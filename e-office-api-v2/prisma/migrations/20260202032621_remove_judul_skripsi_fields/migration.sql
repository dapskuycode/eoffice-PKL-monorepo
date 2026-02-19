/*
  Warnings:

  - You are about to drop the column `judulSkripsiEng` on the `pengajuan_skl` table. All the data in the column will be lost.
  - You are about to drop the column `judulSkripsiIna` on the `pengajuan_skl` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "pengajuan_skl" DROP COLUMN "judulSkripsiEng",
DROP COLUMN "judulSkripsiIna";
