
import { PrismaClient } from './src/generated/prisma';

const prisma = new PrismaClient();

async function seedPermissions() {
    console.log('Seeding permissions...');

    // Define resources and actions
    const resources = ['user', 'mahasiswa', 'pegawai', 'surat', 'departemen', 'prodi', 'role', 'permission'];
    const actions = ['read', 'create', 'write', 'delete'];

    const allPerms = [];
    for (const res of resources) {
        for (const act of actions) {
            allPerms.push({ resource: res, action: act });
        }
    }

    // Create permissions
    for (const p of allPerms) {
        await prisma.permission.upsert({
            where: { resource_action: { resource: p.resource, action: p.action } },
            update: {},
            create: p
        });
    }

    console.log('✅ Permissions upserted');

    // Get super_admin role
    const superAdminRole = await prisma.role.findUnique({
        where: { name: 'super_admin' }
    });

    if (!superAdminRole) {
        console.error('❌ Role super_admin not found!');
        return;
    }

    // Assign all permissions to super_admin
    const permissions = await prisma.permission.findMany();
    for (const p of permissions) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: superAdminRole.id,
                    permissionId: p.id
                }
            },
            update: {},
            create: {
                roleId: superAdminRole.id,
                permissionId: p.id
            }
        });
    }

    console.log('✅ All permissions assigned to super_admin');
}

seedPermissions()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
