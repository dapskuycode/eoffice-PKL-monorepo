import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    try {
        const roles = await prisma.role.findMany({
            include: {
                users: {
                    include: {
                        user: true
                    }
                }
            }
        });

        console.log('--- ROLE DISTRIBUTION ---');
        roles.forEach(role => {
            console.log(`Role: ${role.name}, Count: ${role.users.length}`);
        });

        const usersWithoutRole = await prisma.user.findMany({
            where: {
                userRole: {
                    none: {}
                }
            }
        });
        console.log(`Users without any role: ${usersWithoutRole.length}`);
        usersWithoutRole.forEach(u => {
            console.log(`- ${u.email} (${u.name})`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
