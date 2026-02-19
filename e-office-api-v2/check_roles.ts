import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    try {
        const roles = await prisma.role.findMany({
            include: {
                users: {
                    include: {
                        user: true
                    }
                }
            }
        });

        console.log('--- ROLES AND USERS ---');
        roles.forEach(role => {
            console.log(`Role: ${role.name}`);
            role.users.forEach(ur => {
                console.log(` - User: ${ur.user.email} (${ur.user.name})`);
            });
        });

        const permissions = await prisma.permission.findMany();
        console.log('--- PERMISSIONS ---');
        console.log(`Total permissions: ${permissions.length}`);

        // Check if 'mahasiswa' 'read' permission exists
        const mhsRead = permissions.find(p => p.resource === 'mahasiswa' && p.action === 'read');
        console.log('Mahasiswa read permission exists:', !!mhsRead);
        if (mhsRead) {
            const rolePerms = await prisma.rolePermission.findMany({
                where: { permissionId: mhsRead.id },
                include: { role: true }
            });
            console.log('Roles with mahasiswa read permission:', rolePerms.map(rp => rp.role.name));
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
