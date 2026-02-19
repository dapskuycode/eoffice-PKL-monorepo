import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    try {
        const permissions = await prisma.permission.findMany();
        const roles = await prisma.role.findMany({
            include: {
                permissions: {
                    include: {
                        permission: true
                    }
                }
            }
        });

        const result = {
            all_permissions: permissions.map(p => `${p.resource}:${p.action}`),
            role_permissions: roles.map(role => ({
                role: role.name,
                perms: role.permissions.map(rp => `${rp.permission.resource}:${rp.permission.action}`)
            }))
        };

        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
