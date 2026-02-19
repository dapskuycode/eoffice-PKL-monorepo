// Role & Permissions mapping
export const ROLE_PERMISSIONS = {
  mahasiswa: [
    'pengajuan:create',
    'pengajuan:read:own',
    'pengajuan:update:own',
    'lampiran:upload:own',
    'lampiran:delete:own',
  ],
  admin_prodi: [
    'pengajuan:read:prodi',
    'pengajuan:verify',
    'pengajuan:request_revision',
    'approval:create',
    'lampiran:read:prodi',
  ],
  ketua_prodi: [
    'pengajuan:read:prodi',
    'pengajuan:approve',
    'pengajuan:reject',
    'approval:create',
    'lampiran:read:prodi',
  ],
  admin_fakultas: [
    'pengajuan:read:all',
    'pengajuan:finalize',
    'laporan:read:all',
    'lampiran:read:all',
  ],
  supervisor: [
    'pengajuan:read:all',
    'pengajuan:comment',
    'laporan:read:all',
    'lampiran:read:all',
  ],
};

export const hasPermission = (role: string, permission: string): boolean => {
  const permissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
  return permissions.includes(permission);
};

export const canViewPengajuan = (userRole: string): boolean => {
  return ['mahasiswa', 'admin_prodi', 'ketua_prodi', 'admin_fakultas', 'supervisor'].includes(
    userRole
  );
};

export const canApprovePengajuan = (userRole: string): boolean => {
  return ['admin_prodi', 'ketua_prodi', 'admin_fakultas'].includes(userRole);
};

export const canCreatePengajuan = (userRole: string): boolean => {
  return userRole === 'mahasiswa';
};
