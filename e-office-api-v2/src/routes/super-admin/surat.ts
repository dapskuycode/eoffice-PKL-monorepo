import { Elysia } from 'elysia';
import { Prisma as prisma } from '@backend/db/index.ts';
import { authGuardPlugin, requirePermission } from '@backend/middlewares/auth.ts';

export default new Elysia()
  .use(authGuardPlugin)
  .get('/', async ({ query }) => {
    const { page = '1', limit = '10', status = '' } = query as any;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {};

    if (status) {
      where.status = status;
    }

    const [surat, total] = await Promise.all([
      prisma.pengajuanSkl.findMany({
        where,
        include: {
          mahasiswa: {
            include: {
              user: true,
              programStudi: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pengajuanSkl.count({ where }),
    ]);

    return {
      data: surat,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }, {
    ...requirePermission('surat', 'read')
  })

  .get('/:id', async ({ params: { id } }) => {
    const surat = await prisma.pengajuanSkl.findUnique({
      where: { id },
      include: {
        mahasiswa: {
          include: {
            user: true,
            programStudi: true,
          },
        },
        lampiran: true,
        riwayat: {
          include: {
            actor: true,
          },
          orderBy: {
            timestamp: 'desc',
          },
        },
      },
    });

    if (!surat) {
      return { error: 'Surat not found' };
    }

    return surat;
  }, {
    ...requirePermission('surat', 'read')
  })

  .delete('/:id', async ({ params: { id } }) => {
    await prisma.$transaction(async (tx) => {
      // 1. Delete associated attachments
      await tx.lampiranSkl.deleteMany({
        where: { pengajuanSklId: id },
      });

      // 2. Delete associated history
      await tx.riwayatPengajuanSkl.deleteMany({
        where: { pengajuanSklId: id },
      });

      // 3. Delete the SKL submission itself
      await tx.pengajuanSkl.delete({
        where: { id },
      });
    });

    return { success: true, message: 'Surat deleted successfully' };
  }, {
    ...requirePermission('surat', 'delete')
  });
