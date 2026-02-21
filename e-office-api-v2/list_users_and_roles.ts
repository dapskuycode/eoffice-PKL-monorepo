import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany({
            include: {
                userRole: { include: { role: true } }
            }
        });

        console.log(`Total users: ${users.length}`);
        users.forEach(u => {
            const roles = u.userRole.map(ur => ur.role.name).join(', ');
            console.log(`ID: ${u.id}, Email: ${u.email}, Name: ${u.name}, Roles: [${roles}]`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
