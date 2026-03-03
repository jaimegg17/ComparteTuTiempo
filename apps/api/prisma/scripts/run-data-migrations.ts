import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

interface AppliedMigration {
  name: string;
  checksum: string;
}

const prisma = new PrismaClient();
const migrationsDir = path.resolve(__dirname, '..', 'data-migrations');

function checksum(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = '';
  let inSingleQuote = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < sql.length; i += 1) {
    const char = sql[i];
    const next = sql[i + 1];

    if (inLineComment) {
      current += char;
      if (char === '\n') {
        inLineComment = false;
      }
      continue;
    }

    if (inBlockComment) {
      current += char;
      if (char === '*' && next === '/') {
        current += next;
        i += 1;
        inBlockComment = false;
      }
      continue;
    }

    if (!inSingleQuote && char === '-' && next === '-') {
      current += char + next;
      i += 1;
      inLineComment = true;
      continue;
    }

    if (!inSingleQuote && char === '/' && next === '*') {
      current += char + next;
      i += 1;
      inBlockComment = true;
      continue;
    }

    if (char === "'") {
      current += char;
      if (inSingleQuote && sql[i - 1] !== '\\') {
        inSingleQuote = false;
      } else if (!inSingleQuote) {
        inSingleQuote = true;
      }
      continue;
    }

    if (char === ';' && !inSingleQuote) {
      const statement = current.trim();
      if (statement.length > 0) {
        statements.push(statement);
      }
      current = '';
      continue;
    }

    current += char;
  }

  const last = current.trim();
  if (last.length > 0) {
    statements.push(last);
  }

  return statements;
}

async function ensureTrackingTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS data_migrations (
      name TEXT PRIMARY KEY,
      checksum TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getAppliedMigration(name: string): Promise<AppliedMigration | null> {
  const rows = await prisma.$queryRawUnsafe<AppliedMigration[]>(
    `SELECT name, checksum FROM data_migrations WHERE name = $1`,
    name,
  );

  return rows[0] ?? null;
}

async function markApplied(name: string, fileChecksum: string) {
  await prisma.$executeRawUnsafe(
    `INSERT INTO data_migrations (name, checksum, applied_at) VALUES ($1, $2, NOW())`,
    name,
    fileChecksum,
  );
}

export async function runDataMigrations() {
  await ensureTrackingTable();

  const entries = await fs.readdir(migrationsDir);
  const sqlFiles = entries.filter(file => file.endsWith('.sql')).sort();

  if (sqlFiles.length === 0) {
    console.log('ℹ️ No hay archivos SQL en prisma/data-migrations.');
    return;
  }

  console.log(`🚀 Ejecutando ${sqlFiles.length} data migration(s)...`);

  for (const fileName of sqlFiles) {
    const filePath = path.join(migrationsDir, fileName);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const fileChecksum = checksum(fileContent);

    const applied = await getAppliedMigration(fileName);

    if (applied) {
      if (applied.checksum !== fileChecksum) {
        throw new Error(
          `La migración ${fileName} ya fue aplicada con otro checksum. ` +
          'Crea un archivo nuevo en lugar de modificar uno existente.',
        );
      }

      console.log(`⏭️  ${fileName} ya aplicada. Se omite.`);
      continue;
    }

    const statements = splitSqlStatements(fileContent);

    if (statements.length === 0) {
      console.log(`⚠️  ${fileName} está vacío. Se marca como aplicada.`);
      await markApplied(fileName, fileChecksum);
      continue;
    }

    console.log(`🧩 Aplicando ${fileName} (${statements.length} sentencia(s))...`);

    await prisma.$transaction(async tx => {
      for (const statement of statements) {
        await tx.$executeRawUnsafe(statement);
      }

      await tx.$executeRawUnsafe(
        `INSERT INTO data_migrations (name, checksum, applied_at) VALUES ($1, $2, NOW())`,
        fileName,
        fileChecksum,
      );
    });

    console.log(`✅ ${fileName} aplicada correctamente.`);
  }

  console.log('🎉 Data migrations completadas.');
}

if (require.main === module) {
  runDataMigrations()
    .catch(error => {
      console.error('❌ Error ejecutando data migrations:', error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
