import { initializeDatabase } from './schema';

export function runMigrations(): void {
  console.log('Running database migrations...');
  initializeDatabase();
  console.log('Migrations complete.');
}
