import { Elysia, t } from 'elysia';
import { Prisma as prisma } from '@backend/db/index.ts';
import { authGuardPlugin, requirePermission } from '@backend/middlewares/auth.ts';

export default new Elysia()
  .use(authGuardPlugin)
  // Get all mahasiswa with pagination and search
  .get('/', async ({ query }) => {
    const { page = '1', limit = '10', search = '', prodiId = '', tahun = '' } = query as any;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {};

    if (search) {
      where.OR = [
        { nim: { contains: search, mode: 'insensitive' as const } },
        { user: { name: { contains: search, mode: 'insensitive' as const } } },
        { user: { email: { contains: search, mode: 'insensitive' as const } } },
      ];
    }

    if (prodiId) {
      where.programStudiId = prodiId;
    }

    if (tahun) {
      where.tahunMasuk = tahun;
    }

    console.log('--- MAHASISWA GET DEBUG ---');
    console.log('Query:', query);
    console.log('Where:', JSON.stringify(where, null, 2));

    const [mahasiswa, total] = await Promise.all([
      prisma.mahasiswa.findMany({
        where,
        include: {
          user: true,
          programStudi: {
            include: {
              departemen: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { nim: 'desc' },
      }),
      prisma.mahasiswa.count({ where }),
    ]);

    console.log('Result total:', total);
    console.log('Result length:', mahasiswa.length);

    return {
      data: mahasiswa,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }, {
    ...requirePermission('mahasiswa', 'read')
  })

  // Get single mahasiswa
  .get('/:id', async ({ params: { id } }) => {
    const mahasiswa = await prisma.mahasiswa.findUnique({
      where: { id },
      include: {
        user: true,
        programStudi: {
          include: {
            departemen: true,
          },
        },
      },
    });

    if (!mahasiswa) {
      return { error: 'Mahasiswa not found' };
    }

    return mahasiswa;
  }, {
    ...requirePermission('mahasiswa', 'read')
  })

  // Create mahasiswa (Atomic)
  .post('/', async ({ body }) => {
    const {
      nim,
      tahunMasuk,
      noHp,
      alamat,
      tempatLahir,
      tanggalLahir,
      departemenId,
      programStudiId,
      email,
      password,
      name,
      userId: existingUserId // Optional: if already created via auth
    } = body as any;

    if (!departemenId || !programStudiId) {
      return { error: 'Bad Request', message: 'Departemen and Program Studi are required' };
    }

    return await prisma.$transaction(async (tx) => {
      let finalUserId = existingUserId;

      // 1. If no userId provided, check if user exists or create one
      // Note: We'll assume the user might have been partially created (User exists but no profile)
      if (!finalUserId) {
        let user = await tx.user.findUnique({ where: { email } });

        if (!user) {
          // If we want to create a user safely with better-auth, we'd ideally use its API.
          // For now, if user doesn't exist, we might still need to use the signUp API from frontend
          // OR we can create a placeholder and the user will have to use "Forgot Password".
          // BUT the user needs to log in.
          // To keep it simple, we'll try to reuse the user if they were partially created.
          return { error: 'Conflict', message: 'User must be created via sign-up API first or provide existing userId' };
        }
        finalUserId = user.id;
      }

      // Check if student profile already exists
      const existingMhs = await tx.mahasiswa.findUnique({ where: { userId: finalUserId } });
      if (existingMhs) {
        return { error: 'Conflict', message: 'Mahasiswa profile already exists for this user' };
      }

      // 2. Create mahasiswa record
      const mahasiswa = await tx.mahasiswa.create({
        data: {
          nim,
          tahunMasuk,
          noHp,
          alamat,
          tempatLahir,
          tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
          userId: finalUserId,
          departemenId,
          programStudiId,
        },
        include: {
          user: true,
          programStudi: {
            include: {
              departemen: true,
            },
          },
        },
      });

      // 3. Assign mahasiswa role
      const mhsRole = await tx.role.findUnique({ where: { name: 'mahasiswa' } });
      if (mhsRole) {
        await tx.userRole.upsert({
          where: {
            userId_roleId: {
              userId: finalUserId,
              roleId: mhsRole.id
            }
          },
          create: {
            userId: finalUserId,
            roleId: mhsRole.id,
          },
          update: {} // No change needed if already exists
        });
      }

      return mahasiswa;
    });
  }, {
    ...requirePermission('mahasiswa', 'create')
  })

  // Update mahasiswa
  .put('/:id', async ({ params: { id }, body }) => {
    const {
      nim,
      tahunMasuk,
      noHp,
      alamat,
      tempatLahir,
      tanggalLahir,
      departemenId,
      programStudiId,
    } = body as any;

    const mahasiswa = await prisma.mahasiswa.update({
      where: { id },
      data: {
        nim,
        tahunMasuk,
        noHp,
        alamat,
        tempatLahir,
        tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
        departemenId,
        programStudiId,
      },
      include: {
        user: true,
        programStudi: {
          include: {
            departemen: true,
          },
        },
      },
    });

    return mahasiswa;
  }, {
    ...requirePermission('mahasiswa', 'write')
  })

  // Delete mahasiswa
  .delete('/:id', async ({ params: { id } }) => {
    const mhs = await prisma.mahasiswa.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!mhs) {
      return { error: 'Mahasiswa not found' };
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete Lampiran & Riwayat for all PengajuanSkl of this mahasiswa
      const submissions = await tx.pengajuanSkl.findMany({
        where: { mahasiswaId: id },
        select: { id: true }
      });

      const subIds = submissions.map(s => s.id);

      if (subIds.length > 0) {
        await tx.lampiranSkl.deleteMany({
          where: { pengajuanSklId: { in: subIds } }
        });

        await tx.riwayatPengajuanSkl.deleteMany({
          where: { pengajuanSklId: { in: subIds } }
        });

        await tx.pengajuanSkl.deleteMany({
          where: { id: { in: subIds } }
        });
      }

      // 2. Delete Mahasiswa record
      await tx.mahasiswa.delete({
        where: { id }
      });

      // 3. Delete associated User Role
      await tx.userRole.deleteMany({
        where: { userId: mhs.userId }
      });

      // 4. Delete associated User (Account & Session will cascade)
      await tx.user.delete({
        where: { id: mhs.userId }
      });
    });

    return { success: true, message: 'Mahasiswa and associated user deleted successfully' };
  }, {
    ...requirePermission('mahasiswa', 'delete')
  });
