import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    try {
        const role = await prisma.role.findUnique({ where: { name: 'super_admin' } });
        const perm = await prisma.permission.findUnique({
            where: { resource_action: { resource: 'mahasiswa', action: 'create' } }
        });

        if (!role || !perm) {
            console.log(`❌ Role or Permission missing. Role: ${!!role}, Perm: ${!!perm}`);
            return;
        }

        const link = await prisma.rolePermission.findUnique({
            where: {
                roleId_permissionId: {
                    roleId: role.id,
                    permissionId: perm.id
                }
            }
        });

        console.log(`Role: ${role.name} (ID: ${role.id})`);
        console.log(`Permission: ${perm.resource}:${perm.action} (ID: ${perm.id})`);
        console.log(`Link exists? ${!!link}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
