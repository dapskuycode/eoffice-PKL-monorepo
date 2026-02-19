import { Prisma as prisma } from './src/db/index.ts';

async function main() {
    console.log('--- FIXING SUPER ADMIN PERMISSIONS ---');

    // 1. Get super_admin role
    const superAdminRole = await prisma.role.findUnique({
        where: { name: 'super_admin' }
    });

    if (!superAdminRole) {
        console.log('ERROR: super_admin role not found!');
        return;
    }

    console.log('Found super_admin role:', superAdminRole.id);

    // 2. Get ALL permissions
    const allPermissions = await prisma.permission.findMany();
    console.log('Total permissions in DB:', allPermissions.length);

    // 3. Assign ALL permissions to super_admin
    let added = 0;
    let skipped = 0;

    for (const perm of allPermissions) {
        const existing = await prisma.rolePermission.findUnique({
            where: {
                roleId_permissionId: {
                    roleId: superAdminRole.id,
                    permissionId: perm.id
                }
            }
        });

        if (!existing) {
            await prisma.rolePermission.create({
                data: {
                    roleId: superAdminRole.id,
                    permissionId: perm.id
                }
            });
            console.log(`✓ Added: ${perm.action}:${perm.resource}`);
            added++;
        } else {
            skipped++;
        }
    }

    console.log('\n--- SUMMARY ---');
    console.log('Added:', added);
    console.log('Skipped (already exists):', skipped);
    console.log('Total:', allPermissions.length);
    console.log('\n⚠️  RESTART BACKEND to reload Casbin policies!');
}

main().finally(() => process.exit(0));
