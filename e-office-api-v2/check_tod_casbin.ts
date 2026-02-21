import { getEnforcer } from "./src/lib/casbin.ts";

async function main() {
    const userId = 'aL85g0AXG36THTzRhDOmzhqT'; // tod@gmail.com ID
    const enforcer = await getEnforcer();

    console.log(`--- ENFORCER STATE FOR ${userId} ---`);

    const roles = await enforcer.getRolesForUser(userId);
    console.log(`Roles in Casbin: [${roles.join(', ')}]`);

    const hasCreate = await enforcer.enforce(userId, 'mahasiswa', 'create');
    console.log(`FINAL RESULT for mahasiswa:create: ${hasCreate}`);
}

main().finally(() => process.exit(0));
