import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany({
            where: { name: { contains: 'Super' } }
        });

        console.log(`Found ${users.length} users`);
        users.forEach(u => {
            console.log(`Email: ${u.email}, Name: ${u.name}, ID: ${u.id}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
