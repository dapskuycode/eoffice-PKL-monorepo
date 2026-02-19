-- Check supervisor user data
SELECT 
  u.id,
  u.email,
  u.name,
  p.nip,
  p.jabatan,
  r.name as role
FROM "user" u
LEFT JOIN "pegawai" p ON p."userId" = u.id
LEFT JOIN "user_role" ur ON ur."userId" = u.id
LEFT JOIN "role" r ON r.id = ur."roleId"
WHERE u.email = 'supervisor@akademik.ac.id';
