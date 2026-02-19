import { Prisma as prisma } from './src/db/index.ts';

async function main() {
    console.log('=== UPDATING USER ROLES ===\n');

    // Get the roles
    const stafFakRole = await prisma.role.findUnique({ where: { name: 'staf_fakultas' } });
    const manajerTuRole = await prisma.role.findUnique({ where: { name: 'manajer_tu' } });

    if (!stafFakRole || !manajerTuRole) {
        console.log('❌ Roles not found! Run create_missing_roles.ts first');
        return;
    }

    // Get the users
    const stafFakUser = await prisma.user.findUnique({
        where: { email: 'staf.fakultas@fsm.ac.id' },
        include: { userRole: true }
    });

    const manajerTuUser = await prisma.user.findUnique({
        where: { email: 'manajer.tu@fsm.ac.id' },
        include: { userRole: true }
    });

    // Update Staf Fakultas role
    if (stafFakUser) {
        const hasRole = stafFakUser.userRole.some(ur => ur.roleId === stafFakRole.id);
        if (!hasRole) {
            await prisma.userRole.create({
                data: {
                    userId: stafFakUser.id,
                    roleId: stafFakRole.id
                }
            });
            console.log('✅ Updated role for staf.fakultas@fsm.ac.id');
        } else {
            console.log('✅ staf.fakultas@fsm.ac.id already has correct role');
        }
    } else {
        console.log('⚠️  User staf.fakultas@fsm.ac.id not found');
    }

    // Update Manajer TU role
    if (manajerTuUser) {
        const hasRole = manajerTuUser.userRole.some(ur => ur.roleId === manajerTuRole.id);
        if (!hasRole) {
            await prisma.userRole.create({
                data: {
                    userId: manajerTuUser.id,
                    roleId: manajerTuRole.id
                }
            });
            console.log('✅ Updated role for manajer.tu@fsm.ac.id');
        } else {
            console.log('✅ manajer.tu@fsm.ac.id already has correct role');
        }
    } else {
        console.log('⚠️  User manajer.tu@fsm.ac.id not found');
    }

    console.log('\n=== DONE ===');
}

main().finally(() => process.exit(0));
