import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany({
            where: {
                name: { contains: 'Super' }
            },
            include: {
                userRole: { include: { role: true } }
            }
        });

        console.log(`Found ${users.length} users with 'Super' in name`);
        users.forEach(u => {
            console.log(`Email: ${u.email}, Name: ${u.name}, Roles: ${u.userRole.map(ur => ur.role.name).join(', ')}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
