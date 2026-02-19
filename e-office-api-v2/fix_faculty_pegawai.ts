import { Prisma as prisma } from './src/db/index.ts';
import bcrypt from 'bcryptjs';

async function main() {
    console.log('=== FIXING FACULTY STAFF PEGAWAI PROFILES ===\n');

    const password = await bcrypt.hash('password123', 10);

    // Get first departemen and prodi as placeholder for faculty staff
    const firstDep = await prisma.departemen.findFirst();
    const firstProdi = await prisma.programStudi.findFirst();

    if (!firstDep || !firstProdi) {
        console.log('❌ No departemen or prodi found!');
        return;
    }

    console.log(`Using placeholder: Dep=${firstDep.name}, Prodi=${firstProdi.name}\n`);

    // Get roles
    const roles = await prisma.role.findMany({
        where: { name: { in: ['admin_fakultas', 'staf_fakultas', 'manajer_tu'] } }
    });

    const adminFakRole = roles.find(r => r.name === 'admin_fakultas');
    const stafFakRole = roles.find(r => r.name === 'staf_fakultas');
    const manajerTuRole = roles.find(r => r.name === 'manajer_tu');

    // 1. Admin Fakultas
    console.log('1. Admin Fakultas...');
    let adminUser = await prisma.user.findUnique({
        where: { email: 'admin.fakultas@fsm.ac.id' },
        include: { pegawai: true }
    });

    if (!adminUser) {
        adminUser = await prisma.user.create({
            data: {
                email: 'admin.fakultas@fsm.ac.id',
                name: 'Drs. Bambang Suryanto, M.Si',
                emailVerified: true
            }
        });

        await prisma.account.create({
            data: {
                userId: adminUser.id,
                providerId: 'credential',
                accountId: 'admin.fakultas@fsm.ac.id',
                password: password
            }
        });
    }

    if (!adminUser.pegawai) {
        await prisma.pegawai.create({
            data: {
                nip: '196805151993031001',
                jabatan: 'Admin Fakultas',
                noHp: '08123456701',
                userId: adminUser.id,
                departemenId: firstDep.id,
                programStudiId: firstProdi.id
            }
        });
        console.log('✅ Pegawai profile created');
    } else {
        console.log('✅ Pegawai profile exists');
    }

    if (adminFakRole) {
        const hasRole = await prisma.userRole.findFirst({
            where: { userId: adminUser.id, roleId: adminFakRole.id }
        });
        if (!hasRole) {
            await prisma.userRole.create({
                data: { userId: adminUser.id, roleId: adminFakRole.id }
            });
        }
    }

    // 2. Staf Fakultas
    console.log('\n2. Staf Fakultas...');
    let stafUser = await prisma.user.findUnique({
        where: { email: 'staf.fakultas@fsm.ac.id' },
        include: { pegawai: true }
    });

    if (!stafUser) {
        stafUser = await prisma.user.create({
            data: {
                email: 'staf.fakultas@fsm.ac.id',
                name: 'Sri Wahyuni, S.Sos',
                emailVerified: true
            }
        });

        await prisma.account.create({
            data: {
                userId: stafUser.id,
                providerId: 'credential',
                accountId: 'staf.fakultas@fsm.ac.id',
                password: password
            }
        });
    }

    if (!stafUser.pegawai) {
        await prisma.pegawai.create({
            data: {
                nip: '197203101995122001',
                jabatan: 'Staf Fakultas',
                noHp: '08123456702',
                userId: stafUser.id,
                departemenId: firstDep.id,
                programStudiId: firstProdi.id
            }
        });
        console.log('✅ Pegawai profile created');
    } else {
        console.log('✅ Pegawai profile exists');
    }

    if (stafFakRole) {
        const hasRole = await prisma.userRole.findFirst({
            where: { userId: stafUser.id, roleId: stafFakRole.id }
        });
        if (!hasRole) {
            await prisma.userRole.create({
                data: { userId: stafUser.id, roleId: stafFakRole.id }
            });
        }
    }

    // 3. Manajer TU
    console.log('\n3. Manajer TU...');
    let manajerUser = await prisma.user.findUnique({
        where: { email: 'manajer.tu@fsm.ac.id' },
        include: { pegawai: true }
    });

    if (!manajerUser) {
        manajerUser = await prisma.user.create({
            data: {
                email: 'manajer.tu@fsm.ac.id',
                name: 'Ir. Agus Prasetyo, M.M',
                emailVerified: true
            }
        });

        await prisma.account.create({
            data: {
                userId: manajerUser.id,
                providerId: 'credential',
                accountId: 'manajer.tu@fsm.ac.id',
                password: password
            }
        });
    }

    if (!manajerUser.pegawai) {
        await prisma.pegawai.create({
            data: {
                nip: '196512201990031002',
                jabatan: 'Manajer Tata Usaha',
                noHp: '08123456703',
                userId: manajerUser.id,
                departemenId: firstDep.id,
                programStudiId: firstProdi.id
            }
        });
        console.log('✅ Pegawai profile created');
    } else {
        console.log('✅ Pegawai profile exists');
    }

    if (manajerTuRole) {
        const hasRole = await prisma.userRole.findFirst({
            where: { userId: manajerUser.id, roleId: manajerTuRole.id }
        });
        if (!hasRole) {
            await prisma.userRole.create({
                data: { userId: manajerUser.id, roleId: manajerTuRole.id }
            });
        }
    }

    console.log('\n✅ All faculty staff accounts fixed!');
}

main().finally(() => process.exit(0));
