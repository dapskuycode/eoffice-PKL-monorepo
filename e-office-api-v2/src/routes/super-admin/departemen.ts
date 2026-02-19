import { Elysia } from 'elysia';
import { Prisma as prisma } from '@backend/db/index.ts';
import { authGuardPlugin, requirePermission } from '@backend/middlewares/auth.ts';

export default new Elysia()
  .use(authGuardPlugin)
  // Get all departemen
  .get('/', async ({ query }) => {
    const { limit = '100' } = query as any;

    const departemen = await prisma.departemen.findMany({
      where: { deletedAt: null },
      take: parseInt(limit),
      orderBy: { name: 'asc' },
    });

    return { data: departemen };
  }, {
    ...requirePermission('departemen', 'read')
  })

  // Get single departemen
  .get('/:id', async ({ params: { id } }) => {
    const departemen = await prisma.departemen.findUnique({
      where: { id },
      include: {
        programStudi: true,
      },
    });

    if (!departemen) {
      return { error: 'Departemen not found' };
    }

    return departemen;
  }, {
    ...requirePermission('departemen', 'read')
  });
