import { PrismaClient } from '@prisma/client';
import { runDataMigrations } from './scripts/run-data-migrations';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting local seed based on data migrations...');
  await runDataMigrations();
  console.log('Local seed completed.');
}

main()
  .catch(error => {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
