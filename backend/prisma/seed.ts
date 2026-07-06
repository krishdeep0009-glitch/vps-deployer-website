import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({ where: { username: 'admin' } });
  if (existing) {
    console.log('Default admin already exists, skipping seed.');
    return;
  }

  const passwordHash = await bcrypt.hash('admin', 12);

  await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@localhost',
      passwordHash,
      role: 'SUPER_ADMIN',
      mustChangePassword: true,
    },
  });

  console.log('Seeded default admin (admin/admin). Password change will be forced on first login.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
