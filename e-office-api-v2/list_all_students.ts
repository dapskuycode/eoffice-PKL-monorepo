import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    try {
        const students = await prisma.mahasiswa.findMany({
            include: {
                user: true
            }
        });

        console.log(`--- ALL ${students.length} STUDENTS ---`);
        students.forEach((s, i) => {
            console.log(`${i + 1}. NIM: ${s.nim}, Name: ${s.user.name}, Email: ${s.user.email}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
