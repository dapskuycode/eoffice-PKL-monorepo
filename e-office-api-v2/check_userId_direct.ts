import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.user.findUnique({
            where: { id: 'cmlm8jpm70029b1okbg5rxsfn' }
        });

        console.log(`User ID: cmlm8jpm70029b1okbg5rxsfn`);
        if (user) {
            console.log(`FOUND! Email: ${user.email}, Name: ${user.name}`);
        } else {
            console.log("NOT FOUND!");
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
