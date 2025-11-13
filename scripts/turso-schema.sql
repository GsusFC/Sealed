-- Schema para Turso Database (Sealed Diary)
-- Este script crea todas las tablas necesarias para la aplicación

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

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_fid_date ON entries(fid, date DESC);
CREATE INDEX IF NOT EXISTS idx_sealed ON entries(is_sealed);
CREATE INDEX IF NOT EXISTS idx_fid_sealed ON entries(fid, is_sealed);

-- Tabla para tracking de migraciones (opcional, para futuro)
CREATE TABLE IF NOT EXISTS migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  applied_at INTEGER DEFAULT (unixepoch())
);
