import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

/**
 * Helper function to create password hash using Better Auth
 */
async function hashPass(password: string): Promise<string> {
	return await hashPassword(password);
}

async function main() {
	console.log("🌱 Starting database seed...\n");

	// ==============================================
	// CLEANUP - Delete all existing data
	// ==============================================
	console.log("🧹 Cleaning up existing data...");

	// Delete in correct order to avoid FK constraints
	await prisma.riwayatPengajuanSkl.deleteMany();
	await prisma.lampiranSkl.deleteMany();
	await prisma.pengajuanSkl.deleteMany();
	await prisma.mahasiswa.deleteMany();
	await prisma.pegawai.deleteMany();
	await prisma.userRole.deleteMany();
	await prisma.session.deleteMany();
	await prisma.account.deleteMany();
	await prisma.letterInstance.deleteMany();
	await prisma.letterTemplate.deleteMany();
	await prisma.letterType.deleteMany();
	await prisma.user.deleteMany();
	await prisma.programStudi.deleteMany();
	await prisma.departemen.deleteMany();
	await prisma.rolePermission.deleteMany();
	await prisma.role.deleteMany();
	await prisma.permission.deleteMany();

	console.log("✅ Cleanup completed!\n");

	// ==============================================
	// MASTER DATA - Roles
	// ==============================================
	console.log("👥 Creating Roles...");

	const adminProdiRole = await prisma.role.create({
		data: { name: "admin_prodi" },
	});

	const kaprodiRole = await prisma.role.create({
		data: { name: "kaprodi" },
	});

	const adminSuratRole = await prisma.role.create({
		data: { name: "admin_surat" },
	});

	const supervisorRole = await prisma.role.create({
		data: { name: "supervisor" },
	});

	const upaRole = await prisma.role.create({
		data: { name: "upa" },
	});

	const mahasiswaRole = await prisma.role.create({
		data: { name: "mahasiswa" },
	});

	const superAdminRole = await prisma.role.create({
		data: { name: "super_admin" },
	});

	const adminFakultasRole = await prisma.role.create({
		data: { name: "admin_fakultas" },
	});

	const stafFakultasRole = await prisma.role.create({
		data: { name: "staf_fakultas" },
	});

	const manajerTuRole = await prisma.role.create({
		data: { name: "manajer_tu" },
	});

	console.log("✅ Roles created!\n");

	// ==============================================
	// MASTER DATA - Departemen & Program Studi
	// ==============================================
	console.log("🏢 Creating Departemen & Program Studi...");

	const departemenInformatika = await prisma.departemen.create({
		data: {
			name: "Departemen Informatika",
			code: "DEPT-IF",
		},
	});

	const prodiS1Informatika = await prisma.programStudi.create({
		data: {
			name: "S1 Informatika",
			code: "IF-S1",
			departemenId: departemenInformatika.id,
		},
	});

	// Departemen Matematika
	const departemenMatematika = await prisma.departemen.create({
		data: {
			name: "Departemen Matematika",
			code: "DEPT-MAT",
		},
	});

	await prisma.programStudi.create({
		data: {
			name: "S1 Matematika",
			code: "MAT-S1",
			departemenId: departemenMatematika.id,
		},
	});

	await prisma.programStudi.create({
		data: {
			name: "S2 Magister Matematika",
			code: "MAT-S2",
			departemenId: departemenMatematika.id,
		},
	});

	// Departemen Fisika
	const departemenFisika = await prisma.departemen.create({
		data: {
			name: "Departemen Fisika",
			code: "DEPT-FIS",
		},
	});

	await prisma.programStudi.create({
		data: {
			name: "S1 Fisika",
			code: "FIS-S1",
			departemenId: departemenFisika.id,
		},
	});

	await prisma.programStudi.create({
		data: {
			name: "S2 Magister Fisika",
			code: "FIS-S2",
			departemenId: departemenFisika.id,
		},
	});

	// Departemen Biologi
	const departemenBiologi = await prisma.departemen.create({
		data: {
			name: "Departemen Biologi",
			code: "DEPT-BIO",
		},
	});

	await prisma.programStudi.create({
		data: {
			name: "S1 Biologi",
			code: "BIO-S1",
			departemenId: departemenBiologi.id,
		},
	});

	await prisma.programStudi.create({
		data: {
			name: "S1 Bioteknologi",
			code: "BIO-BIOTEK-S1",
			departemenId: departemenBiologi.id,
		},
	});

	await prisma.programStudi.create({
		data: {
			name: "S2 Magister Biologi",
			code: "BIO-S2",
			departemenId: departemenBiologi.id,
		},
	});

	// Departemen Kimia
	const departemenKimia = await prisma.departemen.create({
		data: {
			name: "Departemen Kimia",
			code: "DEPT-KIM",
		},
	});

	await prisma.programStudi.create({
		data: {
			name: "S1 Kimia",
			code: "KIM-S1",
			departemenId: departemenKimia.id,
		},
	});

	await prisma.programStudi.create({
		data: {
			name: "S2 Magister Kimia",
			code: "KIM-S2",
			departemenId: departemenKimia.id,
		},
	});

	// Departemen Statistika
	const departemenStatistika = await prisma.departemen.create({
		data: {
			name: "Departemen Statistika",
			code: "DEPT-STAT",
		},
	});

	await prisma.programStudi.create({
		data: {
			name: "S1 Statistika",
			code: "STAT-S1",
			departemenId: departemenStatistika.id,
		},
	});

	// Doktor Sains dan Matematika
	const departemenDoktorSainsMatematika = await prisma.departemen.create({
		data: {
			name: "Doktor Sains dan Matematika",
			code: "DEPT-DSM",
		},
	});

	await prisma.programStudi.create({
		data: {
			name: "Doktor Sains dan Matematika",
			code: "DSM-S3",
			departemenId: departemenDoktorSainsMatematika.id,
		},
	});

	console.log("✅ Departemen & Program Studi created!\n");

	// ==============================================
	// MASTER DATA - Staff (Pegawai)
	// ==============================================
	console.log("👔 Creating Staff Members...");

	// 1. Admin Prodi
	const userAdminProdi = await prisma.user.create({
		data: {
			name: "Siti Rahma",
			email: "admin.prodi@informatika.ac.id",
			emailVerified: true,
		},
	});

	const pegawaiAdminProdi = await prisma.pegawai.create({
		data: {
			nip: "198501012010012001",
			jabatan: "Admin Program Studi",
			noHp: "081234567001",
			userId: userAdminProdi.id,
			departemenId: departemenInformatika.id,
			programStudiId: prodiS1Informatika.id,
		},
	});

	await prisma.userRole.create({
		data: {
			userId: userAdminProdi.id,
			roleId: adminProdiRole.id,
		},
	});

	await prisma.account.create({
		data: {
			id: `account_${userAdminProdi.id}`,
			accountId: userAdminProdi.email,
			providerId: "credential",
			userId: userAdminProdi.id,
			password: await hashPass("password123"),
		},
	});

	// 2. Kaprodi
	const userKaprodi = await prisma.user.create({
		data: {
			name: "Dr. Budi Santoso, M.Kom",
			email: "kaprodi@informatika.ac.id",
			emailVerified: true,
		},
	});

	const pegawaiKaprodi = await prisma.pegawai.create({
		data: {
			nip: "197505151998021002",
			jabatan: "Ketua Program Studi Informatika",
			noHp: "081234567002",
			userId: userKaprodi.id,
			departemenId: departemenInformatika.id,
			programStudiId: prodiS1Informatika.id,
		},
	});

	await prisma.userRole.create({
		data: {
			userId: userKaprodi.id,
			roleId: kaprodiRole.id,
		},
	});

	await prisma.account.create({
		data: {
			id: `account_${userKaprodi.id}`,
			accountId: userKaprodi.email,
			providerId: "credential",
			userId: userKaprodi.id,
			password: await hashPass("password123"),
		},
	});

	// Update prodi with ketua prodi
	await prisma.programStudi.update({
		where: { id: prodiS1Informatika.id },
		data: { ketuaProdiId: pegawaiKaprodi.id },
	});

	// 3. Admin Surat (Tata Usaha)
	const userAdminSurat = await prisma.user.create({
		data: {
			name: "Dewi Lestari",
			email: "admin.surat@tu.ac.id",
			emailVerified: true,
		},
	});

	const pegawaiAdminSurat = await prisma.pegawai.create({
		data: {
			nip: "199002102015042001",
			jabatan: "Admin Tata Usaha - Surat Menyurat",
			noHp: "081234567003",
			userId: userAdminSurat.id,
			departemenId: departemenInformatika.id,
			programStudiId: prodiS1Informatika.id,
		},
	});

	await prisma.userRole.create({
		data: {
			userId: userAdminSurat.id,
			roleId: adminSuratRole.id,
		},
	});

	await prisma.account.create({
		data: {
			id: `account_${userAdminSurat.id}`,
			accountId: userAdminSurat.email,
			providerId: "credential",
			userId: userAdminSurat.id,
			password: await hashPass("password123"),
		},
	});

	// 4. Supervisor Akademik
	const userSupervisor = await prisma.user.create({
		data: {
			name: "Prof. Dr. Ahmad Hidayat",
			email: "supervisor@akademik.ac.id",
			emailVerified: true,
		},
	});

	const pegawaiSupervisor = await prisma.pegawai.create({
		data: {
			nip: "197201051995121001",
			jabatan: "Supervisor Akademik",
			noHp: "081234567004",
			userId: userSupervisor.id,
			departemenId: departemenInformatika.id,
			programStudiId: prodiS1Informatika.id,
		},
	});

	await prisma.userRole.create({
		data: {
			userId: userSupervisor.id,
			roleId: supervisorRole.id,
		},
	});

	await prisma.account.create({
		data: {
			id: `account_${userSupervisor.id}`,
			accountId: userSupervisor.email,
			providerId: "credential",
			userId: userSupervisor.id,
			password: await hashPass("password123"),
		},
	});

	// 5. UPA (Unit Pengelola Akademik) - Critical for final step
	const userUPA = await prisma.user.create({
		data: {
			name: "Rina Wijaya, S.S.",
			email: "upa@akademik.ac.id",
			emailVerified: true,
		},
	});

	const pegawaiUPA = await prisma.pegawai.create({
		data: {
			nip: "198803202012032002",
			jabatan: "Staff Unit Pengelola Akademik",
			noHp: "081234567005",
			userId: userUPA.id,
			departemenId: departemenInformatika.id,
			programStudiId: prodiS1Informatika.id,
		},
	});

	await prisma.userRole.create({
		data: {
			userId: userUPA.id,
			roleId: upaRole.id,
		},
	});

	await prisma.account.create({
		data: {
			id: `account_${userUPA.id}`,
			accountId: userUPA.email,
			providerId: "credential",
			userId: userUPA.id,
			password: await hashPass("password123"),
		},
	});

	// 6. Admin Fakultas
	const userAdminFakultas = await prisma.user.create({
		data: {
			name: "Drs. Bambang Suryanto, M.Si",
			email: "admin.fakultas@fsm.ac.id",
			emailVerified: true,
		},
	});

	const pegawaiAdminFakultas = await prisma.pegawai.create({
		data: {
			nip: "196805151993031001",
			jabatan: "Admin Fakultas",
			noHp: "08123456701",
			userId: userAdminFakultas.id,
			departemenId: departemenInformatika.id,
			programStudiId: prodiS1Informatika.id,
		},
	});

	await prisma.userRole.create({
		data: {
			userId: userAdminFakultas.id,
			roleId: adminFakultasRole.id,
		},
	});

	await prisma.account.create({
		data: {
			id: `account_${userAdminFakultas.id}`,
			accountId: userAdminFakultas.email,
			providerId: "credential",
			userId: userAdminFakultas.id,
			password: await hashPass("password123"),
		},
	});

	// 7. Staf Fakultas
	const userStafFakultas = await prisma.user.create({
		data: {
			name: "Sri Wahyuni, S.Sos",
			email: "staf.fakultas@fsm.ac.id",
			emailVerified: true,
		},
	});

	const pegawaiStafFakultas = await prisma.pegawai.create({
		data: {
			nip: "197203101995122001",
			jabatan: "Staf Fakultas",
			noHp: "08123456702",
			userId: userStafFakultas.id,
			departemenId: departemenInformatika.id,
			programStudiId: prodiS1Informatika.id,
		},
	});

	await prisma.userRole.create({
		data: {
			userId: userStafFakultas.id,
			roleId: stafFakultasRole.id,
		},
	});

	await prisma.account.create({
		data: {
			id: `account_${userStafFakultas.id}`,
			accountId: userStafFakultas.email,
			providerId: "credential",
			userId: userStafFakultas.id,
			password: await hashPass("password123"),
		},
	});

	// 8. Manajer TU
	const userManajerTU = await prisma.user.create({
		data: {
			name: "Ir. Agus Prasetyo, M.M",
			email: "manajer.tu@fsm.ac.id",
			emailVerified: true,
		},
	});

	const pegawaiManajerTU = await prisma.pegawai.create({
		data: {
			nip: "196512201990031002",
			jabatan: "Manajer Tata Usaha",
			noHp: "08123456703",
			userId: userManajerTU.id,
			departemenId: departemenInformatika.id,
			programStudiId: prodiS1Informatika.id,
		},
	});

	await prisma.userRole.create({
		data: {
			userId: userManajerTU.id,
			roleId: manajerTuRole.id,
		},
	});

	await prisma.account.create({
		data: {
			id: `account_${userManajerTU.id}`,
			accountId: userManajerTU.email,
			providerId: "credential",
			userId: userManajerTU.id,
			password: await hashPass("password123"),
		},
	});

	// 6. Super Admin
	const userSuperAdmin = await prisma.user.create({
		data: {
			name: "Super Administrator",
			email: "superadmin@system.ac.id",
			emailVerified: true,
		},
	});

	await prisma.userRole.create({
		data: {
			userId: userSuperAdmin.id,
			roleId: superAdminRole.id,
		},
	});

	await prisma.account.create({
		data: {
			id: `account_${userSuperAdmin.id}`,
			accountId: userSuperAdmin.email,
			providerId: "credential",
			userId: userSuperAdmin.id,
			password: await hashPass("password123"),
		},
	});

	const pegawaiSuperAdmin = await prisma.pegawai.create({
		data: {
			nip: "199901010000000001",
			jabatan: "Super Administrator",
			noHp: "081234567890",
			userId: userSuperAdmin.id,
			departemenId: departemenInformatika.id,
			programStudiId: prodiS1Informatika.id,
		},
	});

	console.log("✅ Staff members created!\n");

	// ==============================================
	// MASTER DATA - Mahasiswa
	// ==============================================
	console.log("🎓 Creating Students...");

	// 1. Andi - Complete workflow
	const userAndi = await prisma.user.create({
		data: {
			name: "Andi Pratama",
			email: "andi.pratama@students.ac.id",
			emailVerified: true,
		},
	});

	const mahasiswaAndi = await prisma.mahasiswa.create({
		data: {
			nim: "H071201001",
			tahunMasuk: "2020",
			noHp: "081298765001",
			alamat: "Jl. Perintis Kemerdekaan No. 10, Makassar",
			tempatLahir: "Makassar",
			tanggalLahir: new Date("2002-03-15"),
			userId: userAndi.id,
			departemenId: departemenInformatika.id,
			programStudiId: prodiS1Informatika.id,
		},
	});

	await prisma.userRole.create({
		data: {
			userId: userAndi.id,
			roleId: mahasiswaRole.id,
		},
	});

	await prisma.account.create({
		data: {
			id: `account_${userAndi.id}`,
			accountId: userAndi.email,
			providerId: "credential",
			userId: userAndi.id,
			password: await hashPass("password123"),
		},
	});

	// 2. Budi - Pending at UPA
	const userBudi = await prisma.user.create({
		data: {
			name: "Budi Setiawan",
			email: "budi.setiawan@students.ac.id",
			emailVerified: true,
		},
	});

	const mahasiswaBudi = await prisma.mahasiswa.create({
		data: {
			nim: "H071201002",
			tahunMasuk: "2020",
			noHp: "081298765002",
			alamat: "Jl. Urip Sumoharjo No. 25, Makassar",
			tempatLahir: "Parepare",
			tanggalLahir: new Date("2001-08-20"),
			userId: userBudi.id,
			departemenId: departemenInformatika.id,
			programStudiId: prodiS1Informatika.id,
		},
	});

	await prisma.userRole.create({
		data: {
			userId: userBudi.id,
			roleId: mahasiswaRole.id,
		},
	});

	await prisma.account.create({
		data: {
			id: `account_${userBudi.id}`,
			accountId: userBudi.email,
			providerId: "credential",
			userId: userBudi.id,
			password: await hashPass("password123"),
		},
	});

	// 3. Citra - Revision requested
	const userCitra = await prisma.user.create({
		data: {
			name: "Citra Ayu Lestari",
			email: "citra.ayu@students.ac.id",
			emailVerified: true,
		},
	});

	const mahasiswaCitra = await prisma.mahasiswa.create({
		data: {
			nim: "H071201003",
			tahunMasuk: "2020",
			noHp: "081298765003",
			alamat: "Jl. Sultan Alauddin No. 88, Makassar",
			tempatLahir: "Bone",
			tanggalLahir: new Date("2002-11-05"),
			userId: userCitra.id,
			departemenId: departemenInformatika.id,
			programStudiId: prodiS1Informatika.id,
		},
	});

	await prisma.userRole.create({
		data: {
			userId: userCitra.id,
			roleId: mahasiswaRole.id,
		},
	});

	await prisma.account.create({
		data: {
			id: `account_${userCitra.id}`,
			accountId: userCitra.email,
			providerId: "credential",
			userId: userCitra.id,
			password: await hashPass("password123"),
		},
	});

	console.log("✅ Students created!\n");

	// ==============================================
	// ADDITIONAL DATA - NEW DEPARTMENTS
	// ==============================================
	console.log("👥 Creating staff and students for new departments...\n");

	// Get all new program studi
	const prodiMatS1 = await prisma.programStudi.findFirst({ where: { code: "MAT-S1" } });
	const prodiMatS2 = await prisma.programStudi.findFirst({ where: { code: "MAT-S2" } });
	const prodiFisS1 = await prisma.programStudi.findFirst({ where: { code: "FIS-S1" } });
	const prodiFisS2 = await prisma.programStudi.findFirst({ where: { code: "FIS-S2" } });
	const prodiBioS1 = await prisma.programStudi.findFirst({ where: { code: "BIO-S1" } });
	const prodiBiotekS1 = await prisma.programStudi.findFirst({ where: { code: "BIO-BIOTEK-S1" } });
	const prodiBioS2 = await prisma.programStudi.findFirst({ where: { code: "BIO-S2" } });
	const prodiKimS1 = await prisma.programStudi.findFirst({ where: { code: "KIM-S1" } });
	const prodiKimS2 = await prisma.programStudi.findFirst({ where: { code: "KIM-S2" } });
	const prodiStatS1 = await prisma.programStudi.findFirst({ where: { code: "STAT-S1" } });
	const prodiDSM = await prisma.programStudi.findFirst({ where: { code: "DSM-S3" } });

	// Helper function to create admin prodi
	async function createAdminProdi(name: string, email: string, nip: string, prodi: any, dept: any) {
		const user = await prisma.user.create({
			data: { name, email, emailVerified: true },
		});

		const pegawai = await prisma.pegawai.create({
			data: {
				nip,
				jabatan: "Admin Program Studi",
				noHp: "08123456789",
				userId: user.id,
				departemenId: dept.id,
				programStudiId: prodi.id,
			},
		});

		await prisma.userRole.create({
			data: { userId: user.id, roleId: adminProdiRole.id },
		});

		await prisma.account.create({
			data: {
				id: `account_${user.id}`,
				accountId: email,
				providerId: "credential",
				userId: user.id,
				password: await hashPass("password123"),
			},
		});

		return pegawai;
	}

	// Helper function to create kaprodi
	async function createKaprodi(name: string, email: string, nip: string, prodi: any, dept: any) {
		const user = await prisma.user.create({
			data: { name, email, emailVerified: true },
		});

		const pegawai = await prisma.pegawai.create({
			data: {
				nip,
				jabatan: "Ketua Program Studi",
				noHp: "08123456789",
				userId: user.id,
				departemenId: dept.id,
				programStudiId: prodi.id,
			},
		});

		await prisma.userRole.create({
			data: { userId: user.id, roleId: kaprodiRole.id },
		});

		await prisma.account.create({
			data: {
				id: `account_${user.id}`,
				accountId: email,
				providerId: "credential",
				userId: user.id,
				password: await hashPass("password123"),
			},
		});

		// Update prodi with ketua prodi
		await prisma.programStudi.update({
			where: { id: prodi.id },
			data: { ketuaProdiId: pegawai.id },
		});

		return pegawai;
	}

	// Helper function to create mahasiswa
	async function createMahasiswa(name: string, email: string, nim: string, prodi: any, dept: any) {
		const user = await prisma.user.create({
			data: { name, email, emailVerified: true },
		});

		const mahasiswa = await prisma.mahasiswa.create({
			data: {
				nim,
				tahunMasuk: "2020",
				noHp: "08123456789",
				alamat: "Semarang, Indonesia",
				tempatLahir: "Semarang",
				tanggalLahir: new Date("2002-01-15"),
				userId: user.id,
				departemenId: dept.id,
				programStudiId: prodi.id,
			},
		});

		await prisma.userRole.create({
			data: { userId: user.id, roleId: mahasiswaRole.id },
		});

		await prisma.account.create({
			data: {
				id: `account_${user.id}`,
				accountId: email,
				providerId: "credential",
				userId: user.id,
				password: await hashPass("password123"),
			},
		});

		return mahasiswa;
	}

	// MATEMATIKA
	console.log("  🔢 Matematika...");
	await createAdminProdi("Admin Matematika S1", "admin.prodi@mat-s1.ac.id", "198601012011012001", prodiMatS1, departemenMatematika);
	await createKaprodi("Dr. Siti Nurhaliza, M.Si", "kaprodi@mat-s1.ac.id", "197505052005011001", prodiMatS1, departemenMatematika);
	await createMahasiswa("Dwi Matematika", "dwi@mat-s1.ac.id", "H011201001", prodiMatS1, departemenMatematika);

	await createAdminProdi("Admin Matematika S2", "admin.prodi@mat-s2.ac.id", "198602022011012002", prodiMatS2, departemenMatematika);
	await createKaprodi("Prof. Dr. Ahmad Hidayat, M.Si", "kaprodi@mat-s2.ac.id", "197006062005011002", prodiMatS2, departemenMatematika);
	await createMahasiswa("Joni Matematika S2", "joni@mat-s2.ac.id", "H012201001", prodiMatS2, departemenMatematika);

	// FISIKA
	console.log("  ⚛️ Fisika...");
	await createAdminProdi("Admin Fisika S1", "admin.prodi@fis-s1.ac.id", "198603032011012003", prodiFisS1, departemenFisika);
	await createKaprodi("Dr. Budi Fisika, M.Sc", "kaprodi@fis-s1.ac.id", "197107072005011003", prodiFisS1, departemenFisika);
	await createMahasiswa("Eko Fisika", "eko@fis-s1.ac.id", "H021201001", prodiFisS1, departemenFisika);

	await createAdminProdi("Admin Fisika S2", "admin.prodi@fis-s2.ac.id", "198604042011012004", prodiFisS2, departemenFisika);
	await createKaprodi("Prof. Dr. Cahya Fisika, M.Sc", "kaprodi@fis-s2.ac.id", "197208082005011004", prodiFisS2, departemenFisika);
	await createMahasiswa("Kiki Fisika S2", "kiki@fis-s2.ac.id", "H022201001", prodiFisS2, departemenFisika);

	// BIOLOGI
	console.log("  🧬 Biologi...");
	await createAdminProdi("Admin Biologi S1", "admin.prodi@bio-s1.ac.id", "198605052011012005", prodiBioS1, departemenBiologi);
	await createKaprodi("Dr. Dewi Biologi, M.Si", "kaprodi@bio-s1.ac.id", "197309092005011005", prodiBioS1, departemenBiologi);
	await createMahasiswa("Fajar Biologi", "fajar@bio-s1.ac.id", "H031201001", prodiBioS1, departemenBiologi);

	await createAdminProdi("Admin Bioteknologi", "admin.prodi@biotek-s1.ac.id", "198606062011012006", prodiBiotekS1, departemenBiologi);
	await createKaprodi("Dr. Eka Bioteknologi, M.Si", "kaprodi@biotek-s1.ac.id", "197410102005011006", prodiBiotekS1, departemenBiologi);
	await createMahasiswa("Gita Bioteknologi", "gita@biotek-s1.ac.id", "H031201002", prodiBiotekS1, departemenBiologi);

	await createAdminProdi("Admin Biologi S2", "admin.prodi@bio-s2.ac.id", "198607072011012007", prodiBioS2, departemenBiologi);
	await createKaprodi("Prof. Dr. Farah Biologi, M.Si", "kaprodi@bio-s2.ac.id", "197511112005011007", prodiBioS2, departemenBiologi);
	await createMahasiswa("Lulu Biologi S2", "lulu@bio-s2.ac.id", "H032201001", prodiBioS2, departemenBiologi);

	// KIMIA
	console.log("  ⚗️ Kimia...");
	await createAdminProdi("Admin Kimia S1", "admin.prodi@kim-s1.ac.id", "198608082011012008", prodiKimS1, departemenKimia);
	await createKaprodi("Dr. Hadi Kimia, M.Si", "kaprodi@kim-s1.ac.id", "197612122005011008", prodiKimS1, departemenKimia);
	await createMahasiswa("Hana Kimia", "hana@kim-s1.ac.id", "H041201001", prodiKimS1, departemenKimia);

	await createAdminProdi("Admin Kimia S2", "admin.prodi@kim-s2.ac.id", "198609092011012009", prodiKimS2, departemenKimia);
	await createKaprodi("Prof. Dr. Indah Kimia, M.Si", "kaprodi@kim-s2.ac.id", "197701012005011009", prodiKimS2, departemenKimia);
	await createMahasiswa("Maman Kimia S2", "maman@kim-s2.ac.id", "H042201001", prodiKimS2, departemenKimia);

	// STATISTIKA
	console.log("  📊 Statistika...");
	await createAdminProdi("Admin Statistika", "admin.prodi@stat-s1.ac.id", "198610102011012010", prodiStatS1, departemenStatistika);
	await createKaprodi("Dr. Joko Statistika, M.Si", "kaprodi@stat-s1.ac.id", "197802022005011010", prodiStatS1, departemenStatistika);
	await createMahasiswa("Ika Statistika", "ika@stat-s1.ac.id", "H051201001", prodiStatS1, departemenStatistika);

	// DOKTOR SAINS DAN MATEMATIKA
	console.log("  🎓 Doktor Sains...");
	await createAdminProdi("Admin Doktor Sains", "admin.prodi@dsm-s3.ac.id", "198611112011012011", prodiDSM, departemenDoktorSainsMatematika);
	await createKaprodi("Prof. Dr. Kusuma Doktor, M.Si", "kaprodi@dsm-s3.ac.id", "197903032005011011", prodiDSM, departemenDoktorSainsMatematika);
	await createMahasiswa("Nina Doktor", "nina@dsm-s3.ac.id", "H063201001", prodiDSM, departemenDoktorSainsMatematika);

	console.log("✅ New departments staff and students created!\n");

	// ==============================================
	// TRANSACTION DATA - SKL Submissions
	// ==============================================
	console.log("📄 Creating SKL Submissions...\n");

	// ===============================================
	// CASE A: Andi - COMPLETED (Full Workflow)
	// ===============================================
	console.log("  📋 Case A: Andi - COMPLETED workflow");

	const pengajuanAndi = await prisma.pengajuanSkl.create({
		data: {
			mahasiswaId: mahasiswaAndi.id,
			tglLulus: new Date("2024-12-15"),
			ipkTerakhir: 3.87,
			nomorSuratPengantar: "001/PRODI-IF/SKL/I/2026",
			adminProdiId: pegawaiAdminProdi.id,
			nomorSkl: "SKL/001/IF/2026",
			pegawaiUpaId: pegawaiUPA.id,
			status: "COMPLETED",
		},
	});

	// Lampiran Andi
	await prisma.lampiranSkl.createMany({
		data: [
			{
				pengajuanSklId: pengajuanAndi.id,
				jenisDokumen: "KTM",
				namaFile: "KTM Andi Pratama",
				pathFile: "/uploads/andi/ktm_andi.pdf",
			},
			{
				pengajuanSklId: pengajuanAndi.id,
				jenisDokumen: "TRANSKRIP_NILAI",
				namaFile: "Transkrip Nilai Andi Pratama",
				pathFile: "/uploads/andi/transkrip_andi.pdf",
			},
			{
				pengajuanSklId: pengajuanAndi.id,
				jenisDokumen: "BERITA_ACARA_UJIAN",
				namaFile: "Berita Acara Ujian Andi Pratama",
				pathFile: "/uploads/andi/ba_ujian_andi.pdf",
			},
			{
				pengajuanSklId: pengajuanAndi.id,
				jenisDokumen: "BEBAS_PUSTAKA",
				namaFile: "Bebas Pustaka Andi Pratama",
				pathFile: "/uploads/andi/bebas_pustaka_andi.pdf",
			},
			{
				pengajuanSklId: pengajuanAndi.id,
				jenisDokumen: "PAS_FOTO",
				namaFile: "Pas Foto Andi Pratama",
				pathFile: "/uploads/andi/pas_foto_andi.jpg",
			},
		],
	});

	// History Andi (Complete workflow)
	await prisma.riwayatPengajuanSkl.createMany({
		data: [
			{
				pengajuanSklId: pengajuanAndi.id,
				actorId: userAndi.id,
				statusBaru: "DRAFT",
				catatan: "Pengajuan dibuat oleh mahasiswa",
				timestamp: new Date("2026-01-10T09:00:00Z"),
			},
			{
				pengajuanSklId: pengajuanAndi.id,
				actorId: userAndi.id,
				statusBaru: "SUBMITTED",
				catatan: "Pengajuan disubmit untuk verifikasi",
				timestamp: new Date("2026-01-10T10:30:00Z"),
			},
			{
				pengajuanSklId: pengajuanAndi.id,
				actorId: userAdminProdi.id,
				statusBaru: "VERIFIED_ADMIN",
				catatan: "Data telah diverifikasi Admin Prodi",
				timestamp: new Date("2026-01-11T14:00:00Z"),
			},
			{
				pengajuanSklId: pengajuanAndi.id,
				actorId: userKaprodi.id,
				statusBaru: "APPROVED_KAPRODI",
				catatan: "Disetujui oleh Ketua Program Studi",
				timestamp: new Date("2026-01-12T11:00:00Z"),
			},
			{
				pengajuanSklId: pengajuanAndi.id,
				actorId: userAdminSurat.id,
				statusBaru: "REGISTERED",
				catatan: "Nomor surat pengantar telah didaftarkan",
				timestamp: new Date("2026-01-15T09:30:00Z"),
			},
			{
				pengajuanSklId: pengajuanAndi.id,
				actorId: userSupervisor.id,
				statusBaru: "SIAP_CETAK",
				catatan: "Dokumen telah diverifikasi Supervisor dan siap cetak",
				timestamp: new Date("2026-01-18T13:00:00Z"),
			},
			{
				pengajuanSklId: pengajuanAndi.id,
				actorId: userUPA.id,
				statusBaru: "COMPLETED",
				catatan: "SKL telah dicetak dan dinomori oleh UPA",
				timestamp: new Date("2026-01-20T15:00:00Z"),
			},
		],
	});

	console.log("  ✅ Andi's submission completed");

	// ===============================================
	// CASE B: Budi - SIAP_CETAK (Waiting for UPA)
	// ===============================================
	console.log("  📋 Case B: Budi - SIAP_CETAK (pending UPA)");

	const pengajuanBudi = await prisma.pengajuanSkl.create({
		data: {
			mahasiswaId: mahasiswaBudi.id,
			tglLulus: new Date("2024-12-20"),
			ipkTerakhir: 3.65,
			nomorSuratPengantar: "002/PRODI-IF/SKL/I/2026",
			adminProdiId: pegawaiAdminProdi.id,
			nomorSkl: null, // Belum dinomori UPA
			pegawaiUpaId: null, // Belum sampai UPA
			status: "SIAP_CETAK",
		},
	});

	// Lampiran Budi
	await prisma.lampiranSkl.createMany({
		data: [
			{
				pengajuanSklId: pengajuanBudi.id,
				jenisDokumen: "KTM",
				namaFile: "KTM Budi Setiawan",
				pathFile: "/uploads/budi/ktm_budi.pdf",
			},
			{
				pengajuanSklId: pengajuanBudi.id,
				jenisDokumen: "TRANSKRIP_NILAI",
				namaFile: "Transkrip Nilai Budi Setiawan",
				pathFile: "/uploads/budi/transkrip_budi.pdf",
			},
			{
				pengajuanSklId: pengajuanBudi.id,
				jenisDokumen: "BERITA_ACARA_UJIAN",
				namaFile: "Berita Acara Ujian Budi Setiawan",
				pathFile: "/uploads/budi/ba_ujian_budi.pdf",
			},
			{
				pengajuanSklId: pengajuanBudi.id,
				jenisDokumen: "BEBAS_PUSTAKA",
				namaFile: "Bebas Pustaka Budi Setiawan",
				pathFile: "/uploads/budi/bebas_pustaka_budi.pdf",
			},
			{
				pengajuanSklId: pengajuanBudi.id,
				jenisDokumen: "PAS_FOTO",
				namaFile: "Pas Foto Budi Setiawan",
				pathFile: "/uploads/budi/pas_foto_budi.jpg",
			},
		],
	});

	// History Budi (Up to SIAP_CETAK)
	await prisma.riwayatPengajuanSkl.createMany({
		data: [
			{
				pengajuanSklId: pengajuanBudi.id,
				actorId: userBudi.id,
				statusBaru: "DRAFT",
				catatan: "Pengajuan dibuat oleh mahasiswa",
				timestamp: new Date("2026-01-12T10:00:00Z"),
			},
			{
				pengajuanSklId: pengajuanBudi.id,
				actorId: userBudi.id,
				statusBaru: "SUBMITTED",
				catatan: "Pengajuan disubmit untuk verifikasi",
				timestamp: new Date("2026-01-12T14:00:00Z"),
			},
			{
				pengajuanSklId: pengajuanBudi.id,
				actorId: userAdminProdi.id,
				statusBaru: "VERIFIED_ADMIN",
				catatan: "Data telah diverifikasi Admin Prodi",
				timestamp: new Date("2026-01-13T11:00:00Z"),
			},
			{
				pengajuanSklId: pengajuanBudi.id,
				actorId: userKaprodi.id,
				statusBaru: "APPROVED_KAPRODI",
				catatan: "Disetujui oleh Ketua Program Studi",
				timestamp: new Date("2026-01-14T15:30:00Z"),
			},
			{
				pengajuanSklId: pengajuanBudi.id,
				actorId: userAdminSurat.id,
				statusBaru: "REGISTERED",
				catatan: "Nomor surat pengantar telah didaftarkan",
				timestamp: new Date("2026-01-16T10:00:00Z"),
			},
			{
				pengajuanSklId: pengajuanBudi.id,
				actorId: userSupervisor.id,
				statusBaru: "SIAP_CETAK",
				catatan: "Dokumen telah diverifikasi Supervisor, menunggu proses cetak di UPA",
				timestamp: new Date("2026-01-22T09:00:00Z"),
			},
		],
	});

	console.log("  ✅ Budi's submission completed");

	// ===============================================
	// CASE C: Citra - REVISI (Rejected by Admin)
	// ===============================================
	console.log("  📋 Case C: Citra - REVISI (rejected by Admin Prodi)");

	const pengajuanCitra = await prisma.pengajuanSkl.create({
		data: {
			mahasiswaId: mahasiswaCitra.id,
			tglLulus: new Date("2024-12-18"),
			ipkTerakhir: 3.52,
			nomorSuratPengantar: null, // Belum ada nomor
			adminProdiId: null, // Belum ada admin yang assign
			nomorSkl: null, // Belum ada nomor SKL
			pegawaiUpaId: null, // Belum sampai UPA
			status: "REVISI",
		},
	});

	// Lampiran Citra (dengan masalah)
	await prisma.lampiranSkl.createMany({
		data: [
			{
				pengajuanSklId: pengajuanCitra.id,
				jenisDokumen: "KTM",
				namaFile: "KTM Citra Ayu Lestari",
				pathFile: "/uploads/citra/ktm_citra.pdf",
			},
			{
				pengajuanSklId: pengajuanCitra.id,
				jenisDokumen: "TRANSKRIP_NILAI",
				namaFile: "Transkrip Nilai Citra Ayu Lestari",
				pathFile: "/uploads/citra/transkrip_citra.pdf", // File ini yang bermasalah
			},
			{
				pengajuanSklId: pengajuanCitra.id,
				jenisDokumen: "BERITA_ACARA_UJIAN",
				namaFile: "Berita Acara Ujian Citra Ayu Lestari",
				pathFile: "/uploads/citra/ba_ujian_citra.pdf",
			},
			{
				pengajuanSklId: pengajuanCitra.id,
				jenisDokumen: "PAS_FOTO",
				namaFile: "Pas Foto Citra Ayu Lestari",
				pathFile: "/uploads/citra/pas_foto_citra.jpg",
			},
		],
	});

	// History Citra (Draft -> Submit -> Revision)
	await prisma.riwayatPengajuanSkl.createMany({
		data: [
			{
				pengajuanSklId: pengajuanCitra.id,
				actorId: userCitra.id,
				statusBaru: "DRAFT",
				catatan: "Pengajuan dibuat oleh mahasiswa",
				timestamp: new Date("2026-01-25T13:00:00Z"),
			},
			{
				pengajuanSklId: pengajuanCitra.id,
				actorId: userCitra.id,
				statusBaru: "SUBMITTED",
				catatan: "Pengajuan disubmit untuk verifikasi",
				timestamp: new Date("2026-01-25T16:00:00Z"),
			},
			{
				pengajuanSklId: pengajuanCitra.id,
				actorId: userAdminProdi.id,
				statusBaru: "REVISI",
				catatan:
					"Scan transkrip buram dan tidak terbaca dengan jelas. Mohon upload ulang dengan kualitas lebih baik (min 300 DPI). Pastikan juga dokumen Bebas Pustaka sudah dilampirkan.",
				timestamp: new Date("2026-01-26T10:30:00Z"),
			},
		],
	});

	console.log("  ✅ Citra's submission completed");

	console.log("\n✅ SKL Submissions created!\n");

	// ==============================================
	// SUMMARY
	// ==============================================
	console.log("=".repeat(60));
	console.log("📊 SEED SUMMARY");
	console.log("=".repeat(60));
	console.log("\n🏢 MASTER DATA:");
	console.log(`  - Departemen: 1 (${departemenInformatika.name})`);
	console.log(`  - Program Studi: 1 (${prodiS1Informatika.name})`);
	console.log("  - Roles: 7 (admin_prodi, kaprodi, admin_surat, supervisor, upa, mahasiswa, super_admin)");

	console.log("\n👔 STAFF (Pegawai):");
	console.log(`  1. ${userAdminProdi.name} - Admin Prodi`);
	console.log(`  2. ${userKaprodi.name} - Kaprodi`);
	console.log(`  3. ${userAdminSurat.name} - Admin Surat`);
	console.log(`  4. ${userSupervisor.name} - Supervisor`);
	console.log(`  5. ${userUPA.name} - UPA`);
	console.log(`  6. ${userSuperAdmin.name} - Super Admin`);

	console.log("\n🎓 STUDENTS (Mahasiswa):");
	console.log(`  1. ${userAndi.name} (${mahasiswaAndi.nim})`);
	console.log(`  2. ${userBudi.name} (${mahasiswaBudi.nim})`);
	console.log(`  3. ${userCitra.name} (${mahasiswaCitra.nim})`);

	console.log("\n📄 SKL SUBMISSIONS:");
	console.log(`  1. ${userAndi.name} - Status: COMPLETED`);
	console.log("     ✅ Full workflow with numbering from Admin Prodi & UPA");
	console.log(`     📋 Nomor Surat: ${pengajuanAndi.nomorSuratPengantar}`);
	console.log(`     📋 Nomor SKL: ${pengajuanAndi.nomorSkl}`);

	console.log(`\n  2. ${userBudi.name} - Status: SIAP_CETAK`);
	console.log("     ⏳ Waiting for UPA to finalize and print");
	console.log(`     📋 Nomor Surat: ${pengajuanBudi.nomorSuratPengantar}`);
	console.log("     📋 Nomor SKL: (pending)");

	console.log(`\n  3. ${userCitra.name} - Status: REVISI`);
	console.log("     ❌ Rejected by Admin Prodi");
	console.log('     💬 Reason: "Scan transkrip buram"');
	console.log("     📋 Nomor Surat: (none)");
	console.log("     📋 Nomor SKL: (none)");

	console.log("\n" + "=".repeat(60));
	console.log("🎉 DATABASE SEED COMPLETED SUCCESSFULLY!");
	console.log("=".repeat(60));
	console.log("\n� Summary:");
	console.log("   - 7 Departemen");
	console.log("   - 13 Program Studi");
	console.log("   - 7 Roles");
	console.log("   - 28 Pegawai (6 original + 22 new)");
	console.log("   - 10 Mahasiswa (3 original + 7 new)");
	console.log("   - 3 Pengajuan SKL");
	console.log("\n�📝 LOGIN CREDENTIALS (all users):");
	console.log("   Password: password123");
	console.log("\n🔗 You can now test the SKL workflow with these accounts.\n");
}

main()
	.catch((e) => {
		console.error("\n❌ Error seeding database:");
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
