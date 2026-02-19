import { Prisma as prisma } from './src/db/index.ts';
import bcrypt from 'bcryptjs';

async function main() {
    console.log('=== CREATING MISSING ROLE ACCOUNTS ===\n');

    const password = await bcrypt.hash('password123', 10);

    // 1. Admin Fakultas
    console.log('1. Creating Admin Fakultas...');
    const adminFakRole = await prisma.role.findUnique({ where: { name: 'admin_fakultas' } });
    if (!adminFakRole) {
        console.log('❌ Role admin_fakultas not found!');
    } else {
        const adminFakUser = await prisma.user.create({
            data: {
                email: 'admin.fakultas@fsm.ac.id',
                name: 'Drs. Bambang Suryanto, M.Si',
                emailVerified: true,
                account: {
                    create: {
                        providerId: 'credential',
                        accountId: 'admin.fakultas@fsm.ac.id',
                        password: password
                    }
                }
            }
        });

        await prisma.pegawai.create({
            data: {
                nip: '196805151993031001',
                jabatan: 'Admin Fakultas',
                noHp: '08123456701',
                alamat: 'Jl. Prof. Soedarto, Tembalang, Semarang',
                tempatLahir: 'Semarang',
                tanggalLahir: new Date('1968-05-15'),
                userId: adminFakUser.id
            }
        });

        await prisma.userRole.create({
            data: {
                userId: adminFakUser.id,
                roleId: adminFakRole.id
            }
        });

        console.log('✅ Admin Fakultas created: admin.fakultas@fsm.ac.id');
    }

    // 2. Staf Fakultas
    console.log('\n2. Creating Staf Fakultas...');
    const stafFakRole = await prisma.role.findUnique({ where: { name: 'staf_fakultas' } });
    if (!stafFakRole) {
        console.log('❌ Role staf_fakultas not found!');
    } else {
        const stafFakUser = await prisma.user.create({
            data: {
                email: 'staf.fakultas@fsm.ac.id',
                name: 'Sri Wahyuni, S.Sos',
                emailVerified: true,
                account: {
                    create: {
                        providerId: 'credential',
                        accountId: 'staf.fakultas@fsm.ac.id',
                        password: password
                    }
                }
            }
        });

        await prisma.pegawai.create({
            data: {
                nip: '197203101995122001',
                jabatan: 'Staf Fakultas',
                noHp: '08123456702',
                alamat: 'Jl. Pandanaran, Semarang',
                tempatLahir: 'Semarang',
                tanggalLahir: new Date('1972-03-10'),
                userId: stafFakUser.id
            }
        });

        await prisma.userRole.create({
            data: {
                userId: stafFakUser.id,
                roleId: stafFakRole.id
            }
        });

        console.log('✅ Staf Fakultas created: staf.fakultas@fsm.ac.id');
    }

    // 3. Manajer TU
    console.log('\n3. Creating Manajer TU...');
    const manajerTuRole = await prisma.role.findUnique({ where: { name: 'manajer_tu' } });
    if (!manajerTuRole) {
        console.log('❌ Role manajer_tu not found!');
    } else {
        const manajerTuUser = await prisma.user.create({
            data: {
                email: 'manajer.tu@fsm.ac.id',
                name: 'Ir. Agus Prasetyo, M.M',
                emailVerified: true,
                account: {
                    create: {
                        providerId: 'credential',
                        accountId: 'manajer.tu@fsm.ac.id',
                        password: password
                    }
                }
            }
        });

        await prisma.pegawai.create({
            data: {
                nip: '196512201990031002',
                jabatan: 'Manajer Tata Usaha',
                noHp: '08123456703',
                alamat: 'Jl. Gajah Mada, Semarang',
                tempatLahir: 'Semarang',
                tanggalLahir: new Date('1965-12-20'),
                userId: manajerTuUser.id
            }
        });

        await prisma.userRole.create({
            data: {
                userId: manajerTuUser.id,
                roleId: manajerTuRole.id
            }
        });

        console.log('✅ Manajer TU created: manajer.tu@fsm.ac.id');
    }

    console.log('\n=== SUMMARY ===');
    console.log('✅ 3 new accounts created successfully!');
    console.log('Password for all: password123');
    console.log('\nAccounts:');
    console.log('1. admin.fakultas@fsm.ac.id - Drs. Bambang Suryanto, M.Si');
    console.log('2. staf.fakultas@fsm.ac.id - Sri Wahyuni, S.Sos');
    console.log('3. manajer.tu@fsm.ac.id - Ir. Agus Prasetyo, M.M');
}

main().finally(() => process.exit(0));
