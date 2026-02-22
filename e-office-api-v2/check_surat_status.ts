import { Prisma as prisma } from './src/db/index.ts';

async function main() {
    console.log('=== CEK STATUS SURAT SKL ===\n');

    // Ambil semua pengajuan dengan riwayat
    const pengajuan = await prisma.pengajuanSkl.findMany({
        include: {
            mahasiswa: {
                include: {
                    user: true,
                    programStudi: true
                }
            },
            riwayat: {
                orderBy: {
                    timestamp: 'desc'
                },
                include: {
                    actor: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    console.log(`Total pengajuan: ${pengajuan.length}\n`);

    // Group by status
    const byStatus: Record<string, any[]> = {};
    
    for (const p of pengajuan) {
        if (!byStatus[p.status]) {
            byStatus[p.status] = [];
        }
        byStatus[p.status].push(p);
    }

    console.log('=== RINGKASAN PER STATUS ===');
    for (const [status, items] of Object.entries(byStatus)) {
        console.log(`${status}: ${items.length} surat`);
    }
    console.log('');

    // Detail untuk status yang relevan dengan Admin Fakultas
    console.log('=== DETAIL SURAT YANG HARUSNYA MUNCUL DI ADMIN FAKULTAS ===\n');
    
    const relevantStatuses = ['REGISTERING', 'REGISTERED', 'APPROVED_SUPERVISOR', 'SIAP_CETAK', 'STEP_KONVENSIONAL', 'COMPLETED'];
    
    for (const status of relevantStatuses) {
        if (byStatus[status] && byStatus[status].length > 0) {
            console.log(`--- ${status} (${byStatus[status].length} surat) ---`);
            for (const p of byStatus[status]) {
                console.log(`  ID: ${p.id.substring(0, 8)}...`);
                console.log(`  Mahasiswa: ${p.mahasiswa?.user?.name || 'N/A'}`);
                console.log(`  NIM: ${p.mahasiswa?.nim || 'N/A'}`);
                console.log(`  Nomor Surat: ${p.nomorSuratPengantar || 'Belum ada'}`);
                console.log(`  Nomor SKL: ${p.nomorSkl || 'Belum ada'}`);
                console.log(`  Created: ${p.createdAt.toLocaleString('id-ID')}`);
                console.log('');
            }
        }
    }

    // Cek surat yang mungkin stuck
    console.log('=== SURAT YANG MUNGKIN STUCK (Ada nomor tapi bukan REGISTERING) ===\n');
    
    const stuckSurat = pengajuan.filter(p => 
        p.nomorSuratPengantar && 
        p.status !== 'REGISTERING' && 
        p.status !== 'REGISTERED' &&
        p.status !== 'APPROVED_SUPERVISOR' &&
        p.status !== 'SIAP_CETAK' &&
        p.status !== 'COMPLETED'
    );

    if (stuckSurat.length > 0) {
        console.log(`Ditemukan ${stuckSurat.length} surat yang stuck:\n`);
        for (const p of stuckSurat) {
            console.log(`  ID: ${p.id.substring(0, 8)}...`);
            console.log(`  Status: ${p.status}`);
            console.log(`  Mahasiswa: ${p.mahasiswa?.user?.name || 'N/A'}`);
            console.log(`  Nomor Surat: ${p.nomorSuratPengantar}`);
            console.log('  Riwayat:');
            for (const r of p.riwayat.slice(0, 3)) {
                console.log(`    - ${r.timestamp.toLocaleString('id-ID')}: ${r.statusBaru} (${r.actor?.name || 'N/A'})`);
                if (r.catatan) console.log(`      Catatan: ${r.catatan}`);
            }
            console.log('');
        }
    } else {
        console.log('Tidak ada surat yang stuck.\n');
    }

    // Cek APPROVED_KAPRODI (harusnya setelah input nomor jadi REGISTERING)
    if (byStatus['APPROVED_KAPRODI'] && byStatus['APPROVED_KAPRODI'].length > 0) {
        console.log('=== SURAT STATUS APPROVED_KAPRODI (Belum diberi nomor?) ===\n');
        for (const p of byStatus['APPROVED_KAPRODI']) {
            console.log(`  ID: ${p.id.substring(0, 8)}...`);
            console.log(`  Mahasiswa: ${p.mahasiswa?.user?.name || 'N/A'}`);
            console.log(`  Nomor Surat: ${p.nomorSuratPengantar || 'BELUM ADA'}`);
            console.log(`  Riwayat terakhir:`);
            for (const r of p.riwayat.slice(0, 2)) {
                console.log(`    - ${r.timestamp.toLocaleString('id-ID')}: ${r.statusBaru}`);
            }
            console.log('');
        }
    }
}

main()
    .catch(console.error)
    .finally(() => process.exit(0));
