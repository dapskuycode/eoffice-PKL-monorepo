// dont use any @ import for this file, better auth is picky
import { PrismaClient } from "@backend/db/index.ts";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { anonymous, bearer, jwt } from "better-auth/plugins";

const prisma = new PrismaClient();
export const auth = betterAuth({
	// database: prismaAdapter(Prisma, {
	// 	provider: "postgresql",
	// }),
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	experimental: {
		joins: true,
	},
	emailAndPassword: {
		enabled: true,
	},
	baseURL: process.env.BETTER_AUTH_BASE_URL || "http://localhost:3000",
	secret: process.env.BETTER_AUTH_SECRET || "your-secret-key-change-this-in-production",
	basePath: "/api/auth",
	trustedOrigins: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3079"],
	plugins: [
		anonymous(),
		bearer(),
		// jwt()
	],
});
