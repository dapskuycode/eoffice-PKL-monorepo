import { Prisma as prisma } from './src/db/index.ts';
import fs from 'fs';

async function main() {
    let output = '=== DAFTAR AKUN LOGIN PER ROLE ===\n\n';

    // Get all users with their roles
    const users = await prisma.user.findMany({
        include: {
            userRole: {
                include: {
                    role: true
                }
            },
            mahasiswa: true,
            pegawai: true
        },
        orderBy: { email: 'asc' }
    });

    // Group by role
    const roleGroups: Record<string, any[]> = {};

    for (const user of users) {
        const roles = user.userRole.map(ur => ur.role.name);

        for (const roleObj of user.userRole) {
            const roleName = roleObj.role.name;
            if (!roleGroups[roleName]) {
                roleGroups[roleName] = [];
            }

            roleGroups[roleName].push({
                email: user.email,
                name: user.name,
                nip: user.pegawai?.nip,
                nim: user.mahasiswa?.nim,
                allRoles: roles
            });
        }
    }

    // Display by role
    const roleOrder = ['super_admin', 'mahasiswa', 'admin_prodi', 'kaprodi', 'admin_fakultas', 'supervisor', 'manajer_tu', 'staf_fakultas', 'upa'];

    for (const roleName of roleOrder) {
        if (roleGroups[roleName] && roleGroups[roleName].length > 0) {
            output += `\n📌 ${roleName.toUpperCase().replace(/_/g, ' ')}\n`;
            output += '='.repeat(60) + '\n';

            roleGroups[roleName].forEach((user, idx) => {
                output += `${idx + 1}. Email: ${user.email}\n`;
                output += `   Nama: ${user.name}\n`;
                if (user.nip) output += `   NIP: ${user.nip}\n`;
                if (user.nim) output += `   NIM: ${user.nim}\n`;
                if (user.allRoles.length > 1) {
                    output += `   Role lain: ${user.allRoles.filter(r => r !== roleName).join(', ')}\n`;
                }
                output += '\n';
            });
        }
    }

    output += '\n💡 PASSWORD DEFAULT: "password123" (untuk semua akun development)\n';

    // Write to file
    fs.writeFileSync('AKUN_LOGIN.txt', output);
    console.log('✅ Daftar akun berhasil dibuat di file: AKUN_LOGIN.txt');
    console.log('\nRingkasan:');
    for (const roleName of roleOrder) {
        if (roleGroups[roleName]) {
            console.log(`- ${roleName}: ${roleGroups[roleName].length} akun`);
        }
    }
}

main().finally(() => process.exit(0));
