import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        console.log('--- RECENT USERS ---');
        users.forEach((u, i) => {
            console.log(`${i + 1}. Email: ${u.email}, Name: ${u.name}, CreatedAt: ${u.createdAt}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
