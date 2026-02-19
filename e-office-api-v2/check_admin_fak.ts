import { Prisma as prisma } from './src/db/index.ts';

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'admin.fakultas@fsm.ac.id' },
        include: {
            pegawai: true,
            userRole: {
                include: { role: true }
            }
        }
    });

    if (!user) {
        console.log('❌ User not found');
        return;
    }

    console.log('User:', user.email);
    console.log('Name:', user.name);
    console.log('Pegawai:', user.pegawai);
    console.log('Roles:', user.userRole.map(ur => ur.role.name));
}

main().finally(() => process.exit(0));
