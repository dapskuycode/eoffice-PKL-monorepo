import { Prisma as prisma } from './src/db/index.ts';

async function main() {
    console.log('--- USER ROLE CHECK ---');

    // Get latest session user
    const latestSession = await prisma.session.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { user: true }
    });

    if (!latestSession) {
        console.log('No active session');
        return;
    }

    const user = latestSession.user;
    console.log('Current user:', user.email);

    // Check roles
    const userRoles = await prisma.userRole.findMany({
        where: { userId: user.id },
        include: { role: true }
    });

    console.log('Roles:', userRoles.map(ur => ur.role.name));

    // Check if super_admin role exists
    const saRole = await prisma.role.findUnique({ where: { name: 'super_admin' } });
    if (!saRole) {
        console.log('ERROR: super_admin role not found!');
        return;
    }

    // Check if user has super_admin
    const hasSuperAdmin = userRoles.some(ur => ur.role.name === 'super_admin');

    if (!hasSuperAdmin) {
        console.log('\n⚠️  USER DOES NOT HAVE SUPER_ADMIN ROLE!');
        console.log('Assigning super_admin role...');

        await prisma.userRole.create({
            data: {
                userId: user.id,
                roleId: saRole.id
            }
        });

        console.log('✓ Super admin role assigned!');
        console.log('⚠️  RESTART BACKEND to reload Casbin!');
    } else {
        console.log('✓ User already has super_admin role');
        console.log('⚠️  Just RESTART BACKEND to reload Casbin!');
    }
}

main().finally(() => process.exit(0));
