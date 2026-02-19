import { Prisma as prisma } from './src/db/index.ts';

async function main() {
    const mhs = await prisma.mahasiswa.findMany({
        include: { user: true }
    });

    console.log('--- FINAL DATA INTEGRITY CHECK ---');
    console.log('COUNT: ' + mhs.length);
    mhs.forEach(m => {
        console.log(`NIM: ${m.nim} | THN: ${m.tahunMasuk} | USER: ${m.user ? 'OK' : 'MISSING'}`);
    });
}

main().finally(() => process.exit(0));
