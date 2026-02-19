import { Prisma as prisma } from './src/db/index.ts';
import { getEnforcer } from './src/lib/casbin.ts';

async function main() {
    // Cari user yang baru login (asumsi: user terakhir yang punya session)
    const latestSession = await prisma.session.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { user: true }
    });

    if (!latestSession) {
        console.log('NO active session found');
        return;
    }

    const user = latestSession.user;
    console.log('--- CURRENT USER CHECK ---');
    console.log('User:', user.email);
    console.log('User ID:', user.id);

    // Cek roles
    const userRoles = await prisma.userRole.findMany({
        where: { userId: user.id },
        include: { role: true }
    });

    console.log('Roles:', userRoles.map(ur => ur.role.name).join(', '));

    // Cek permission via Casbin
    const enforcer = await getEnforcer();
    const canReadMahasiswa = await enforcer.enforce(user.id, 'mahasiswa', 'read');

    console.log('Can read mahasiswa?', canReadMahasiswa);

    // Cek semua permissions untuk super_admin role
    const saRole = userRoles.find(ur => ur.role.name === 'super_admin');
    if (saRole) {
        const perms = await enforcer.getPermissionsForUser('super_admin');
        console.log('Super Admin permissions:', perms);
    }
}

main().finally(() => process.exit(0));
