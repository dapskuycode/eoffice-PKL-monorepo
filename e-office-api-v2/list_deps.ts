import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    try {
        const deps = await prisma.departemen.findMany();
        console.log(`Total Departemen: ${deps.length}`);
        deps.forEach(d => {
            console.log(`ID: ${d.id}, Name: ${d.name}, DeletedAt: ${d.deletedAt}`);
        });
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
