import { checkPermission, getUserRoles } from "./src/lib/casbin.ts";
import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'superadmin@system.ac.id' }
    });

    if (!user) {
        console.log("❌ User not found");
        return;
    }

    console.log(`User: ${user.email} (ID: ${user.id})`);
    const roles = await getUserRoles(user.id);
    console.log(`Roles: ${roles.join(', ')}`);

    const hasRead = await checkPermission(user.id, 'mahasiswa', 'read');
    const hasCreate = await checkPermission(user.id, 'mahasiswa', 'create');

    console.log(`Has mahasiswa:read ? ${hasRead}`);
    console.log(`Has mahasiswa:create ? ${hasCreate}`);
}

main().finally(() => process.exit(0));
