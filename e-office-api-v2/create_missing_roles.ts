import { Prisma as prisma } from './src/db/index.ts';

async function main() {
    console.log('=== CREATING MISSING ROLES ===\n');

    // Check and create staf_fakultas role
    const stafFakultasExists = await prisma.role.findUnique({
        where: { name: 'staf_fakultas' }
    });

    if (!stafFakultasExists) {
        console.log('Creating staf_fakultas role...');
        await prisma.role.create({
            data: {
                name: 'staf_fakultas'
            }
        });
        console.log('✅ staf_fakultas role created!');
    } else {
        console.log('✅ staf_fakultas role already exists');
    }

    // Check manajer_tu
    const manajerTuExists = await prisma.role.findUnique({
        where: { name: 'manajer_tu' }
    });

    if (!manajerTuExists) {
        console.log('Creating manajer_tu role...');
        await prisma.role.create({
            data: {
                name: 'manajer_tu'
            }
        });
        console.log('✅ manajer_tu role created!');
    } else {
        console.log('✅ manajer_tu role already exists');
    }

    // Check admin_fakultas
    const adminFakultasExists = await prisma.role.findUnique({
        where: { name: 'admin_fakultas' }
    });

    if (!adminFakultasExists) {
        console.log('Creating admin_fakultas role...');
        await prisma.role.create({
            data: {
                name: 'admin_fakultas'
            }
        });
        console.log('✅ admin_fakultas role created!');
    } else {
        console.log('✅ admin_fakultas role already exists');
    }

    console.log('\n=== SUMMARY ===');
    console.log('All required roles are now in the database!');
}

main().finally(() => process.exit(0));
