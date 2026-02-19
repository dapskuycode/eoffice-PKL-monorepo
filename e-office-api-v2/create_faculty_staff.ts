import { Prisma as prisma } from './src/db/index.ts';
import bcrypt from 'bcryptjs';

async function main() {
    console.log('=== CREATING FACULTY STAFF ACCOUNTS ===\n');

    const password = await bcrypt.hash('password123', 10);

    // Get roles
    const roles = await prisma.role.findMany({
        where: {
            name: {
                in: ['admin_fakultas', 'staf_fakultas', 'manajer_tu']
            }
        }
    });

    const adminFakRole = roles.find(r => r.name === 'admin_fakultas');
    const stafFakRole = roles.find(r => r.name === 'staf_fakultas');
    const manajerTuRole = roles.find(r => r.name === 'manajer_tu');

    if (!adminFakRole || !stafFakRole || !manajerTuRole) {
        console.log('❌ Some roles not found! Please run create_missing_roles.ts first');
        return;
    }

    // 1. Admin Fakultas
    console.log('1. Creating Admin Fakultas...');
    let adminFakUser = await prisma.user.findUnique({ where: { email: 'admin.fakultas@fsm.ac.id' } });

    if (!adminFakUser) {
        adminFakUser = await prisma.user.create({
            data: {
                email: 'admin.fakultas@fsm.ac.id',
                name: 'Drs. Bambang Suryanto, M.Si',
                emailVerified: true
            }
        });

        await prisma.account.create({
            data: {
                userId: adminFakUser.id,
                providerId: 'credential',
                accountId: 'admin.fakultas@fsm.ac.id',
                password: password
            }
        });

        await prisma.pegawai.create({
            data: {
                nip: '196805151993031001',
                jabatan: 'Admin Fakultas',
                noHp: '08123456701',
                userId: adminFakUser.id
            }
        });

        console.log('✅ User created');
    } else {
        console.log('✅ User already exists');
    }

    // Assign role
    const hasAdminFakRole = await prisma.userRole.findFirst({
        where: { userId: adminFakUser.id, roleId: adminFakRole.id }
    });

    if (!hasAdminFakRole) {
        await prisma.userRole.create({
            data: { userId: adminFakUser.id, roleId: adminFakRole.id }
        });
        console.log('✅ Role assigned');
    }

    // 2. Staf Fakultas
    console.log('\n2. Creating Staf Fakultas...');
    let stafFakUser = await prisma.user.findUnique({ where: { email: 'staf.fakultas@fsm.ac.id' } });

    if (!stafFakUser) {
        stafFakUser = await prisma.user.create({
            data: {
                email: 'staf.fakultas@fsm.ac.id',
                name: 'Sri Wahyuni, S.Sos',
                emailVerified: true
            }
        });

        await prisma.account.create({
            data: {
                userId: stafFakUser.id,
                providerId: 'credential',
                accountId: 'staf.fakultas@fsm.ac.id',
                password: password
            }
        });

        await prisma.pegawai.create({
            data: {
                nip: '197203101995122001',
                jabatan: 'Staf Fakultas',
                noHp: '08123456702',
                userId: stafFakUser.id
            }
        });

        console.log('✅ User created');
    } else {
        console.log('✅ User already exists');
    }

    // Assign role
    const hasStafFakRole = await prisma.userRole.findFirst({
        where: { userId: stafFakUser.id, roleId: stafFakRole.id }
    });

    if (!hasStafFakRole) {
        await prisma.userRole.create({
            data: { userId: stafFakUser.id, roleId: stafFakRole.id }
        });
        console.log('✅ Role assigned');
    }

    // 3. Manajer TU
    console.log('\n3. Creating Manajer TU...');
    let manajerTuUser = await prisma.user.findUnique({ where: { email: 'manajer.tu@fsm.ac.id' } });

    if (!manajerTuUser) {
        manajerTuUser = await prisma.user.create({
            data: {
                email: 'manajer.tu@fsm.ac.id',
                name: 'Ir. Agus Prasetyo, M.M',
                emailVerified: true
            }
        });

        await prisma.account.create({
            data: {
                userId: manajerTuUser.id,
                providerId: 'credential',
                accountId: 'manajer.tu@fsm.ac.id',
                password: password
            }
        });

        await prisma.pegawai.create({
            data: {
                nip: '196512201990031002',
                jabatan: 'Manajer Tata Usaha',
                noHp: '08123456703',
                userId: manajerTuUser.id
            }
        });

        console.log('✅ User created');
    } else {
        console.log('✅ User already exists');
    }

    // Assign role
    const hasManajerTuRole = await prisma.userRole.findFirst({
        where: { userId: manajerTuUser.id, roleId: manajerTuRole.id }
    });

    if (!hasManajerTuRole) {
        await prisma.userRole.create({
            data: { userId: manajerTuUser.id, roleId: manajerTuRole.id }
        });
        console.log('✅ Role assigned');
    }

    console.log('\n=== SUMMARY ===');
    console.log('✅ All faculty staff accounts created/verified!');
    console.log('\nAccounts:');
    console.log('1. admin.fakultas@fsm.ac.id - Drs. Bambang Suryanto, M.Si');
    console.log('2. staf.fakultas@fsm.ac.id - Sri Wahyuni, S.Sos');
    console.log('3. manajer.tu@fsm.ac.id - Ir. Agus Prasetyo, M.M');
    console.log('\nPassword: password123');
}

main().finally(() => process.exit(0));
