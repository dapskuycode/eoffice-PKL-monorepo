import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    try {
        const usersWithoutRole = await prisma.user.findMany({
            where: {
                userRole: { none: {} }
            },
            orderBy: { createdAt: 'desc' },
            take: 15
        });

        console.log('--- RECENT USERS WITHOUT ROLES ---');
        usersWithoutRole.forEach(u => {
            console.log(`Email: ${u.email}, Name: ${u.name}, CreatedAt: ${u.createdAt}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
