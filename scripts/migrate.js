const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function runMigrations() {
  console.log('🔄 Running database migrations...');

  const client = createClient({
    url: process.env.TURSO_DATABASE_URL || 'file:local.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  // Add any future migrations here
  const migrations = [
    // Example migration:
    // {
    //   name: 'add_tags_column',
    //   sql: 'ALTER TABLE entries ADD COLUMN tags TEXT'
    // }
  ];

  try {
    // Create migrations tracking table if it doesn't exist
    await client.execute(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        applied_at INTEGER DEFAULT (unixepoch())
      )
    `);

    // Get applied migrations
    const result = await client.execute('SELECT name FROM migrations');
    const appliedMigrations = new Set(result.rows.map(row => row.name));

    // Run pending migrations
    for (const migration of migrations) {
      if (!appliedMigrations.has(migration.name)) {
        console.log(`⏳ Applying migration: ${migration.name}`);
        await client.execute(migration.sql);
        await client.execute({
          sql: 'INSERT INTO migrations (name) VALUES (?)',
          args: [migration.name]
        });
        console.log(`✅ Applied migration: ${migration.name}`);
      } else {
        console.log(`⏭️  Skipping already applied migration: ${migration.name}`);
      }
    }

    console.log('✨ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
