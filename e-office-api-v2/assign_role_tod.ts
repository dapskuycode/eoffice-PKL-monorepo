import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.user.findFirst({
            where: { email: 'tod@gmail.com' }
        });

        const role = await prisma.role.findFirst({
            where: { name: 'super_admin' }
        });

        if (!user || !role) {
            console.log(`❌ User or Role missing. User: ${!!user}, Role: ${!!role}`);
            return;
        }

        await prisma.userRole.upsert({
            where: {
                userId_roleId: {
                    userId: user.id,
                    roleId: role.id
                }
            },
            update: {},
            create: {
                userId: user.id,
                roleId: role.id
            }
        });

        console.log(`✅ Assigned 'super_admin' role to ${user.email}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
