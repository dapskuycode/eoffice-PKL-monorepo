import { Elysia } from 'elysia';
import { Prisma as prisma } from '@backend/db/index.ts';
import { authGuardPlugin, requirePermission } from '@backend/middlewares/auth.ts';

export default new Elysia()
  .use(authGuardPlugin)
  .get('/', async ({ query }) => {
    const { page = '1', limit = '10', search = '', roleId = '' } = query as any;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {};

    // Build user filter conditions
    const userConditions: any = {};

    if (roleId) {
      userConditions.userRole = {
        some: {
          roleId: roleId,
        },
      };
    }

    if (search) {
      where.OR = [
        { nip: { contains: search, mode: 'insensitive' as const } },
        {
          user: {
            name: { contains: search, mode: 'insensitive' as const },
            ...userConditions
          }
        },
        { jabatan: { contains: search, mode: 'insensitive' as const } },
      ];
    } else if (roleId) {
      // If only roleId filter (no search)
      where.user = userConditions;
    }

    const [pegawai, total] = await Promise.all([
      prisma.pegawai.findMany({
        where,
        include: {
          user: {
            include: {
              userRole: {
                include: {
                  role: true,
                },
              },
            },
          },
          programStudi: true,
          departemen: true,
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pegawai.count({ where }),
    ]);

    return {
      data: pegawai,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }, {
    ...requirePermission('pegawai', 'read')
  })

  .get('/:id', async ({ params: { id } }) => {
    const pegawai = await prisma.pegawai.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            userRole: {
              include: {
                role: true,
              },
            },
          },
        },
        programStudi: true,
        departemen: true,
      },
    });

    if (!pegawai) {
      return { error: 'Pegawai not found' };
    }

    return pegawai;
  }, {
    ...requirePermission('pegawai', 'read')
  })

  .post('/', async ({ body, set }) => {
    const {
      nip,
      jabatan,
      noHp,
      userId: existingUserId,
      departemenId,
      programStudiId,
      email,
      roleId
    } = body as any;

    return await prisma.$transaction(async (tx) => {
      let finalUserId = existingUserId;

      if (!finalUserId) {
        const user = await tx.user.findUnique({ where: { email } });
        if (!user) {
          set.status = 400;
          return { error: 'Conflict', message: 'User must be created via sign-up API first or provide existing userId' };
        }
        finalUserId = user.id;
      }

      // Check if profile exists
      const existingPeg = await tx.pegawai.findUnique({ where: { userId: finalUserId } });
      if (existingPeg) {
        set.status = 409;
        return { error: 'Conflict', message: 'Pegawai profile already exists for this user' };
      }

      const pegawai = await tx.pegawai.create({
        data: {
          nip,
          jabatan,
          noHp,
          userId: finalUserId,
          departemenId,
          programStudiId,
        },
        include: {
          user: true,
          programStudi: true,
          departemen: true,
        },
      });

      // Role assignment
      if (roleId) {
        await tx.userRole.upsert({
          where: {
            userId_roleId: {
              userId: finalUserId,
              roleId: roleId
            }
          },
          create: {
            userId: finalUserId,
            roleId: roleId,
          },
          update: {}
        });
      }

      return pegawai;
    });
  }, {
    ...requirePermission('pegawai', 'create')
  })

  .put('/:id', async ({ params: { id }, body }) => {
    const { nip, jabatan, noHp, departemenId, programStudiId } = body as any;

    const pegawai = await prisma.pegawai.update({
      where: { id },
      data: {
        nip,
        jabatan,
        noHp,
        departemenId,
        programStudiId,
      },
      include: {
        user: true,
        programStudi: true,
        departemen: true,
      },
    });

    return pegawai;
  }, {
    ...requirePermission('pegawai', 'write')
  })

  .delete('/:id', async ({ params: { id } }) => {
    const peg = await prisma.pegawai.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!peg) {
      return { error: 'Pegawai not found' };
    }

    await prisma.$transaction(async (tx) => {
      // 1. Set ketuaProdiId to null in ProgramStudi if this pegawai is a ketuaProdi
      await tx.programStudi.updateMany({
        where: { ketuaProdiId: id },
        data: { ketuaProdiId: null }
      });

      // 2. Set adminProdiId and pegawaiUpaId to null in PengajuanSkl
      await tx.pengajuanSkl.updateMany({
        where: { adminProdiId: id },
        data: { adminProdiId: null }
      });

      await tx.pengajuanSkl.updateMany({
        where: { pegawaiUpaId: id },
        data: { pegawaiUpaId: null }
      });

      // 3. Delete Pegawai record
      await tx.pegawai.delete({
        where: { id }
      });

      // 4. Delete associated User Role
      await tx.userRole.deleteMany({
        where: { userId: peg.userId }
      });

      // 5. Delete associated User
      await tx.user.delete({
        where: { id: peg.userId }
      });
    });

    return { success: true, message: 'Pegawai and associated user deleted successfully' };
  }, {
    ...requirePermission('pegawai', 'delete')
  });
