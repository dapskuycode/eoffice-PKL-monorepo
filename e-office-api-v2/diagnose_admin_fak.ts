import { Prisma as prisma } from './src/db/index.ts';

async function main() {
    console.log('=== CHECKING ADMIN FAKULTAS ACCOUNT ===\n');

    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { email: 'admin.fakultas@fsm.ac.id' },
        include: {
            account: true,
            pegawai: true,
            userRole: {
                include: {
                    role: true
                }
            }
        }
    });

    if (!user) {
        console.log('❌ User NOT FOUND!');
        console.log('The account admin.fakultas@fsm.ac.id does not exist in database.');
        return;
    }

    console.log('✅ User found!');
    console.log('\n📋 User Details:');
    console.log('- ID:', user.id);
    console.log('- Name:', user.name);
    console.log('- Email:', user.email);
    console.log('- Email Verified:', user.emailVerified);

    console.log('\n🔐 Account Details:');
    if (user.account && user.account.length > 0) {
        console.log('- Account exists:', user.account.length, 'account(s)');
        user.account.forEach((acc, idx) => {
            console.log(`  ${idx + 1}. Provider: ${acc.providerId}`);
            console.log(`     Account ID: ${acc.accountId}`);
            console.log(`     Has Password: ${acc.password ? 'YES' : 'NO'}`);
        });
    } else {
        console.log('❌ NO ACCOUNT FOUND! User cannot login without account.');
    }

    console.log('\n👤 Pegawai Profile:');
    if (user.pegawai) {
        console.log('- NIP:', user.pegawai.nip);
        console.log('- Jabatan:', user.pegawai.jabatan);
        console.log('- No HP:', user.pegawai.noHp);
    } else {
        console.log('❌ NO PEGAWAI PROFILE');
    }

    console.log('\n🎭 Roles:');
    if (user.userRole && user.userRole.length > 0) {
        user.userRole.forEach((ur, idx) => {
            console.log(`${idx + 1}. ${ur.role.name}`);
        });
    } else {
        console.log('❌ NO ROLES ASSIGNED!');
    }

    console.log('\n=== DIAGNOSIS ===');
    const issues = [];

    if (!user.account || user.account.length === 0) {
        issues.push('❌ Missing account - user cannot login');
    }
    if (!user.pegawai) {
        issues.push('⚠️  Missing pegawai profile');
    }
    if (!user.userRole || user.userRole.length === 0) {
        issues.push('❌ No roles assigned - user will not have access');
    }
    if (!user.emailVerified) {
        issues.push('⚠️  Email not verified');
    }

    if (issues.length > 0) {
        console.log('Issues found:');
        issues.forEach(issue => console.log(issue));
    } else {
        console.log('✅ Account looks good! Should be able to login.');
    }
}

main().finally(() => process.exit(0));
