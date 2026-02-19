import { authGuardPlugin } from "@backend/middlewares/auth.ts";
import { Prisma as prisma } from '@backend/db/index.ts';
import { Elysia } from "elysia";

export default new Elysia()
	.use(authGuardPlugin)
	.get("/", async ({ query }) => {
		const { limit = '100', name = '' } = query as any;
		
		const where: any = {};
		
		if (name) {
			where.name = { contains: name, mode: 'insensitive' as const };
		}
		
		const roles = await prisma.role.findMany({
			where,
			take: parseInt(limit),
			orderBy: { name: 'asc' },
		});
		
		return {
			data: roles,
			total: roles.length,
		};
	});
