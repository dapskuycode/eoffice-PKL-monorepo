import { Prisma as prisma } from './src/db/index.ts';

async function main() {
    const email = 'test_failed_creation@test.com';
    const name = 'Test Failed Student';

    console.log('--- TEST CREATION START ---');

    try {
        // 1. Ensure user exists (simulate what frontend does)
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    emailVerified: true
                }
            });
            console.log('Created user:', user.id);
        } else {
            console.log('User already exists:', user.id);
        }

        // 2. Try to create mahasiswa profile using the logic from mahasiswa.ts
        // I'll grab a valid departemen and prodi first
        const prodi = await prisma.programStudi.findFirst();
        if (!prodi) throw new Error('No Prodi found in DB');

        const body = {
            nim: 'TEST_NIM_123',
            tahunMasuk: '2024',
            noHp: '08123',
            email: user.email,
            userId: user.id,
            departemenId: prodi.departemenId,
            programStudiId: prodi.id
        };

        // Simulate transaction logic
        const result = await prisma.$transaction(async (tx) => {
            // Logic from mahasiswa.ts POST
            const existingMhs = await tx.mahasiswa.findUnique({ where: { userId: user.id } });
            if (existingMhs) throw new Error('Mahasiswa profile already exists');

            const mhs = await tx.mahasiswa.create({
                data: {
                    nim: body.nim,
                    tahunMasuk: body.tahunMasuk,
                    noHp: body.noHp,
                    userId: user.id,
                    departemenId: body.departemenId,
                    programStudiId: body.programStudiId,
                }
            });

            const mhsRole = await tx.role.findUnique({ where: { name: 'mahasiswa' } });
            if (mhsRole) {
                await tx.userRole.upsert({
                    where: { userId_roleId: { userId: user.id, roleId: mhsRole.id } },
                    create: { userId: user.id, roleId: mhsRole.id },
                    update: {}
                });
            }
            return mhs;
        });

        console.log('SUCCESSLY created mahasiswa:', result.nim);

    } catch (error: any) {
        console.error('FAILED during simulation:', error.message);
    }
}

main().finally(() => process.exit(0));
