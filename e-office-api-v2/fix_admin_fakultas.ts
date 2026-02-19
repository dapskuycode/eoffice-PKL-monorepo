import { Prisma as prisma } from './src/db/index.ts';
import bcrypt from 'bcryptjs';

async function main() {
    console.log('=== CREATING/UPDATING ADMIN FAKULTAS ===\n');

    const password = await bcrypt.hash('password123', 10);

    // Get roles
    const adminSuratRole = await prisma.role.findUnique({ where: { name: 'admin_surat' } });
    const adminFakultasRole = await prisma.role.findUnique({ where: { name: 'admin_fakultas' } });

    if (!adminSuratRole || !adminFakultasRole) {
        console.log('❌ Roles not found!');
        return;
    }

    // Check if user exists
    let adminUser = await prisma.user.findUnique({
        where: { email: 'admin.fakultas@fsm.ac.id' }
    });

    if (!adminUser) {
        console.log('Creating new user: admin.fakultas@fsm.ac.id');

        // Create user with account
        adminUser = await prisma.user.create({
            data: {
                email: 'admin.fakultas@fsm.ac.id',
                name: 'Drs. Bambang Suryanto, M.Si',
                emailVerified: true
            }
        });

        // Create account separately
        await prisma.account.create({
            data: {
                userId: adminUser.id,
                providerId: 'credential',
                accountId: 'admin.fakultas@fsm.ac.id',
                password: password
            }
        });

        // Create pegawai profile
        await prisma.pegawai.create({
            data: {
                nip: '196805151993031001',
                jabatan: 'Admin Fakultas & Surat',
                noHp: '08123456701',
                userId: adminUser.id
            }
        });

        console.log('✅ User created!');
    } else {
        console.log('✅ User already exists:', adminUser.email);
    }

    // Assign both roles
    console.log('\nAssigning roles...');

    // Admin Fakultas role
    const hasAdminFak = await prisma.userRole.findFirst({
        where: {
            userId: adminUser.id,
            roleId: adminFakultasRole.id
        }
    });

    if (!hasAdminFak) {
        await prisma.userRole.create({
            data: {
                userId: adminUser.id,
                roleId: adminFakultasRole.id
            }
        });
        console.log('✅ Added admin_fakultas role');
    } else {
        console.log('✅ Already has admin_fakultas role');
    }

    // Admin Surat role
    const hasAdminSurat = await prisma.userRole.findFirst({
        where: {
            userId: adminUser.id,
            roleId: adminSuratRole.id
        }
    });

    if (!hasAdminSurat) {
        await prisma.userRole.create({
            data: {
                userId: adminUser.id,
                roleId: adminSuratRole.id
            }
        });
        console.log('✅ Added admin_surat role');
    } else {
        console.log('✅ Already has admin_surat role');
    }

    console.log('\n=== SUMMARY ===');
    console.log('Email: admin.fakultas@fsm.ac.id');
    console.log('Password: password123');
    console.log('Roles: admin_fakultas, admin_surat');
    console.log('Nama: Drs. Bambang Suryanto, M.Si');
}

main().finally(() => process.exit(0));
