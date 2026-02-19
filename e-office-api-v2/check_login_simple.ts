import { Prisma as prisma } from './src/db/index.ts';
import fs from 'fs';

async function main() {
    let output = '=== ADMIN FAKULTAS LOGIN CHECK ===\n\n';

    // Check user
    const user = await prisma.user.findUnique({
        where: { email: 'admin.fakultas@fsm.ac.id' }
    });

    if (!user) {
        output += '❌ USER NOT FOUND\n';
        console.log(output);
        fs.writeFileSync('login_check_result.txt', output);
        return;
    }

    output += `✅ User: ${user.name}\n`;
    output += `   ID: ${user.id}\n\n`;

    // Check accounts
    const accounts = await prisma.account.findMany({
        where: { userId: user.id }
    });

    output += `🔐 Accounts: ${accounts.length}\n`;
    if (accounts.length > 0) {
        accounts.forEach((acc, i) => {
            output += `   ${i + 1}. ${acc.providerId} - Password: ${acc.password ? 'SET' : 'NONE'}\n`;
        });
    } else {
        output += '   ❌ NO ACCOUNTS - CANNOT LOGIN!\n';
    }
    output += '\n';

    // Check roles
    const roles = await prisma.userRole.findMany({
        where: { userId: user.id },
        include: { role: true }
    });

    output += `🎭 Roles: ${roles.length}\n`;
    roles.forEach((r, i) => {
        output += `   ${i + 1}. ${r.role.name}\n`;
    });
    output += '\n';

    // Check pegawai
    const pegawai = await prisma.pegawai.findUnique({
        where: { userId: user.id }
    });

    output += `👤 Pegawai: ${pegawai ? 'YES' : 'NO'}\n`;
    if (pegawai) {
        output += `   NIP: ${pegawai.nip}\n`;
        output += `   Jabatan: ${pegawai.jabatan}\n`;
    }
    output += '\n';

    output += '=== DIAGNOSIS ===\n';
    if (accounts.length === 0) {
        output += '❌ PROBLEM: No account found - user cannot login\n';
        output += '   SOLUTION: Run seeder or create account manually\n';
    } else if (roles.length === 0) {
        output += '⚠️  WARNING: No roles assigned\n';
    } else {
        output += '✅ Account looks good!\n';
    }

    console.log(output);
    fs.writeFileSync('login_check_result.txt', output);
    console.log('\n📄 Result saved to: login_check_result.txt');
}

main().finally(() => process.exit(0));
