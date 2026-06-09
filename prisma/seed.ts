import { PrismaClient } from '../src/generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

  if (!superAdminEmail) {
    throw new Error('SUPER_ADMIN_EMAIL is not defined in .env');
  }

  const existing = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  if (existing) {
    console.log(`SuperAdmin already exists: ${superAdminEmail}`);
    return;
  }

  const superAdmin = await prisma.user.create({
    data: {
      email: superAdminEmail,
      name: 'Super Admin',
      role: 'SuperAdmin',
      isVerified: true,
    },
  });

  console.log(` SuperAdmin created: ${superAdmin.email}`);
}

main()
  .catch((e) => {
    console.error(' Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });