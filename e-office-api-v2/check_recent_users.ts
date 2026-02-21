import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    try {
        const oneHourAgo = new Date(Date.now() - 3600000);
        const recentUsers = await prisma.user.findMany({
            where: {
                createdAt: {
                    gt: oneHourAgo
                }
            },
            include: {
                mahasiswa: true,
                userRole: { include: { role: true } }
            }
        });

        console.log(`Found ${recentUsers.length} users created in the last hour.`);
        recentUsers.forEach(u => {
            console.log(`- Email: ${u.email}, Name: ${u.name}, Roles: ${u.userRole.map(ur => ur.role.name).join(', ')}, Has Mhs Profile: ${!!u.mahasiswa}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
