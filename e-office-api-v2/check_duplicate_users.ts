import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany({
            where: { email: 'superadmin@system.ac.id' }
        });

        console.log(`Found ${users.length} users with email superadmin@system.ac.id`);
        users.forEach(u => {
            console.log(`ID: ${u.id}, Name: ${u.name}, CreatedAt: ${u.createdAt}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
