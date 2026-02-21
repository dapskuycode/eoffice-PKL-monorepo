import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    try {
        const ur = await prisma.userRole.findFirst({
            include: { user: true, role: true }
        });

        console.log(`Sample UserRole:`);
        if (ur) {
            console.log(`User ID: ${ur.user.id}, Email: ${ur.user.email}`);
            console.log(`Role: ${ur.role.name}`);
        } else {
            console.log("No UserRole entries found!");
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
