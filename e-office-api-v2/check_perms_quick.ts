import { Prisma } from './src/db/index.ts';

const role = await Prisma.role.findUnique({
    where: { name: 'super_admin' },
    include: {
        rolePermission: {
            include: { permission: true }
        }
    }
});

if (!role) { console.log('Role not found'); process.exit(1); }

const perms = role.rolePermission.map(rp => `${rp.permission.resource}:${rp.permission.action}`);
console.log('super_admin ALL permissions:');
perms.sort().forEach(p => console.log(' -', p));

const missing = ['prodi:create', 'prodi:write', 'prodi:delete', 'pegawai:create', 'pegawai:write', 'pegawai:delete'].filter(p => !perms.includes(p));
if (missing.length > 0) {
    console.log('\nMISSING permissions:', missing);
} else {
    console.log('\nAll prodi/pegawai permissions exist!');
}

await Prisma.$disconnect();
