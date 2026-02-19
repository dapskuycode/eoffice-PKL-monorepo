import { Prisma as prisma } from './src/db/index.ts';

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'admin.fakultas@fsm.ac.id' },
        include: {
            userRole: {
                include: {
                    role: true
                }
            },
            pegawai: true
        }
    });

    if (user) {
        console.log('✅ User found!');
        console.log('Email:', user.email);
        console.log('Name:', user.name);
        console.log('NIP:', user.pegawai?.nip);
        console.log('Roles:', user.userRole.map(ur => ur.role.name).join(', '));
    } else {
        console.log('❌ User not found');
    }
}

main().finally(() => process.exit(0));
