import { PrismaClient } from '@prisma/client';
import { runDataMigrations } from './scripts/run-data-migrations';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed local basado en data migrations...');
  await runDataMigrations();
  console.log('✅ Seed local completado.');
}

main()
  .catch(error => {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
