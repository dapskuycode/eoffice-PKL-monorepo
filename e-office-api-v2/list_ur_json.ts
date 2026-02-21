import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    try {
        const ur = await prisma.userRole.findMany({
            where: {
                role: { name: 'super_admin' }
            },
            include: { user: true, role: true }
        });

        console.log(`JSON Result: ${JSON.stringify(ur, null, 2)}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
