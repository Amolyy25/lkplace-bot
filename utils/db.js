const { Pool } = require('pg');
require('dotenv').config();

const url = process.env.DATABASE_URL;
let pool = null;

if (url) {
  const sslNeeded = /sslmode=require|supabase|neon|heroku|render|railway/i.test(url)
    || process.env.DB_SSL === 'true';
  pool = new Pool({
    connectionString: url,
    ssl: sslNeeded ? { rejectUnauthorized: false } : false,
  });
  pool.on('error', err => console.error('[db] pool error:', err.message));
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS sanctions (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  target_tag TEXT,
  moderator_id TEXT,
  moderator_tag TEXT,
  reason TEXT,
  duration_ms BIGINT,
  duration_label TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sanctions_target ON sanctions(target_id);
CREATE INDEX IF NOT EXISTS idx_sanctions_moderator ON sanctions(moderator_id);
CREATE INDEX IF NOT EXISTS idx_sanctions_type ON sanctions(type);

CREATE TABLE IF NOT EXISTS tickets_config (
  type TEXT PRIMARY KEY,
  category_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ticket_claims (
  channel_id TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL,
  claimed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ghostping_config (
  id INT PRIMARY KEY DEFAULT 1,
  channels TEXT[] DEFAULT '{}',
  delete_after_ms INT DEFAULT 10000
);
INSERT INTO ghostping_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
`;

async function init() {
  if (!pool) {
    console.warn('[db] DATABASE_URL non défini — persistance désactivée');
    return false;
  }
  try {
    await pool.query(SCHEMA);
    console.log('[db] schéma prêt');
    return true;
  } catch (e) {
    console.error('[db] erreur init:', e.message);
    return false;
  }
}

async function query(text, params) {
  if (!pool) return { rows: [] };
  try {
    return await pool.query(text, params);
  } catch (e) {
    console.error('[db] erreur query:', e.message);
    return { rows: [] };
  }
}

function available() { return pool !== null; }

module.exports = { init, query, available };
