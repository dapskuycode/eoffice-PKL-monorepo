import { Prisma } from "@backend/db/index.ts";

// Check if user has permission by querying the database directly
// This is more reliable than relying on in-memory Casbin state
export async function checkPermission(
	userId: string,
	resource: string,
	action: string,
): Promise<boolean> {
	// Get all roles for the user
	const userRoles = await Prisma.userRole.findMany({
		where: { userId },
		include: { role: true },
	});

	if (userRoles.length === 0) {
		return false;
	}

	// Super admin has access to everything
	const isSuperAdmin = userRoles.some((ur) => ur.role.name === "super_admin");
	if (isSuperAdmin) {
		return true;
	}

	const roleIds = userRoles.map((ur) => ur.roleId);

	// Check if any of the user's roles has the required permission
	const permission = await Prisma.rolePermission.findFirst({
		where: {
			roleId: { in: roleIds },
			permission: {
				resource,
				action,
			},
		},
	});

	return permission !== null;
}

// Get all roles for user from database
export async function getUserRoles(userId: string): Promise<string[]> {
	const userRoles = await Prisma.userRole.findMany({
		where: { userId },
		include: { role: true },
	});

	return userRoles.map((ur) => ur.role.name);
}

// Add permission to role (update DB)
export async function addPermissionToRole(
	roleName: string,
	resource: string,
	action: string,
): Promise<boolean> {
	const role = await Prisma.role.findUnique({ where: { name: roleName } });
	const permission = await Prisma.permission.findUnique({
		where: { resource_action: { resource, action } },
	});

	if (!role || !permission) return false;

	await Prisma.rolePermission.upsert({
		where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
		update: {},
		create: { roleId: role.id, permissionId: permission.id },
	});

	return true;
}

// Remove permission from role (update DB)
export async function removePermissionFromRole(
	roleName: string,
	resource: string,
	action: string,
): Promise<boolean> {
	const role = await Prisma.role.findUnique({ where: { name: roleName } });
	const permission = await Prisma.permission.findUnique({
		where: { resource_action: { resource, action } },
	});

	if (!role || !permission) return false;

	await Prisma.rolePermission.deleteMany({
		where: { roleId: role.id, permissionId: permission.id },
	});

	return true;
}

// Assign role to user (update DB)
export async function assignRoleToUser(
	userId: string,
	roleName: string,
): Promise<boolean> {
	const role = await Prisma.role.findUnique({ where: { name: roleName } });
	if (!role) return false;

	await Prisma.userRole.upsert({
		where: { userId_roleId: { userId, roleId: role.id } },
		update: {},
		create: { userId, roleId: role.id },
	});

	return true;
}

// Remove role from user (update DB)
export async function removeRoleFromUser(
	userId: string,
	roleName: string,
): Promise<boolean> {
	const role = await Prisma.role.findUnique({ where: { name: roleName } });
	if (!role) return false;

	await Prisma.userRole.deleteMany({
		where: { userId, roleId: role.id },
	});

	return true;
}

// Get all permissions for role
export async function getRolePermissions(roleName: string): Promise<string[][]> {
	const role = await Prisma.role.findUnique({
		where: { name: roleName },
		include: {
			rolePermission: {
				include: { permission: true },
			},
		},
	});

	if (!role) return [];

	return role.rolePermission.map((rp) => [rp.permission.resource, rp.permission.action]);
}
