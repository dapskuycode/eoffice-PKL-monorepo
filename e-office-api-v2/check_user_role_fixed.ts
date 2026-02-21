import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    try {
        const roles = await prisma.userRole.findMany({
            where: { userId: 'cmlm8jpm70029b1okb4hsiqe' },
            include: { role: true }
        });

        console.log(`User ID: cmlm8jpm70029b1okb4hsiqe`);
        roles.forEach(r => {
            console.log(`Role: ${r.role.name}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
