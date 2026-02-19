import { Prisma as prisma } from './src/db/index.ts';

async function main() {
    const deps = await prisma.departemen.findMany({ take: 1 });
    const prodis = await prisma.programStudi.findMany({ take: 1 });

    console.log('Sample Departemen:', deps[0]);
    console.log('Sample Prodi:', prodis[0]);
}

main().finally(() => process.exit(0));
