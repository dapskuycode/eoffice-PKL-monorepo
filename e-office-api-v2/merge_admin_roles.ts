import { Prisma as prisma } from './src/db/index.ts';

async function main() {
    console.log('=== MERGING ADMIN SURAT & ADMIN FAKULTAS ===\n');

    // Get roles
    const adminSuratRole = await prisma.role.findUnique({ where: { name: 'admin_surat' } });
    const adminFakultasRole = await prisma.role.findUnique({ where: { name: 'admin_fakultas' } });

    if (!adminSuratRole || !adminFakultasRole) {
        console.log('❌ Roles not found!');
        return;
    }

    // Get admin fakultas user
    const adminFakUser = await prisma.user.findUnique({
        where: { email: 'admin.fakultas@fsm.ac.id' },
        include: { userRole: true }
    });

    if (!adminFakUser) {
        console.log('❌ User admin.fakultas@fsm.ac.id not found!');
        return;
    }

    console.log(`Found user: ${adminFakUser.name} (${adminFakUser.email})`);

    // Check if already has admin_surat role
    const hasAdminSurat = adminFakUser.userRole.some(ur => ur.roleId === adminSuratRole.id);

    if (!hasAdminSurat) {
        console.log('\nAdding admin_surat role...');
        await prisma.userRole.create({
            data: {
                userId: adminFakUser.id,
                roleId: adminSuratRole.id
            }
        });
        console.log('✅ admin_surat role added!');
    } else {
        console.log('✅ User already has admin_surat role');
    }

    // Show final roles
    const updatedUser = await prisma.user.findUnique({
        where: { email: 'admin.fakultas@fsm.ac.id' },
        include: {
            userRole: {
                include: {
                    role: true
                }
            }
        }
    });

    console.log('\n=== FINAL ROLES FOR admin.fakultas@fsm.ac.id ===');
    updatedUser?.userRole.forEach(ur => {
        console.log(`- ${ur.role.name}`);
    });

    console.log('\n✅ Done! User admin.fakultas@fsm.ac.id now has both admin_fakultas and admin_surat roles.');
}

main().finally(() => process.exit(0));
