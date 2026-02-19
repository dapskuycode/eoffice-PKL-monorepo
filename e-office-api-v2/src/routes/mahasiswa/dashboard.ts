import { Elysia, t } from "elysia";
import { Prisma } from "@backend/db/index.ts";
import { authGuardPlugin } from "@backend/middlewares/auth.ts";

export default new Elysia()
	.use(authGuardPlugin)
	.get("/", async ({ user }) => {
		// Get mahasiswa with pengajuan only for statistics
		const mahasiswa = await Prisma.mahasiswa.findUnique({
			where: { userId: user.id },
			include: {
				user: {
					select: {
						name: true,
					},
				},
				pengajuanSkl: {
					orderBy: {
						createdAt: "desc",
					},
					include: {
						riwayat: {
							orderBy: {
								timestamp: "desc",
							},
							include: {
								actor: {
									select: {
										name: true,
										userRole: {
											select: {
												role: {
													select: {
														name: true,
													},
												},
											},
										},
									},
								},
							},
						},
						adminProdi: {
							select: {
								user: {
									select: {
										name: true,
									},
								},
							},
						},
						pegawaiUpa: {
							select: {
								user: {
									select: {
										name: true,
									},
								},
							},
						},
					},
				},
			},
		});

		if (!mahasiswa) {
			throw new Error("Data mahasiswa tidak ditemukan");
		}

		// Calculate statistics
		const totalPengajuan = mahasiswa.pengajuanSkl.length;
		const menunggu = mahasiswa.pengajuanSkl.filter(
			(p) =>
				p.status === "SUBMITTED" ||
				p.status === "VERIFIED_ADMIN" ||
				p.status === "APPROVED_KAPRODI" ||
				p.status === "REGISTERED" ||
				p.status === "MENUNGGU_PERSETUJUAN_ADMIN_PRODI" ||
				p.status === "MENUNGGU_PERSETUJUAN_KAPRODI" ||
				p.status === "SIAP_CETAK",
		).length;
		const selesai = mahasiswa.pengajuanSkl.filter(
			(p) => p.status === "COMPLETED",
		).length;
		const revisi = mahasiswa.pengajuanSkl.filter(
			(p) => p.status === "REVISI" || p.status === "REVISION",
		).length;
		const ditolak = mahasiswa.pengajuanSkl.filter(
			(p) => p.status === "DITOLAK" || p.status === "REJECTED",
		).length;

		// Get latest pengajuan
		const latestPengajuan = mahasiswa.pengajuanSkl[0] || null;

		return {
			nama: mahasiswa.user.name,
			statistics: {
				totalPengajuan,
				menunggu,
				selesai,
				revisi,
				ditolak,
			},
			latestPengajuan,
			allPengajuan: mahasiswa.pengajuanSkl, // Return all submissions
		};
	})
	.get("/profile", async ({ user }) => {
		// Get full mahasiswa profile data
		const mahasiswa = await Prisma.mahasiswa.findUnique({
			where: { userId: user.id },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				programStudi: {
					select: {
						id: true,
						name: true,
					},
				},
				departemen: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});

		if (!mahasiswa) {
			throw new Error("Data mahasiswa tidak ditemukan");
		}

		return {
			id: mahasiswa.id,
			nim: mahasiswa.nim,
			nama: mahasiswa.user.name,
			email: mahasiswa.user.email,
			tahunMasuk: mahasiswa.tahunMasuk,
			noHp: mahasiswa.noHp,
			alamat: mahasiswa.alamat,
			tempatLahir: mahasiswa.tempatLahir,
			tanggalLahir: mahasiswa.tanggalLahir,
			programStudi: mahasiswa.programStudi?.name ?? '',
			departemen: mahasiswa.departemen?.name ?? '',
			userId: mahasiswa.user.id,
		};
	})
	.put("/profile", async ({ user, body }) => {
		// Find mahasiswa by user id
		const mahasiswa = await Prisma.mahasiswa.findUnique({
			where: { userId: user.id },
		});

		if (!mahasiswa) {
			throw new Error("Data mahasiswa tidak ditemukan");
		}

		// Update user data (nama dan email)
		if (body.nama || body.email) {
			await Prisma.user.update({
				where: { id: user.id },
				data: {
					...(body.nama && { name: body.nama }),
					...(body.email && { email: body.email }),
				},
			});
		}

		// Update mahasiswa profile
		const updated = await Prisma.mahasiswa.update({
			where: { id: mahasiswa.id },
			data: {
				noHp: body.noHp ?? mahasiswa.noHp,
				tahunMasuk: body.tahunMasuk ?? mahasiswa.tahunMasuk,
				alamat: body.alamat ?? mahasiswa.alamat,
				tempatLahir: body.tempatLahir ?? mahasiswa.tempatLahir,
				tanggalLahir: body.tanggalLahir ? new Date(body.tanggalLahir) : mahasiswa.tanggalLahir,
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				programStudi: {
					select: {
						id: true,
						name: true,
					},
				},
				departemen: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});

		return {
			id: updated.id,
			nim: updated.nim,
			nama: updated.user.name,
			email: updated.user.email,
			tahunMasuk: updated.tahunMasuk,
			noHp: updated.noHp,
			alamat: updated.alamat,
			tempatLahir: updated.tempatLahir,
			tanggalLahir: updated.tanggalLahir,
			programStudi: updated.programStudi?.name ?? '',
			departemen: updated.departemen?.name ?? '',
			userId: updated.user.id,
		};
	}, {
		body: t.Object({
			nama: t.Optional(t.String()),
			email: t.Optional(t.String()),
			noHp: t.Optional(t.String()),
			tahunMasuk: t.Optional(t.String()),
			alamat: t.Optional(t.String()),
			tempatLahir: t.Optional(t.String()),
			tanggalLahir: t.Optional(t.String()),
		}),
	});
