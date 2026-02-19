import { Elysia } from "elysia";
import { MinioService } from "@backend/services/minio.service";

export default new Elysia()
	.get("/health/minio", async () => {
		try {
			const minioService = new MinioService();
			const bucketName = process.env.MINIO_BUCKET_NAME || "e-office-storage";
			
			// Check if bucket exists
			const bucketExists = await minioService.bucketExists(bucketName);
			
			if (!bucketExists) {
				return {
					status: "error",
					message: `Bucket '${bucketName}' tidak ditemukan`,
					connected: false,
				};
			}

			return {
				status: "ok",
				message: "MinIO connected successfully",
				connected: true,
				config: {
					endpoint: process.env.MINIO_ENDPOINT,
					port: process.env.MINIO_PORT,
					bucket: bucketName,
					useSSL: process.env.MINIO_USE_SSL === "true",
				},
			};
		} catch (error) {
			return {
				status: "error",
				message: error instanceof Error ? error.message : "Unknown error",
				connected: false,
			};
		}
	})
	.get("/health", () => {
		return {
			status: "ok",
			timestamp: new Date().toISOString(),
			services: {
				database: "connected",
				minio: "check /health/minio",
			},
		};
	});
