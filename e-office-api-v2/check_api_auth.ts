import { app } from "./src/server.ts";
import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'superadmin@system.ac.id' }
    });

    if (!user) {
        console.log("❌ Super Admin user not found");
        return;
    }

    console.log(`Testing API as User ID: ${user.id} (${user.email})`);

    // We'll mock the request. In Elysia, we can use app.handle(request)
    // But first we need a session. Since we are server-side, we can't easily get a real session from better-auth
    // unless we use a mock or bypass.

    // Actually, I'll check the authGuardPlugin logic again.
    // It uses auth.api.getSession({ headers }).

    // I'll create a special test route that bypasses auth just to see if the data comes out.
    // Wait, I already know the data is in the DB.

    // The goal is to see why AUTH fails or if it returns empty.

    // Let's check permissions for THIS user in Casbin ONE MORE TIME.
    const { checkPermission, getUserRoles } = await import("./src/lib/casbin.ts");
    const roles = await getUserRoles(user.id);
    const allowed = await checkPermission(user.id, 'departemen', 'read');

    console.log('Roles:', roles);
    console.log('Allowed:', allowed);

    // If allowed is true, then the API SHOULD return data.
}

main().finally(() => process.exit(0));
