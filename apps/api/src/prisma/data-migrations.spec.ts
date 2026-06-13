import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('showcase data migrations', () => {
  const migrationsDir = join(__dirname, '../../prisma/data-migrations');

  const readMigration = (file: string) => readFileSync(join(migrationsDir, file), 'utf8');

  it('mantiene las migraciones demo críticas disponibles para producción', () => {
    for (const file of [
      '009_showcase_demo_dataset.sql',
      '010_showcase_service_street_locations.sql',
      '011_showcase_request_services.sql',
    ]) {
      expect(existsSync(join(migrationsDir, file))).toBe(true);
    }
  });

  it('la migración de solicitudes demo inserta servicios REQUEST idempotentes', () => {
    const sql = readMigration('011_showcase_request_services.sql');

    expect(sql).toContain('REQUEST');
    expect(sql).toMatch(/ON CONFLICT|WHERE NOT EXISTS/i);
    expect(sql).toMatch(/Busco|Necesito/i);
    expect(sql).toMatch(/latitude|longitude/i);
  });

  it('la migración de ubicaciones demo añade direcciones y coordenadas de calle', () => {
    const sql = readMigration('010_showcase_service_street_locations.sql');

    expect(sql).toMatch(/formattedAddress/i);
    expect(sql).toMatch(/latitude/i);
    expect(sql).toMatch(/longitude/i);
    expect(sql).toMatch(/UPDATE\s+services/i);
  });

  it('las migraciones demo no contienen placeholders ni secretos evidentes', () => {
    for (const file of [
      '009_showcase_demo_dataset.sql',
      '010_showcase_service_street_locations.sql',
      '011_showcase_request_services.sql',
    ]) {
      const sql = readMigration(file);
      expect(sql).not.toMatch(/\bTODO\b|\bFIXME\b|changeme|api[_-]?key\s*=|\bsecret\s*=|bearer\s+[a-z0-9._-]+/i);
    }
  });
});
