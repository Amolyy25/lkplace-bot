const db = require('./db');

const config = {
  channels: new Set(),
  deleteAfterMs: 10_000,
};

async function loadFromDb() {
  if (!db.available()) return;
  const res = await db.query('SELECT channels, delete_after_ms FROM ghostping_config WHERE id = 1');
  const row = res.rows[0];
  if (!row) return;
  config.channels = new Set(row.channels || []);
  config.deleteAfterMs = row.delete_after_ms ?? 10_000;
}

async function persist() {
  if (!db.available()) return;
  await db.query(
    `UPDATE ghostping_config SET channels = $1, delete_after_ms = $2 WHERE id = 1`,
    [Array.from(config.channels), config.deleteAfterMs]
  );
}

async function setChannels(ids) {
  config.channels = new Set(ids);
  await persist();
}

async function setDelay(ms) {
  config.deleteAfterMs = ms;
  await persist();
}

function getConfig() {
  return { channels: Array.from(config.channels), deleteAfterMs: config.deleteAfterMs };
}

function isWatched(channelId) { return config.channels.has(channelId); }

module.exports = { loadFromDb, setChannels, setDelay, getConfig, isWatched };
