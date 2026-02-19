
import { PrismaClient } from './src/generated/prisma';
import fs from 'fs';

const prisma = new PrismaClient();

async function checkPermissions() {
    const roles = await prisma.role.findMany({
        include: {
            permissions: {
                include: {
                    permission: true
                }
            }
        }
    });

    const permissions = await prisma.permission.findMany();
    const rolePermissions = await prisma.rolePermission.findMany({
        include: {
            role: true,
            permission: true
        }
    });

    fs.writeFileSync('all_tables_data.json', JSON.stringify({
        roles,
        permissions,
        rolePermissions
    }, null, 2));
}

checkPermissions()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
