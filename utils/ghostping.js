const db = require('./db');

const config = {
  channels: new Set(),
  deleteAfterMs: 2_000,
};

async function loadFromDb() {
  if (!db.available()) return;
  const res = await db.query('SELECT channels, delete_after_ms FROM ghostping_config WHERE id = 1');
  const row = res.rows[0];
  if (!row) return;
  config.channels = new Set(row.channels || []);
  config.deleteAfterMs = row.delete_after_ms ?? 2_000;
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

async function sendJoinPings(member) {
  const { channels: chanIds, deleteAfterMs } = getConfig();
  if (!chanIds.length) return;

  await Promise.allSettled(chanIds.map(async (channelId) => {
    const channel = member.guild.channels.cache.get(channelId);
    if (!channel?.isTextBased?.()) return;
    const msg = await channel.send({
      content: `<@${member.id}>`,
      allowedMentions: { users: [member.id] },
    }).catch(() => null);
    if (msg && deleteAfterMs > 0) {
      setTimeout(() => msg.delete().catch(() => {}), deleteAfterMs);
    }
  }));
}

module.exports = {
  loadFromDb, setChannels, setDelay, getConfig, isWatched, sendJoinPings,
};
