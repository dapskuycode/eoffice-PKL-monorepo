import { authGuardPlugin } from "@backend/middlewares/auth.ts";
import { Elysia } from "elysia";
import { Prisma } from "@backend/db/index.ts";

export default new Elysia().use(authGuardPlugin).get(
	"/",
	async ({ user }) => {
		// Get user roles directly from database
		const userWithRoles = await Prisma.user.findUnique({
			where: { id: user.id },
			include: {
				userRole: {
					include: {
						role: true
					}
				},
				pegawai: true, // Include pegawai data to check if user is pegawai
				mahasiswa: true // Include mahasiswa data if exists
			}
		});

		// Extract role names
		const roles = userWithRoles?.userRole.map(ur => ur.role.name) || [];

		// Get nama - mahasiswa has nama field, pegawai uses user.name
		const nama = userWithRoles?.mahasiswa?.nama || userWithRoles?.name || user.name || user.email;

		console.log('📋 /me endpoint - User:', user.email, 'Nama:', nama, 'Roles:', roles);

		return {
			...user,
			nama, // Add nama field
			roles,
			roleNames: roles, // Add roleNames for compatibility
		};
	},
	{},
);
