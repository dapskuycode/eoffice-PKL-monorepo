-- Query untuk melihat program studi dan pegawai
SELECT ps.id as program_studi_id, ps.name as program_studi_name, 
       p.id as pegawai_id, u.name as pegawai_name, p.nip, p.jabatan
FROM program_studi ps
LEFT JOIN pegawai p ON p."programStudiId" = ps.id
LEFT JOIN "user" u ON u.id = p."userId"
WHERE ps.name ILIKE '%informatika%';

-- Setelah menemukan pegawai yang tepat, update dengan query berikut:
-- Ganti 'PEGAWAI_ID_DISINI' dengan ID pegawai yang menjadi ketua prodi
-- Ganti 'PROGRAM_STUDI_ID_DISINI' dengan ID program studi Informatika

-- Set Dr. Budi Santoso sebagai Ketua Program Studi Informatika
UPDATE program_studi 
SET "ketuaProdiId" = 'cml3t1mfe000gb1qo4w7heknf'
WHERE id = 'cml3t1mc90008b1qormf6x2au';

-- Contoh: Jika Anda ingin set semua pegawai dengan jabatan yang mengandung "Ketua" sebagai ketua prodi:
-- UPDATE program_studi ps
-- SET "ketuaProdiId" = (
--   SELECT p.id 
--   FROM pegawai p 
--   WHERE p."programStudiId" = ps.id 
--   AND p.jabatan ILIKE '%ketua%'
--   LIMIT 1
-- )
-- WHERE ps.name ILIKE '%informatika%';
