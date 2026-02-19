import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSupervisor() {
    try {
        const supervisor = await prisma.user.findUnique({
            where: { email: 'supervisor@akademik.ac.id' },
            include: {
                pegawai: true,
                userRole: {
                    include: {
                        role: true
                    }
                }
            }
        });

        console.log('\n📋 Supervisor User Data:');
        console.log('Email:', supervisor?.email);
        console.log('Name:', supervisor?.name);
        console.log('Pegawai:', supervisor?.pegawai);
        console.log('Roles:', supervisor?.userRole.map(ur => ur.role.name));

        // Test the /me endpoint logic
        const roles = supervisor?.userRole.map(ur => ur.role.name) || [];
        const nama = supervisor?.mahasiswa?.nama || supervisor?.name || supervisor?.email;

        console.log('\n✅ What /me endpoint should return:');
        console.log('nama:', nama);
        console.log('roles:', roles);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkSupervisor();
