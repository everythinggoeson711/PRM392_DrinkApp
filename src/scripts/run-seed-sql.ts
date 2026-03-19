import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { readFileSync } from 'fs';
import { join } from 'path';

async function runSeedSql() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER ?? 'user',
    password: process.env.DB_PASSWORD ?? 'password',
    database: process.env.DB_NAME ?? 'drink_order_app',
    synchronize: false,
  });

  await dataSource.initialize();

  try {
    const sqlFilePath = join(__dirname, '../../database/seed.sql');
    const sql = readFileSync(sqlFilePath, 'utf8');

    console.log('Executing seed.sql...');
    await dataSource.query(sql);
    console.log('Seed SQL executed successfully.');
  } finally {
    await dataSource.destroy();
  }
}

runSeedSql().catch((error: unknown) => {
  console.error('Failed to run seed SQL:', error);
  process.exit(1);
});
