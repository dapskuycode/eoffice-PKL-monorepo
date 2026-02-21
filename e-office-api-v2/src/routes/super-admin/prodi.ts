import { Elysia } from 'elysia';
import { Prisma as prisma } from '@backend/db/index.ts';
import { authGuardPlugin, requirePermission } from '@backend/middlewares/auth.ts';

export default new Elysia()
  .use(authGuardPlugin)
  .get('/', async ({ query }) => {
    const { page = '1', limit = '100' } = query as any;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    console.log('--- PRODI GET DEBUG ---');
    console.log('Query:', query);

    const [prodi, total] = await Promise.all([
      prisma.programStudi.findMany({
        include: {
          departemen: true,
        },
        skip,
        take: parseInt(limit),
        orderBy: { name: 'asc' },
      }),
      prisma.programStudi.count(),
    ]);

    console.log('Result total:', total);
    console.log('Result length:', prodi.length);

    return {
      data: prodi,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }, {
    ...requirePermission('prodi', 'read')
  })

  .get('/:id', async ({ params: { id } }) => {
    const prodi = await prisma.programStudi.findUnique({
      where: { id },
      include: {
        departemen: true,
      },
    });

    if (!prodi) {
      return { error: 'Program Studi not found' };
    }

    return prodi;
  }, {
    ...requirePermission('prodi', 'read')
  })

  .post('/', async ({ body }) => {
    const { name, code, departemenId } = body as any;

    const prodi = await prisma.programStudi.create({
      data: {
        name,
        code,
        departemenId,
      },
      include: {
        departemen: true,
      },
    });

    return prodi;
  }, {
    ...requirePermission('prodi', 'create')
  })

  .put('/:id', async ({ params: { id }, body }) => {
    const { name, code, departemenId } = body as any;

    const prodi = await prisma.programStudi.update({
      where: { id },
      data: {
        name,
        code,
        departemenId,
      },
      include: {
        departemen: true,
      },
    });

    return prodi;
  }, {
    ...requirePermission('prodi', 'write')
  })

  .delete('/:id', async ({ params: { id } }) => {
    // 1. Check if prodi has students or staff
    const mhsCount = await prisma.mahasiswa.count({ where: { programStudiId: id } });
    const pegCount = await prisma.pegawai.count({ where: { programStudiId: id } });

    if (mhsCount > 0 || pegCount > 0) {
      return {
        error: 'Forbidden',
        message: `Program Studi cannot be deleted because it has ${mhsCount} students and ${pegCount} staff. Please delete or move them first.`
      };
    }

    await prisma.$transaction(async (tx) => {
      // 2. Nullify ketuaProdiId to break circular reference if any
      await tx.programStudi.update({
        where: { id },
        data: { ketuaProdiId: null }
      });

      // 3. Delete Program Studi
      await tx.programStudi.delete({
        where: { id },
      });
    });

    return { success: true, message: 'Program Studi deleted successfully' };
  }, {
    ...requirePermission('prodi', 'delete')
  });
