import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        include: {
            userRole: {
                include: {
                    role: true
                }
            }
        }
    });

    console.log("--- USERS & ROLES ---");
    for (const u of users) {
        const roleNames = u.userRole.map(ur => ur.role.name);
        console.log(`Email: ${u.email} | Roles: ${roleNames.join(", ")}`);
    }

    const students = await prisma.mahasiswa.findMany({
        include: {
            user: true,
            departemen: true,
            programStudi: true
        }
    });

    console.log("\n--- STUDENTS BY DEPT ---");
    for (const s of students) {
        console.log(`Dept: ${s.departemen?.name} | Email: ${s.user.email} | NIM: ${s.nim} | Name: ${s.user.name}`);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
