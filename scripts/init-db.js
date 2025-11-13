const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function initDatabase() {
  console.log('🗄️  Initializing database...');

  const client = createClient({
    url: process.env.TURSO_DATABASE_URL || 'file:local.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const schema = `
    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY,
      fid INTEGER NOT NULL,
      content TEXT NOT NULL,
      mood TEXT,
      date INTEGER NOT NULL,
      word_count INTEGER DEFAULT 0,
      char_count INTEGER DEFAULT 0,
      is_sealed INTEGER DEFAULT 0,
      sealed_at INTEGER,
      tx_hash TEXT,
      content_hash TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    );

    CREATE INDEX IF NOT EXISTS idx_fid_date ON entries(fid, date DESC);
    CREATE INDEX IF NOT EXISTS idx_sealed ON entries(is_sealed);
    CREATE INDEX IF NOT EXISTS idx_fid_sealed ON entries(fid, is_sealed);
  `;

  try {
    await client.execute(schema);
    console.log('✅ Database initialized successfully');
    console.log('📊 Tables created:');
    console.log('   - entries (with indexes on fid, date, and sealed status)');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }

  // Verify table was created
  try {
    const result = await client.execute('SELECT COUNT(*) as count FROM entries');
    console.log(`📝 Current entry count: ${result.rows[0].count}`);
  } catch (error) {
    console.error('⚠️  Warning: Could not query entries table:', error.message);
  }

  console.log('✨ Database setup complete!');
}

// Run the initialization
initDatabase();
