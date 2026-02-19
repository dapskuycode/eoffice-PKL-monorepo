import { checkPermission } from './src/lib/casbin.ts';
import { Prisma as prisma } from './src/db/index.ts';

async function main() {
    const saUser = await prisma.user.findFirst({
        where: { userRole: { some: { role: { name: 'super_admin' } } } }
    });

    if (!saUser) {
        console.log('NO sa user found');
        return;
    }

    console.log('Testing for user:', saUser.email);
    const resource = 'mahasiswa';
    const action = 'read';

    const hasPerm = await checkPermission(saUser.id, resource, action);
    console.log(`Has ${action}:${resource} permission?`, hasPerm);

    // Now simulate the backend route where
    const where: any = {};
    const data = await prisma.mahasiswa.findMany({
        where,
        include: {
            user: true,
            programStudi: true
        }
    });

    console.log('Records found in DB:', data.length);
}

main().finally(() => process.exit(0));
