import { Prisma as prisma } from './src/db/index.ts';

async function main() {
    console.log('--- API GET FILTER TEST (' + process.argv[2] + ') ---');

    const tahun = process.argv[2] || '';
    const where: any = {};
    if (tahun) {
        where.tahunMasuk = tahun;
    }

    const [mahasiswa, total] = await Promise.all([
        prisma.mahasiswa.findMany({
            where,
            include: { user: true },
            orderBy: { nim: 'desc' },
        }),
        prisma.mahasiswa.count({ where }),
    ]);

    console.log('Filter Tahun:', tahun);
    console.log('Total returned:', total);
    if (total > 0) {
        console.log('First record Year:', mahasiswa[0].tahunMasuk);
    }
}

main().finally(() => process.exit(0));
