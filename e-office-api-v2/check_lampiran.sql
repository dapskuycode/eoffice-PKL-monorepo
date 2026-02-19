-- Query untuk mengecek semua lampiran pengajuan SKL
SELECT 
    p.id, 
    p."nomorSuratPengantar", 
    p.status, 
    COUNT(l.id) as jumlah_lampiran,
    STRING_AGG(l."namaFile", ', ') as daftar_lampiran
FROM pengajuan_skl p 
LEFT JOIN lampiran_skl l ON p.id = l."pengajuanSklId" 
GROUP BY p.id, p."nomorSuratPengantar", p.status 
ORDER BY p.id;
