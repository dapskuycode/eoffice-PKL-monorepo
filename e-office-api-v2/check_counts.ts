import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    try {
        const userCount = await prisma.user.count();
        const studentsCount = await prisma.mahasiswa.count();

        console.log(`Total users: ${userCount}`);
        console.log(`Total students: ${studentsCount}`);

        const recentUsers = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        console.log('--- RECENT USERS ---');
        recentUsers.forEach(u => {
            console.log(`ID: ${u.id}, Email: ${u.email}, CreatedAt: ${u.createdAt}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
