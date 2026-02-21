import { syncPoliciesFromDatabase, checkPermission, getEnforcer } from "./src/lib/casbin.ts";
import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    console.log("Starting forced Casbin sync...");
    const enforcer = await getEnforcer();
    await syncPoliciesFromDatabase(enforcer);

    const user = await prisma.user.findFirst({
        where: { email: { contains: 'admin' } } // Find any admin
    });

    if (user) {
        console.log(`Checking permission for ${user.email} (ID: ${user.id})`);
        const canReadDep = await checkPermission(user.id, 'departemen', 'read');
        const canReadProdi = await checkPermission(user.id, 'prodi', 'read');
        console.log(`Result: departemen:read=${canReadDep}, prodi:read=${canReadProdi}`);
    }
}

main().finally(() => process.exit(0));
