import { getEnforcer } from "./src/lib/casbin.ts";

async function main() {
    const userId = 'cmlm8jpm70029b1okb4hsiqe1';
    const enforcer = await getEnforcer();

    console.log("--- ENFORCER STATE ---");
    const policies = await enforcer.getPolicy();
    console.log(`Total Policies: ${policies.length}`);
    policies.filter(p => p[1] === 'mahasiswa').forEach(p => {
        console.log(`Policy: [${p.join(', ')}]`);
    });

    const grouping = await enforcer.getGroupingPolicy();
    console.log(`Total Grouping Policies: ${grouping.length}`);
    grouping.filter(g => g[0] === userId || g[1].includes('admin')).forEach(g => {
        console.log(`Grouping: [${g.join(', ')}]`);
    });

    const roles = await enforcer.getRolesForUser(userId);
    console.log(`Roles for ${userId}: [${roles.join(', ')}]`);

    const hasCreate = await enforcer.enforce(userId, 'mahasiswa', 'create');
    console.log(`FINAL RESULT for mahasiswa:create: ${hasCreate}`);
}

main().finally(() => process.exit(0));
