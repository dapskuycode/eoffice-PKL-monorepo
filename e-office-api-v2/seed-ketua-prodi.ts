import { Prisma } from "./src/db/index.ts";

async function seedKetuaProdi() {
  try {
    console.log("🔍 Mencari Program Studi Informatika...");
    
    // Cari program studi Informatika
    const prodiInformatika = await Prisma.programStudi.findFirst({
      where: {
        OR: [
          { name: { contains: "Informatika", mode: "insensitive" } },
          { code: { contains: "IF", mode: "insensitive" } },
        ],
      },
    });

    if (!prodiInformatika) {
      console.error("❌ Program Studi Informatika tidak ditemukan!");
      return;
    }

    console.log("✅ Program Studi ditemukan:", prodiInformatika.name);

    // Cari pegawai yang bisa jadi ketua prodi (jabatan mengandung "ketua" atau "kaprodi")
    console.log("\n🔍 Mencari pegawai dengan jabatan Ketua Prodi...");
    
    let ketuaProdi = await Prisma.pegawai.findFirst({
      where: {
        programStudiId: prodiInformatika.id,
        jabatan: {
          contains: "Ketua",
          mode: "insensitive",
        },
      },
      include: {
        user: true,
      },
    });

    // Jika tidak ada, ambil pegawai pertama dari prodi tersebut
    if (!ketuaProdi) {
      console.log("⚠️  Tidak ada pegawai dengan jabatan Ketua, mengambil pegawai pertama...");
      ketuaProdi = await Prisma.pegawai.findFirst({
        where: {
          programStudiId: prodiInformatika.id,
        },
        include: {
          user: true,
        },
      });
    }

    if (!ketuaProdi) {
      console.error("❌ Tidak ada pegawai di Program Studi Informatika!");
      console.log("\n💡 Silakan tambahkan pegawai terlebih dahulu atau gunakan pegawai dari prodi lain.");
      return;
    }

    console.log("✅ Ketua Prodi dipilih:");
    console.log("   Nama:", ketuaProdi.user?.name);
    console.log("   NIP:", ketuaProdi.nip);
    console.log("   Jabatan:", ketuaProdi.jabatan);

    // Update program studi dengan ketua prodi
    console.log("\n📝 Mengupdate Program Studi dengan Ketua Prodi...");
    
    await Prisma.programStudi.update({
      where: { id: prodiInformatika.id },
      data: { ketuaProdiId: ketuaProdi.id },
    });

    console.log("✅ Berhasil! Ketua Prodi telah diset untuk", prodiInformatika.name);
    console.log("\n🎉 Sekarang refresh halaman generate surat untuk melihat hasilnya!");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    process.exit(0);
  }
}

seedKetuaProdi();
