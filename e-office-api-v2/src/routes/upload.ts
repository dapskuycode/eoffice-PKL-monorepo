import { Elysia, t } from "elysia";
import { MinioService } from "@backend/services/minio.service.ts";
import { authGuardPlugin } from "@backend/middlewares/auth.ts";

export default new Elysia()
	.use(authGuardPlugin)
	.post(
		"/",
		async ({ body }) => {
			try {
				const { file, category } = body;
				
				// Ensure bucket exists
				await MinioService.ensureBucket();

				// Upload file to MinIO
				const result = await MinioService.uploadFile(
					file,
					category ? `${category}/` : "",
					file.type,
				);

				return {
					success: true,
					url: result.url,
					fileName: result.nameReplace,
					originalName: file.name,
					size: file.size,
					type: file.type,
				};
			} catch (error) {
				console.error("Upload error:", error);
				throw new Error(`Failed to upload file: ${error}`);
			}
		},
		{
			body: t.Object({
				file: t.File({
					type: [
						"image/jpeg",
						"image/jpg",
						"image/png",
						"image/gif",
						"application/pdf",
					],
					maxSize: 10 * 1024 * 1024, // 10MB
				}),
				category: t.Optional(t.String()),
			}),
		},
	)
	// Endpoint untuk list files di Minio
	.get("/list/:prefix?", async ({ params: { prefix } }) => {
		try {
			const files = await MinioService.listObjects(prefix || "");
			return {
				success: true,
				prefix: prefix || "all",
				files,
				total: files.length,
			};
		} catch (error) {
			console.error("List files error:", error);
			throw new Error(`Failed to list files: ${error}`);
		}
	})
	// Endpoint untuk list lampiran saja
	.get("/list-lampiran", async () => {
		try {
			const files = await MinioService.listObjects("lampiran/");
			return {
				success: true,
				category: "lampiran",
				files,
				total: files.length,
			};
		} catch (error) {
			console.error("List lampiran error:", error);
			throw new Error(`Failed to list lampiran: ${error}`);
		}
	});
