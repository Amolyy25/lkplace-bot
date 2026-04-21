const db = require('./db');

const categoryMap = new Map();
const claims = new Map();

async function loadFromDb() {
  if (!db.available()) return;
  const cats = await db.query('SELECT type, category_id FROM tickets_config');
  categoryMap.clear();
  for (const row of cats.rows) categoryMap.set(row.type, row.category_id);

  const cs = await db.query('SELECT channel_id, staff_id FROM ticket_claims');
  claims.clear();
  for (const row of cs.rows) claims.set(row.channel_id, row.staff_id);
}

async function setCategory(type, channelId) {
  categoryMap.set(type, channelId);
  await db.query(
    `INSERT INTO tickets_config (type, category_id) VALUES ($1, $2)
     ON CONFLICT (type) DO UPDATE SET category_id = EXCLUDED.category_id`,
    [type, channelId]
  );
}

function getCategory(type) { return categoryMap.get(type); }

function allCategoryIds() { return Array.from(categoryMap.values()); }

async function claim(ticketChannelId, staffId) {
  if (claims.has(ticketChannelId)) return false;
  claims.set(ticketChannelId, staffId);
  await db.query(
    `INSERT INTO ticket_claims (channel_id, staff_id) VALUES ($1, $2)
     ON CONFLICT (channel_id) DO NOTHING`,
    [ticketChannelId, staffId]
  );
  return true;
}

function getClaim(ticketChannelId) { return claims.get(ticketChannelId); }

async function releaseClaim(ticketChannelId) {
  claims.delete(ticketChannelId);
  await db.query('DELETE FROM ticket_claims WHERE channel_id = $1', [ticketChannelId]);
}

module.exports = {
  loadFromDb,
  setCategory, getCategory, allCategoryIds,
  claim, getClaim, releaseClaim,
};
