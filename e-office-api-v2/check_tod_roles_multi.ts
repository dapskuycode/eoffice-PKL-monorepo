import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    try {
        const userRoles = await prisma.userRole.findMany({
            where: {
                user: { email: 'tod@gmail.com' }
            },
            include: {
                user: true,
                role: true
            }
        });

        console.log(`Found ${userRoles.length} role assignments for tod@gmail.com`);
        userRoles.forEach(ur => {
            console.log(`- UserID: ${ur.user.id}, Role: ${ur.role.name}, UR_ID: ${ur.id}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
