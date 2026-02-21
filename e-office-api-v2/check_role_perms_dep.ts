import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    try {
        const rolePerms = await prisma.rolePermission.findMany({
            where: {
                permission: {
                    resource: 'departemen'
                }
            },
            include: {
                role: true,
                permission: true
            }
        });

        console.log(`Found ${rolePerms.length} RolePermissions for 'departemen'`);
        rolePerms.forEach(rp => {
            console.log(`Role: ${rp.role.name}, Permission: ${rp.permission.resource}:${rp.permission.action}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
