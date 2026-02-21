import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    try {
        const students = await prisma.mahasiswa.findMany({
            orderBy: { id: 'desc' }, // Assuming CUIDs are somewhat chronological or just to get the last ones
            take: 10,
            include: {
                user: true,
                programStudi: true
            }
        });

        console.log('--- RECENT STUDENTS ---');
        students.forEach(s => {
            console.log(`ID: ${s.id}, NIM: ${s.nim}, Name: ${s.user.name}, Email: ${s.user.email}`);
        });

        const totalCount = await prisma.mahasiswa.count();
        console.log(`Total students: ${totalCount}`);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
