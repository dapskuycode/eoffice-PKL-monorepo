import { Elysia, t } from "elysia";
import { Prisma } from "@backend/db/index.ts";
import { authGuardPlugin } from "@backend/middlewares/auth.ts";
import { MinioService } from "@backend/services/minio.service.ts";

export default new Elysia()
	.use(authGuardPlugin)
	.get("/", async ({ query, user }) => {
		// Build where clause based on query parameters
		const where: any = {};

		// Filter by status(es) - support single or multiple statuses
		if (query.status) {
			const statuses = Array.isArray(query.status) ? query.status : [query.status];
			if (statuses.length === 1) {
				where.status = statuses[0];
			} else if (statuses.length > 1) {
				where.status = { in: statuses };
			}
		}

		// Filter by mahasiswaId if provided
		if (query.mahasiswaId) {
			where.mahasiswaId = query.mahasiswaId;
		}

		// Check user role - Admin Fakultas can see ALL prodi
		const userRoles = await Prisma.userRole.findMany({
			where: { userId: user.id },
			include: {
				role: true
			}
		});

		const isAdminFakultas = userRoles.some(ur => ur.role.name === 'admin_fakultas');
		const isStafFakultas = userRoles.some(ur => ur.role.name === 'staf_fakultas');
		const isSupervisor = userRoles.some(ur => ur.role.name === 'supervisor');
		const isUpa = userRoles.some(ur => ur.role.name === 'upa');
		const isManajerTu = userRoles.some(ur => ur.role.name === 'manajer_tu');

		// Skip prodi filtering for faculty-level roles
		const isFacultyLevelRole = isAdminFakultas || isStafFakultas || isSupervisor || isUpa || isManajerTu;

		// Check if user is Ketua Prodi or Admin Prodi - filter by their program studi
		// Get pegawai data to check if user is ketua prodi or admin prodi
		const pegawai = await Prisma.pegawai.findUnique({
			where: { userId: user.id },
			include: {
				ketuaDiProgramStudi: true,
				programStudi: true, // Admin prodi's program studi
			},
		});

		// Only apply prodi filtering if NOT a faculty-level role
		if (!isFacultyLevelRole) {
			// If user is ketua prodi, filter pengajuan by their program studi
			if (pegawai?.ketuaDiProgramStudi && pegawai.ketuaDiProgramStudi.length > 0) {
				const prodiIds = pegawai.ketuaDiProgramStudi.map(p => p.id);
				where.mahasiswa = {
					programStudiId: { in: prodiIds }
				};
				console.log('[GET /skl/pengajuan] Ketua Prodi detected, filtering by prodi:', prodiIds);
			}
			// If user is admin prodi (has programStudiId but not ketua), filter by their prodi
			else if (pegawai?.programStudiId) {
				where.mahasiswa = {
					programStudiId: pegawai.programStudiId
				};
				console.log('[GET /skl/pengajuan] Admin Prodi detected, filtering by prodi:', pegawai.programStudiId);
			}
		} else {
			console.log('[GET /skl/pengajuan] Faculty-level role detected, showing ALL prodi');
		}

		console.log('[GET /skl/pengajuan] Query params:', query);
		console.log('[GET /skl/pengajuan] Where clause:', JSON.stringify(where));

		const pengajuan = await Prisma.pengajuanSkl.findMany({
			where,
			include: {
				mahasiswa: {
					include: {
						user: true,
						programStudi: {
							include: {
								ketuaProdi: {
									include: {
										user: true,
									},
								},
							},
						},
						departemen: true,
					},
				},
				adminProdi: {
					include: {
						user: true,
					},
				},
				pegawaiUpa: {
					include: {
						user: true,
					},
				},
				riwayat: {
					include: {
						actor: true,
					},
					orderBy: {
						timestamp: "desc",
					},
				},
				lampiran: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		console.log(`[GET /skl/pengajuan] Found ${pengajuan.length} records`);

		return pengajuan;
	})

	.get("/:id", async ({ params: { id } }) => {
		const pengajuan = await Prisma.pengajuanSkl.findUnique({
			where: { id },
			include: {
				mahasiswa: {
					include: {
						user: true,
						programStudi: {
							include: {
								ketuaProdi: {
									include: {
										user: true,
									},
								},
							},
						},
						departemen: true,
					},
				},
				adminProdi: {
					include: {
						user: true,
					},
				},
				pegawaiUpa: {
					include: {
						user: true,
					},
				},
				riwayat: {
					include: {
						actor: true,
					},
					orderBy: {
						timestamp: "desc",
					},
				},
				lampiran: true,
			},
		});

		if (!pengajuan) {
			throw new Error("Pengajuan tidak ditemukan");
		}

		// Regenerate fresh presigned URLs for lampiran to prevent expiry issues
		if (pengajuan.lampiran && pengajuan.lampiran.length > 0) {
			pengajuan.lampiran = await Promise.all(
				pengajuan.lampiran.map(async (lamp) => {
					try {
						// Extract object name from the stored path
						// pathFile bisa berupa:
						// 1. Full presigned URL (legacy): http://localhost:9000/...
						// 2. Object path: lampiran/filename.jpg
						let objectName = lamp.pathFile;
						
						// If it's a full URL, extract the object path
						if (lamp.pathFile.includes('://')) {
							const url = new URL(lamp.pathFile);
							const pathname = decodeURIComponent(url.pathname);
							// Format: /bucket-name/lampiran/filename.jpg
							const parts = pathname.split('/').filter(Boolean);
							if (parts.length >= 2) {
								// Skip bucket name, join the rest
								objectName = parts.slice(1).join('/');
							}
						}
						
						// Remove category prefix if already present
						const cleanObjectName = objectName
							.replace(/^lampiran\//, '')
							.replace(/^signature\//, '');
						
						// Generate fresh presigned URL (7 days expiry)
						const freshUrl = await MinioService.getPresignedUrl(
							'lampiran',
							cleanObjectName,
							7 * 24 * 60 * 60
						);
						
						return {
							...lamp,
							pathFile: freshUrl,
						};
					} catch (error) {
						console.error(`Failed to generate presigned URL for ${lamp.id}:`, error);
						// Return original if regeneration fails
						return lamp;
					}
				})
			);
		}

		return pengajuan;
	})

	.delete("/:id", async ({ params: { id } }) => {
		// Check if pengajuan is a draft before deleting
		const pengajuan = await Prisma.pengajuanSkl.findUnique({
			where: { id },
		});

		if (!pengajuan) {
			throw new Error("Pengajuan tidak ditemukan");
		}

		if (pengajuan.status !== "DRAFT" && pengajuan.status !== "SUBMITTED") {
			throw new Error("Hanya draft atau pengajuan baru yang dapat dihapus");
		}

		// Delete related lampiran first
		await Prisma.lampiranSkl.deleteMany({
			where: { pengajuanSklId: id },
		});

		// Delete related riwayat
		await Prisma.riwayatPengajuanSkl.deleteMany({
			where: { pengajuanSklId: id },
		});

		// Delete the draft
		await Prisma.pengajuanSkl.delete({
			where: { id },
		});

		return { success: true, message: "Draft berhasil dihapus" };
	})

	.post(
		"/draft",
		async ({ body }) => {
			// Create or update draft pengajuan
			const pengajuan = await Prisma.pengajuanSkl.create({
				data: {
					mahasiswaId: body.mahasiswaId,
					tglLulus: body.tglLulus ? new Date(body.tglLulus) : undefined,
					ipkTerakhir: body.ipkTerakhir,
					jumlahSks: body.jumlahSks,
					status: "DRAFT",
					// Data identitas sementara
					namaSementara: body.namaSementara,
					nimSementara: body.nimSementara,
					emailSementara: body.emailSementara,
					prodiSementara: body.prodiSementara,
					departemenSementara: body.departemenSementara,
					noHpSementara: body.noHpSementara,
					alamatSementara: body.alamatSementara,
					tempatLahirSementara: body.tempatLahirSementara,
					tanggalLahirSementara: body.tanggalLahirSementara ? new Date(body.tanggalLahirSementara) : undefined,
					tandatangan: body.tandatangan,
				},
				include: {
					mahasiswa: {
						include: {
							user: true,
							programStudi: {
								include: {
									ketuaProdi: {
										include: {
											user: true,
										},
									},
								},
							},
							departemen: true,
						},
					},
				},
			});

			// Create initial history for draft
			await Prisma.riwayatPengajuanSkl.create({
				data: {
					pengajuanSklId: pengajuan.id,
					actorId: pengajuan.mahasiswa.userId,
					statusBaru: "DRAFT",
					catatan: "Draft pengajuan dibuat oleh mahasiswa",
				},
			});

			return pengajuan;
		},
		{
			body: t.Object({
				mahasiswaId: t.String(),
				namaSementara: t.Optional(t.String()),
				nimSementara: t.Optional(t.String()),
				emailSementara: t.Optional(t.String()),
				prodiSementara: t.Optional(t.String()),
				departemenSementara: t.Optional(t.String()),
				noHpSementara: t.Optional(t.String()),
				alamatSementara: t.Optional(t.String()),
				tempatLahirSementara: t.Optional(t.String()),
				tanggalLahirSementara: t.Optional(t.String()),
				tglLulus: t.Optional(t.String()),
				ipkTerakhir: t.Optional(t.Number()),
				jumlahSks: t.Optional(t.Number()),
				tandatangan: t.Optional(t.String()),
				draftStep: t.Optional(t.Number()),
				createLog: t.Optional(t.Boolean()),
			}),
		},
	)

	.post(
		"/",
		async ({ body }) => {
			const pengajuan = await Prisma.pengajuanSkl.create({
				data: {
					mahasiswaId: body.mahasiswaId,
					tglLulus: new Date(body.tglLulus),
					ipkTerakhir: body.ipkTerakhir,				jumlahSks: body.jumlahSks,					status: "DRAFT",
					// Data identitas sementara (optional)
					namaSementara: body.namaSementara,
					nimSementara: body.nimSementara,
					emailSementara: body.emailSementara,
					prodiSementara: body.prodiSementara,
					departemenSementara: body.departemenSementara,
					noHpSementara: body.noHpSementara,
					alamatSementara: body.alamatSementara,
					tempatLahirSementara: body.tempatLahirSementara,
					tanggalLahirSementara: body.tanggalLahirSementara ? new Date(body.tanggalLahirSementara) : undefined,
					tandatangan: body.tandatangan,
				},
				include: {
					mahasiswa: {
						include: {
							user: true,
							programStudi: {
								include: {
									ketuaProdi: {
										include: {
											user: true,
										},
									},
								},
							},
						},
					},
				},
			});

			// Create initial history
			await Prisma.riwayatPengajuanSkl.create({
				data: {
					pengajuanSklId: pengajuan.id,
					actorId: pengajuan.mahasiswa.userId,
					statusBaru: "DRAFT",
					catatan: "Pengajuan dibuat oleh mahasiswa",
				},
			});

			return pengajuan;
		},
		{
			body: t.Object({
				mahasiswaId: t.String(),
				tglLulus: t.String(),
				ipkTerakhir: t.Number(),
				jumlahSks: t.Optional(t.Number()),
				// Optional temporary identity data
				namaSementara: t.Optional(t.String()),
				nimSementara: t.Optional(t.String()),
				emailSementara: t.Optional(t.String()),
				prodiSementara: t.Optional(t.String()),
				departemenSementara: t.Optional(t.String()),
				noHpSementara: t.Optional(t.String()),
				alamatSementara: t.Optional(t.String()),
				tempatLahirSementara: t.Optional(t.String()),
				tanggalLahirSementara: t.Optional(t.String()),
				tandatangan: t.Optional(t.String()),
			}),
		},
	)

	.patch(
		"/:id",
		async ({ params: { id }, body }) => {
			// Update draft pengajuan
			const updateData: any = {
				updatedAt: new Date(),
			};

			// Update only provided fields
			if (body.hasOwnProperty('tglLulus') && body.tglLulus) updateData.tglLulus = new Date(body.tglLulus);
			if (body.hasOwnProperty('ipkTerakhir')) updateData.ipkTerakhir = body.ipkTerakhir;
			if (body.hasOwnProperty('jumlahSks')) updateData.jumlahSks = body.jumlahSks;
			if (body.hasOwnProperty('namaSementara')) updateData.namaSementara = body.namaSementara;
			if (body.hasOwnProperty('nimSementara')) updateData.nimSementara = body.nimSementara;
			if (body.hasOwnProperty('emailSementara')) updateData.emailSementara = body.emailSementara;
			if (body.hasOwnProperty('prodiSementara')) updateData.prodiSementara = body.prodiSementara;
			if (body.hasOwnProperty('departemenSementara')) updateData.departemenSementara = body.departemenSementara;
			if (body.hasOwnProperty('noHpSementara')) updateData.noHpSementara = body.noHpSementara;
			if (body.hasOwnProperty('alamatSementara')) updateData.alamatSementara = body.alamatSementara;
			if (body.hasOwnProperty('tempatLahirSementara')) updateData.tempatLahirSementara = body.tempatLahirSementara;
			if (body.hasOwnProperty('tanggalLahirSementara')) updateData.tanggalLahirSementara = body.tanggalLahirSementara ? new Date(body.tanggalLahirSementara) : null;
			if (body.hasOwnProperty('tandatangan')) updateData.tandatangan = body.tandatangan;

			const pengajuan = await Prisma.pengajuanSkl.update({
				where: { id },
				data: updateData,
				include: {
					mahasiswa: {
						include: {
							user: true,
							programStudi: {
								include: {
									ketuaProdi: {
										include: {
											user: true,
										},
									},
								},
							},
							departemen: true,
						},
					},
				},
			});


			// Create history log if requested
			if (body.createLog) {
				await Prisma.riwayatPengajuanSkl.create({
					data: {
						pengajuanSklId: pengajuan.id,
						actorId: pengajuan.mahasiswa.userId,
						statusBaru: pengajuan.status,
						catatan: "Draft pengajuan diperbarui oleh mahasiswa",
					},
				});
			}

			return pengajuan;
		},
		{
			body: t.Object({
				namaSementara: t.Optional(t.String()),
				nimSementara: t.Optional(t.String()),
				emailSementara: t.Optional(t.String()),
				prodiSementara: t.Optional(t.String()),
				departemenSementara: t.Optional(t.String()),
				noHpSementara: t.Optional(t.String()),
				alamatSementara: t.Optional(t.String()),
				tempatLahirSementara: t.Optional(t.String()),
				tanggalLahirSementara: t.Optional(t.String()),
				tglLulus: t.Optional(t.String()),
				ipkTerakhir: t.Optional(t.Number()),
				jumlahSks: t.Optional(t.Number()),
				tandatangan: t.Optional(t.String()),
				draftStep: t.Optional(t.Number()),
				createLog: t.Optional(t.Boolean()),
			}),
		},
	)  

	.patch(
		"/:id/status",
		async ({ params: { id }, body }) => {
			console.log(`[PATCH /skl/pengajuan/${id}/status] Updating status to:`, body.status);

			// Fetch current status to check for idempotency
			const currentPengajuan = await Prisma.pengajuanSkl.findUnique({
				where: { id },
				select: { status: true }
			});

			if (!currentPengajuan) {
				throw new Error("Pengajuan tidak ditemukan");
			}

			// If status is already the same, skip record update and history creation
			// This prevents duplicate history entries on rapid clicks
			if (currentPengajuan.status === body.status) {
				console.log(`[PATCH /skl/pengajuan/${id}/status] Status is already ${body.status}, skipping update.`);
				return await Prisma.pengajuanSkl.findUnique({ where: { id } });
			}

			const pengajuan = await Prisma.pengajuanSkl.update({
				where: { id },
				data: {
					status: body.status,
					...(body.nomorSuratPengantar && {
						nomorSuratPengantar: body.nomorSuratPengantar,
					}),
					...(body.adminProdiId && { adminProdiId: body.adminProdiId }),
					...(body.nomorSkl && { nomorSkl: body.nomorSkl }),
					...(body.pegawaiUpaId && { pegawaiUpaId: body.pegawaiUpaId }),
					...(body.tandatanganKaprodi && { ttdKetuaProdi: body.tandatanganKaprodi }),
					...(body.pdfFinalPath && { pdfFinalPath: body.pdfFinalPath }),
				},
			});

			console.log(`[PATCH /skl/pengajuan/${id}/status] Updated pengajuan:`, { id: pengajuan.id, status: pengajuan.status });

			// Create history entry
			await Prisma.riwayatPengajuanSkl.create({
				data: {
					pengajuanSklId: id,
					actorId: body.actorId,
					statusBaru: body.status,
					catatan: body.catatan || null,
				},
			});

			console.log(`[PATCH /skl/pengajuan/${id}/status] Created history entry`);

			return pengajuan;
		},
		{
			body: t.Object({
				status: t.Union([
					t.Literal("DRAFT"),
					t.Literal("SUBMITTED"),
					t.Literal("REVISI"),
					t.Literal("VERIFIED_ADMIN"),
					t.Literal("APPROVED_KAPRODI"),
					t.Literal("REGISTERING"),
					t.Literal("REGISTERED"),
					t.Literal("APPROVED_SUPERVISOR"),
					t.Literal("SIAP_CETAK"),
					t.Literal("STEP_KONVENSIONAL"),
					t.Literal("COMPLETED"),
					t.Literal("DITOLAK"),
					t.Literal("BATAL"),
				]),
				actorId: t.String(),
				catatan: t.Optional(t.String()),
				nomorSuratPengantar: t.Optional(t.String()),
				adminProdiId: t.Optional(t.String()),
				nomorSkl: t.Optional(t.String()),
				pegawaiUpaId: t.Optional(t.String()),
				tandatanganKaprodi: t.Optional(t.String()),
				pdfFinalPath: t.Optional(t.String()),
			}),
		},
	)

	.get("/:id/riwayat", async ({ params: { id } }) => {
		const riwayat = await Prisma.riwayatPengajuanSkl.findMany({
			where: { pengajuanSklId: id },
			include: {
				actor: true,
			},
			orderBy: {
				timestamp: "desc",
			},
		});
		return riwayat;
	})

	.post(
		"/:id/lampiran",
		async ({ params: { id }, body }) => {
			// Delete existing lampiran of the same category if it exists
			// This prevents "stacking" when re-uploading during edit/revision
			await Prisma.lampiranSkl.deleteMany({
				where: {
					pengajuanSklId: id,
					jenisDokumen: body.jenisDokumen,
				},
			});

			const lampiran = await Prisma.lampiranSkl.create({
				data: {
					pengajuanSklId: id,
					jenisDokumen: body.jenisDokumen,
					pathFile: body.pathFile,
				},
			});
			return lampiran;
		},
		{
			body: t.Object({
				jenisDokumen: t.Union([
					t.Literal("KTM"),
					t.Literal("TRANSKRIP_NILAI"),
					t.Literal("BERITA_ACARA_UJIAN"),
					t.Literal("BEBAS_PUSTAKA"),
					t.Literal("PAS_FOTO"),
					t.Literal("BUKTI_SUBMIT"),
					t.Literal("LAINNYA"),
				]),
				pathFile: t.String(),
			}),
		}
	)
	.delete(
		"/:id/lampiran/:jenis",
		async ({ params: { id, jenis } }) => {
			await Prisma.lampiranSkl.deleteMany({
				where: {
					pengajuanSklId: id,
					jenisDokumen: jenis as any,
				},
			});
			return { success: true };
		}
	);
