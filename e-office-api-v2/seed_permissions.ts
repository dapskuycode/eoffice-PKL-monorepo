import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding missing permissions for Super Admin...");

    const resources = [
        'mahasiswa',
        'prodi',
        'pegawai',
        'surat',
        'departemen',
        'user',
        'role',
        'letterType',
        'letterTemplate',
        'letter'
    ];

    const actions = ['read', 'create', 'write', 'delete', 'update', 'numbering', 'disposition', 'forward', 'file', 'editOverlay'];

    // 1. Ensure Roles exist
    const superAdminRoleNames = ['super_admin', 'superadmin'];
    const superAdminRoles = [];

    for (const name of superAdminRoleNames) {
        const role = await prisma.role.upsert({
            where: { name },
            update: {},
            create: { name }
        });
        superAdminRoles.push(role);
        console.log(`✅ Role ensured: ${name}`);
    }

    // 2. Create Permissions
    console.log("Creating/Updating permissions...");
    const allPerms = [];

    for (const resource of resources) {
        for (const action of actions) {
            // Some combinations might not make sense but safe to have for super admin
            try {
                const perm = await prisma.permission.upsert({
                    where: {
                        resource_action: { resource, action }
                    },
                    update: {},
                    create: { resource, action }
                });
                allPerms.push(perm);
            } catch (e) {
                // Silently skip if DB constraints or logic prevents it
            }
        }
    }
    console.log(`✅ ${allPerms.length} permissions ensured.`);

    // 3. Assign Permissions to Roles
    console.log("Assigning permissions to roles...");
    let count = 0;
    for (const role of superAdminRoles) {
        for (const perm of allPerms) {
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: role.id,
                        permissionId: perm.id
                    }
                },
                update: {},
                create: {
                    roleId: role.id,
                    permissionId: perm.id
                }
            });
            count++;
        }
    }

    console.log(`✅ Assigned ${count} permissions to super admin roles.`);
    console.log("✨ Seeding completed successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Error seeding permissions:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
