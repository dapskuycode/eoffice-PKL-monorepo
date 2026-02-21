import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    try {
        const role = await prisma.role.findUnique({
            where: { name: 'super_admin' },
            include: {
                rolePermission: {
                    include: {
                        permission: true
                    }
                }
            }
        });

        if (!role) {
            console.log("❌ Role 'super_admin' not found");
            return;
        }

        console.log(`Role: ${role.name}`);
        console.log(`Permissions (${role.rolePermission.length}):`);
        role.rolePermission.forEach(rp => {
            console.log(`- ${rp.permission.resource}:${rp.permission.action}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
