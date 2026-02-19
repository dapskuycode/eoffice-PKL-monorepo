import { Elysia } from 'elysia';
import { Prisma as prisma } from '@backend/db/index.ts';
import { authGuardPlugin, requirePermission } from '@backend/middlewares/auth.ts';

export default new Elysia()
  .use(authGuardPlugin)
  // Assign role to user
  .post('/', async ({ body }) => {
    const { userId, roleId } = body as any;

    // Check if user-role already exists
    const existing = await prisma.userRole.findFirst({
      where: {
        userId,
        roleId,
      },
    });

    if (existing) {
      return { message: 'User already has this role', userRole: existing };
    }

    const userRole = await prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
      include: {
        user: true,
        role: true,
      },
    });

    return { message: 'Role assigned successfully', userRole };
  }, {
    ...requirePermission('role', 'write')
  })

  // Remove role from user
  .delete('/:userId/:roleId', async ({ params: { userId, roleId } }) => {
    await prisma.userRole.deleteMany({
      where: {
        userId,
        roleId,
      },
    });

    return { success: true, message: 'Role removed successfully' };
  }, {
    ...requirePermission('role', 'delete')
  })

  // Get user roles
  .get('/:userId', async ({ params: { userId } }) => {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: true,
      },
    });

    return { data: userRoles };
  }, {
    ...requirePermission('role', 'read')
  });
