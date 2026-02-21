import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    try {
        const userRoles = await prisma.userRole.findMany({
            include: {
                user: true,
                role: true
            }
        });

        console.log(`Total UserRole entries: ${userRoles.length}`);
        const superAdmins = userRoles.filter(ur => ur.role.name.includes('super'));

        console.log(`Users with 'super' in role name: ${superAdmins.length}`);
        superAdmins.forEach(ur => {
            console.log(`Role: ${ur.role.name}, UserEmail: ${ur.user?.email}, UserID: ${ur.userId}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
