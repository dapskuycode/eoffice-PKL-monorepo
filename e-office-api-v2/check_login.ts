import { Prisma as prisma } from './src/db/index.ts';

async function main() {
    console.log('=== CHECKING ADMIN FAKULTAS ACCOUNT ===\n');

    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { email: 'admin.fakultas@fsm.ac.id' }
    });

    if (!user) {
        console.log('❌ USER NOT FOUND!');
        console.log('Need to create the account first.');
        return;
    }

    console.log('✅ User exists');
    console.log('ID:', user.id);
    console.log('Name:', user.name);
    console.log('Email:', user.email);

    // Check account
    const accounts = await prisma.account.findMany({
        where: { userId: user.id }
    });

    console.log('\n🔐 Accounts:', accounts.length);
    if (accounts.length === 0) {
        console.log('❌ NO ACCOUNT - Cannot login!');
    } else {
        accounts.forEach((acc, idx) => {
            console.log(`${idx + 1}. Provider: ${acc.providerId}, Has Password: ${acc.password ? 'YES' : 'NO'}`);
        });
    }

    // Check pegawai
    const pegawai = await prisma.pegawai.findUnique({
        where: { userId: user.id }
    });

    console.log('\n👤 Pegawai:', pegawai ? 'EXISTS' : 'MISSING');
    if (pegawai) {
        console.log('NIP:', pegawai.nip);
        console.log('Jabatan:', pegawai.jabatan);
    }

    // Check roles
    const userRoles = await prisma.userRole.findMany({
        where: { userId: user.id },
        include: { role: true }
    });

    console.log('\n🎭 Roles:', userRoles.length);
    userRoles.forEach((ur, idx) => {
        console.log(`${idx + 1}. ${ur.role.name}`);
    });

    console.log('\n=== RESULT ===');
    if (accounts.length === 0) {
        console.log('❌ CANNOT LOGIN - No account credentials');
    } else if (userRoles.length === 0) {
        console.log('⚠️  Can login but no roles assigned');
    } else {
        console.log('✅ Should be able to login!');
    }
}

main().finally(() => process.exit(0));
