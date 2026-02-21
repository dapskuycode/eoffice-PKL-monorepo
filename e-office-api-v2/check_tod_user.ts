import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: 'tod@gmail.com' },
      include: {
        userRole: { include: { role: true } }
      }
    });

    if (user) {
      console.log(`User found: ${user.email}`);
      console.log(`ID: ${user.id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Roles: ${user.userRole.map(ur => ur.role.name).join(', ')}`);
    } else {
      console.log("User tod@gmail.com not found!");
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
