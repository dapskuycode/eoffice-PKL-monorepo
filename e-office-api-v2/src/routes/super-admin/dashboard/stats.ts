import { Elysia } from 'elysia';
import { Prisma as prisma } from '@backend/db/index.ts';

// Trigger reload for Casbin policy refresh
export default new Elysia()
  .get('/', async () => {
    try {
      const [totalMahasiswa, totalPegawai, totalProdi, totalSurat] = await Promise.all([
        prisma.mahasiswa.count(),
        prisma.pegawai.count(),
        prisma.programStudi.count(),
        prisma.pengajuanSkl.count(),
      ]);

      return {
        totalMahasiswa,
        totalPegawai,
        totalProdi,
        totalSurat,
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        totalMahasiswa: 0,
        totalPegawai: 0,
        totalProdi: 0,
        totalSurat: 0,
      };
    }
  });
