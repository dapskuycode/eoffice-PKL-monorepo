import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.mahasiswa.count();
        const students = await prisma.mahasiswa.findMany({
            take: 5,
            include: {
                user: true,
                programStudi: true
            }
        });

        console.log(`Total students: ${count}`);
        console.log('Sample students counts:', students.length);
        if (students.length > 0) {
            console.log('Sample student NIM:', students[0].nim);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
