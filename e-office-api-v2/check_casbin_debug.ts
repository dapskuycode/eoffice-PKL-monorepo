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
    const roles = await getUserRoles(user.id);
    console.log(`Roles in Casbin: ${roles.join(', ')}`);

    const hasDepPerm = await checkPermission(user.id, 'departemen', 'read');
    console.log(`Has departemen:read permission? ${hasDepPerm}`);

    const hasUserPerm = await checkPermission(user.id, 'user', 'read');
    console.log(`Has user:read permission? ${hasUserPerm}`);
}

main().finally(() => process.exit(0));
