import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    const testEmail = `test_student_${Date.now()}@example.com`;
    const testNim = `TEST${Math.floor(Math.random() * 10000)}`;

    try {
        console.log(`Starting test student creation: ${testEmail}`);

        // Get a valid dept and prodi
        const prodi = await prisma.programStudi.findFirst();
        if (!prodi) {
            console.error('No prodi found in DB');
            return;
        }

        // Since I can't easily call better-auth sign-up from here (needs session/secret),
        // I'll simulate what the backend route expects: an existing user.
        const user = await prisma.user.create({
            data: {
                email: testEmail,
                name: "Test Student",
                emailVerified: true
            }
        });
        console.log(`User created: ${user.id}`);

        // Now call the backend logic directly (mocking the context)
        // Actually, I'll just run the same prisma logic as in the route.
        await prisma.$transaction(async (tx) => {
            const mahasiswa = await tx.mahasiswa.create({
                data: {
                    nim: testNim,
                    tahunMasuk: '2024',
                    noHp: '08123456789',
                    userId: user.id,
                    departemenId: prodi.departemenId,
                    programStudiId: prodi.id,
                }
            });
            console.log(`Mahasiswa profile created: ${mahasiswa.id}`);

            const mhsRole = await tx.role.findUnique({ where: { name: 'mahasiswa' } });
            if (mhsRole) {
                await tx.userRole.create({
                    data: {
                        userId: user.id,
                        roleId: mhsRole.id,
                    }
                });
                console.log(`Role 'mahasiswa' assigned.`);
            }
        });

        console.log('✅ Test student creation successful!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
