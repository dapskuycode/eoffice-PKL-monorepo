import { Prisma as prisma } from './src/db/index.ts';
import fs from 'fs';

async function main() {
    let output = '# 📋 Daftar Pegawai Tingkat Fakultas\n\n';
    output += '**Pegawai di Luar Program Studi**\n\n';
    output += '---\n\n';

    // Roles yang termasuk pegawai fakultas (bukan prodi)
    const facultyRoles = [
        'admin_fakultas',
        'staf_fakultas',
        'manajer_tu',
        'supervisor',
        'upa',
        'super_admin'
    ];

    // Get all users with these roles
    const facultyStaff = await prisma.user.findMany({
        where: {
            userRole: {
                some: {
                    role: {
                        name: {
                            in: facultyRoles
                        }
                    }
                }
            }
        },
        include: {
            pegawai: true,
            userRole: {
                include: {
                    role: true
                }
            }
        },
        orderBy: {
            name: 'asc'
        }
    });

    output += `**Total:** ${facultyStaff.length} pegawai\n\n`;

    // Create table
    output += '| No | Nama | Email | NIP | Jabatan | No HP | Role |\n';
    output += '|----|------|-------|-----|---------|-------|------|\n';

    facultyStaff.forEach((staff, idx) => {
        const roles = staff.userRole
            .map(ur => {
                const displayName = ur.role.name
                    .replace(/_/g, ' ')
                    .split(' ')
                    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                return displayName;
            })
            .join(', ');

        output += `| ${idx + 1} | ${staff.name} | ${staff.email} | ${staff.pegawai?.nip || '-'} | ${staff.pegawai?.jabatan || '-'} | ${staff.pegawai?.noHp || '-'} | ${roles} |\n`;
    });

    output += '\n---\n\n';
    output += '## 📊 Ringkasan Per Role\n\n';

    for (const roleName of facultyRoles) {
        const staffWithRole = facultyStaff.filter(s =>
            s.userRole.some(ur => ur.role.name === roleName)
        );

        if (staffWithRole.length > 0) {
            const displayName = roleName
                .replace(/_/g, ' ')
                .split(' ')
                .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            output += `### ${displayName} (${staffWithRole.length} orang)\n\n`;

            staffWithRole.forEach(staff => {
                output += `- **${staff.name}** (${staff.email})\n`;
                if (staff.pegawai?.nip) output += `  - NIP: ${staff.pegawai.nip}\n`;
                if (staff.pegawai?.jabatan) output += `  - Jabatan: ${staff.pegawai.jabatan}\n`;
            });

            output += '\n';
        }
    }

    output += '---\n\n';
    output += '💡 **Password default untuk semua akun:** `password123`\n';

    // Write to file
    fs.writeFileSync('PEGAWAI_FAKULTAS.md', output);
    console.log('✅ File berhasil dibuat: PEGAWAI_FAKULTAS.md');
    console.log(`📊 Total pegawai fakultas: ${facultyStaff.length}`);
}

main().finally(() => process.exit(0));
