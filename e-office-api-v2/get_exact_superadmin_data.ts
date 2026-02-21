import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'superadmin@system.ac.id' }
        });

        if (user) {
            console.log(`User Email: ${user.email}`);
            console.log(`User ID (char count ${user.id.length}): [${user.id}]`);

            const roles = await prisma.userRole.findMany({
                where: { userId: user.id },
                include: { role: true }
            });
            console.log(`Roles found: ${roles.length}`);
            roles.forEach(r => console.log(`- ${r.role.name}`));

        } else {
            console.log("User not found!");
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
