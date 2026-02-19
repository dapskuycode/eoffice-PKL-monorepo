import { checkPermission, getUserRoles } from "./src/lib/casbin.ts";
import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'superadmin@system.ac.id' },
        include: {
            userRole: { include: { role: true } }
        }
    });

    if (!user) {
        console.log("❌ User not found");
        return;
    }

    console.log(`User: ${user.email}`);
    console.log(`Roles in DB: ${user.userRole.map(ur => ur.role.name).join(', ')}`);

    const roles = await getUserRoles(user.id);
    console.log(`Roles in Casbin: ${roles.join(', ')}`);

    const hasPerm = await checkPermission(user.id, 'mahasiswa', 'read');
    console.log(`Has mahasiswa:read permission? ${hasPerm}`);

    const hasProdiPerm = await checkPermission(user.id, 'prodi', 'read');
    console.log(`Has prodi:read permission? ${hasProdiPerm}`);
}

main().finally(() => process.exit(0));
