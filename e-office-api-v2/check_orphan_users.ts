import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    try {
        const usersWithMhsRole = await prisma.user.findMany({
            where: {
                userRole: {
                    some: {
                        role: {
                            name: 'mahasiswa'
                        }
                    }
                },
                mahasiswa: null
            },
            include: {
                userRole: {
                    include: {
                        role: true
                    }
                }
            }
        });

        console.log(`Found ${usersWithMhsRole.length} users with 'mahasiswa' role but NO Mahasiswa profile.`);
        usersWithMhsRole.forEach(u => {
            console.log(`- ${u.email} (${u.name})`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
