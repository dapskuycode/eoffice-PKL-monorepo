import { Prisma as prisma } from './src/db/index.ts';

async function main() {
    console.log('=== DAFTAR PEGAWAI TINGKAT FAKULTAS ===\n');
    console.log('(Pegawai di luar Program Studi)\n');

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

    console.log(`Total: ${facultyStaff.length} pegawai\n`);
    console.log('='.repeat(80));

    facultyStaff.forEach((staff, idx) => {
        const roles = staff.userRole.map(ur => ur.role.name).join(', ');

        console.log(`\n${idx + 1}. ${staff.name}`);
        console.log(`   Email: ${staff.email}`);
        if (staff.pegawai?.nip) {
            console.log(`   NIP: ${staff.pegawai.nip}`);
        }
        if (staff.pegawai?.jabatan) {
            console.log(`   Jabatan: ${staff.pegawai.jabatan}`);
        }
        if (staff.pegawai?.noHp) {
            console.log(`   No HP: ${staff.pegawai.noHp}`);
        }
        console.log(`   Role: ${roles}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('\n📋 RINGKASAN PER ROLE:');

    for (const roleName of facultyRoles) {
        const count = facultyStaff.filter(s =>
            s.userRole.some(ur => ur.role.name === roleName)
        ).length;

        if (count > 0) {
            const displayName = roleName
                .replace(/_/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            console.log(`- ${displayName}: ${count} orang`);
        }
    }

    console.log('\n💡 Password default untuk semua akun: password123');
}

main().finally(() => process.exit(0));
