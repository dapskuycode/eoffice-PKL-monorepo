import { Prisma as prisma } from './src/db/index.ts';

async function main() {
    console.log('=== REMOVING ADMIN SURAT ROLE ===\n');

    // Get roles
    const adminSuratRole = await prisma.role.findUnique({ where: { name: 'admin_surat' } });

    if (!adminSuratRole) {
        console.log('❌ admin_surat role not found!');
        return;
    }

    // Get user
    const adminUser = await prisma.user.findUnique({
        where: { email: 'admin.fakultas@fsm.ac.id' },
        include: {
            userRole: {
                include: {
                    role: true
                }
            }
        }
    });

    if (!adminUser) {
        console.log('❌ User not found!');
        return;
    }

    console.log('User:', adminUser.email);
    console.log('Current roles:', adminUser.userRole.map(ur => ur.role.name).join(', '));

    // Find and delete admin_surat role
    const adminSuratUserRole = adminUser.userRole.find(ur => ur.roleId === adminSuratRole.id);

    if (adminSuratUserRole) {
        await prisma.userRole.delete({
            where: {
                id: adminSuratUserRole.id
            }
        });
        console.log('\n✅ Removed admin_surat role');
    } else {
        console.log('\n✅ User does not have admin_surat role');
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

    console.log('\n=== FINAL ROLES ===');
    updatedUser?.userRole.forEach(ur => {
        console.log(`- ${ur.role.name}`);
    });
}

main().finally(() => process.exit(0));
