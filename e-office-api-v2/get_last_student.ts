import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    try {
        const lastStudent = await prisma.mahasiswa.findFirst({
            orderBy: { id: 'desc' },
            include: {
                user: true
            }
        });

        if (lastStudent) {
            console.log('--- LAST STUDENT IN DB ---');
            console.log(`ID: ${lastStudent.id}`);
            console.log(`NIM: ${lastStudent.nim}`);
            console.log(`Name: ${lastStudent.user.name}`);
            console.log(`Email: ${lastStudent.user.email}`);
            console.log(`User CreatedAt: ${lastStudent.user.createdAt}`);
        } else {
            console.log('No students found in DB.');
        }

        const totalStudents = await prisma.mahasiswa.count();
        console.log(`Total count: ${totalStudents}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
