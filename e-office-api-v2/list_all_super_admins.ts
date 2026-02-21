import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    try {
        const userRoles = await prisma.userRole.findMany({
            where: {
                role: { name: 'super_admin' }
            },
            include: {
                user: true,
                role: true
            }
        });

        console.log(`Found ${userRoles.length} users with 'super_admin' role`);
        userRoles.forEach(ur => {
            console.log(`ID: ${ur.user.id}, Email: ${ur.user.email}, Name: ${ur.user.name}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
